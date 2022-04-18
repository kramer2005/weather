from asyncore import write
from numpy import random
import socket
import argparse
import signal
from datetime import datetime, timedelta
import client
import select

weather = {
    client.Weather.London.value: [datetime.now() - timedelta(seconds=1), 0],
    client.Weather.Paris.value: [datetime.now() - timedelta(seconds=1), 0],
    client.Weather.NewYork.value: [datetime.now() - timedelta(seconds=1), 0]
}


# Parse arguments
parser = argparse.ArgumentParser(description="Simple HTTP Server")
parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
parser.add_argument("--port", default=3000, type=int, help="Port to bind to")
args = parser.parse_args()

log_file = open("log.dat", "w")


def write_message(message):
    log_file.write(f"[{datetime.now()}]: {message}\n")
    log_file.flush()
    print(f"[{datetime.now()}]: {message}")


def create_response(status_code, body, type="application/json"):
    response = f"HTTP/1.1 {status_code}\r\n"
    response += "Content-Type: " + type + "\r\n"
    response += f"Content-Length: {len(body)}\r\n"
    response += "\r\n"
    response += body
    return bytes(response, "utf-8")


def create_socket(host, port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind((host, port))
    s.listen(1)
    return s


def user_exit(s, message):
    write_message(message)
    s.close()
    log_file.close()
    exit(0)


def get_temperature(location):
    if not weather.get(location):
        write_message(f"No weather data for {location}")
        return None
    if datetime.now() < weather[location][0]:
        return weather[location][1]
    write_message(
        f"Weather data for {location} is too old, requesting new data")
    weather[location][0] = datetime.now() + timedelta(seconds=1)
    weather[location][1] = random.randint(16, 28)
    return weather[location][1]


def send_log(conn):
    log_file = open("log.dat", "r")
    str = log_file.read()
    conn.send(create_response(200, str, type="text/plain"))
    log_file.close()
    pass


def decode_location(data):
    try:
        headers, sep, body = data.partition(b'\r\n\r\n')
        headers = headers.decode('latin1')
        params = headers.split('\r\n')[0]
        path = params.split(' /')[1].split(' ')[0]
        return path
    except Exception as e:
        write_message(f"Exception: {e}")
        return None


def main():
    write_message("Starting server...")
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((args.host, args.port))
    server.listen()
    write_message(f"Listening on {args.host}:{args.port}")
    signal.signal(signal.SIGINT, lambda s, f: user_exit(
        server, "Server closing by user"))
    while True:
        try:
            print("Waiting for connection...")
            client, addr = server.accept()
            ready = select.select([client], [], [], 0.5)
            if not ready[0]:
                client.send(create_response(408, "Timeout\n"))
                client.close()
                write_message("Timeout")
                continue
            write_message(f"Client connected from {addr}")
            data = client.recv(1024)

            location = decode_location(data)
            if location == "log":
                send_log(client)
                write_message(f"Log sent to {addr}")
                client.close()
                continue

            if location is None:
                write_message(f"Bad Request: Invalid path from {addr}")
                client.send(create_response(
                    400, "Bad Request: Invalid path\nPlease use /api?location=<location>\n"))
                client.close()
                continue

            temperature = get_temperature(location)
            if temperature is None:
                write_message(f"Not Found: Invalid location from {addr}")
                client.send(create_response(
                    404, "Not Found: Invalid location\n"))
                client.close()
                continue

            client.send(create_response(
                200, '{"temperature": ' + str(temperature) + '}\n'))
            client.close()
        except Exception as e:
            if e.errno != 9:
                write_message(f"Exception: {e}")
            break


if __name__ == "__main__":
    main()
