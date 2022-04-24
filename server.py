#!/usr/bin/env python3
"""Weather API Server

Request data from OpenWeather and stores it in a cache table for easier access.
"""

from asyncore import write
import socket
import argparse
import signal
from datetime import datetime, timedelta
import select
import requests

__author__ = "Wagner Kramer, Diogo Kraut"


locations_dict = {}

# Parse arguments
parser = argparse.ArgumentParser(description="Simple HTTP Server")
parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
parser.add_argument("--port", default=3000, type=int, help="Port to bind to")
args = parser.parse_args()

log_file = open("log.dat", "w")


def write_message(message):
    """Print log messages"""
    log_file.write(f"[{datetime.now()}]: {message}\n")
    log_file.flush()
    print(f"[{datetime.now()}]: {message}")


def create_response(status_code: int, body: str, type="application/json"):
    """Create HTTP Response
    status_code: The HTTP status code
    body: The response content
    type: The response MIME Type
    """
    response = f"HTTP/1.1 {status_code}\r\n"
    response += "Access-Control-Allow-Origin: *\r\n"
    response += "Content-Type: " + type + "\r\n"
    response += f"Content-Length: {len(body)}\r\n"
    response += "\r\n"
    response += body
    return bytes(response, "utf-8")


def create_socket(host: str, port: int):
    """Create the socket and start listening
    host: Host IP
    port: Port to listen
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind((host, port))
    s.listen(1)
    return s


def user_exit(s: socket, message: str):
    """Close the socket and end the execution
    s: Active socket
    message: Message to print while exiting
    """
    write_message(message)
    s.close()
    log_file.close()
    exit(0)


def send_log(conn: socket):
    """Send log file to the connection
    conn: Connected client
    """
    log_file = open("log.dat", "r")
    str = log_file.read()
    conn.send(create_response(200, str, type="text/plain"))
    log_file.close()
    pass


def decode_location(data: bytes):
    """Decode the requested location
    data: Received header
    """
    try:
        headers, sep, body = data.partition(b'\r\n\r\n')
        headers = headers.decode('latin1')
        params = headers.split('\r\n')[0]
        if "/log" in params:
            return "log"
        path = params.split('location=')[1].split(' ')[0]
        return path
    except Exception as e:
        write_message(f"Exception: {e}")
        return None


def get_coords(location: str):
    """Connect to API to get location coordinates
    location: City to find
    """
    url = "http://api.openweathermap.org/geo/1.0/direct"
    params = {
        'q': location,
        'limit': '1',
        'appid': '71b61c7dff028cb38320bd2d640a3932'
    }
    res = requests.get(url, params)
    data = res.json()
    if len(data) > 0:
        return {"lat": data[0]["lat"], "lon": data[0]["lon"]}
    return None


def get_temperature(location: str):
    """Get temperature for requested location"""
    data = locations_dict.get(location)
    coords = None
    if data == None:
        write_message(f"No previous data for {location}, fetching")
        coords = get_coords(location)
    else:
        if datetime.now() < locations_dict[location]["expiration"]:
            return locations_dict[location]["temp"]
        else:
            write_message(
                f"Weather data for {location} is obsolete, requesting new data")
            coords = locations_dict[location]["coords"]
    if get_temperature_api(location, coords) is None:
        return None
    return locations_dict[location]["temp"]


def get_temperature_api(location, coords):
    """Requests OpenWeather temperature for location and update cache"""
    if coords is None:
        write_message(
            f"No data for {location}, or {location} is not a valid location")
        return None
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        'lat': coords["lat"],
        'lon': coords["lon"],
        'units': 'metric',
        'appid': '71b61c7dff028cb38320bd2d640a3932',
    }
    res = requests.get(url, params)
    data = res.json()
    temp = data["main"]["temp"]
    locations_dict.update(
        {
            location: {
                "coords": coords,
                "temp": temp,
                "expiration": datetime.now() + timedelta(seconds=30)
            }
        })
    return True


def main():
    write_message("Starting server...")
    # Create Socket
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Set option to shutdown socket on exit
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((args.host, args.port))
    server.listen()
    write_message(f"Listening on {args.host}:{args.port}")
    signal.signal(signal.SIGINT, lambda s, f: user_exit(
        server, "Server closing by user"))  # Gracefully exit on CTRL+C
    while True:
        try:
            write_message("Waiting for connection...")
            client, addr = server.accept()

            # Timeout if client don't send any data
            ready = select.select([client], [], [], 0.5)
            if not ready[0]:
                client.send(create_response(408, "Timeout\n"))
                client.close()
                write_message("Timeout")
                continue
            write_message(f"Client connected")
            data = client.recv(1024)

            location = decode_location(data)

            # Invalid URL
            if location is None or location == "":
                write_message(f"Bad Request: Invalid path")
                client.send(create_response(
                    400, "Bad Request: Invalid path\nPlease use weather.kramer.dev.br/api?location=<location>\n"))
                client.close()
                continue

            # Log request
            if location == "log":
                send_log(client)
                write_message(f"Log sent to client")
                client.close()
                continue

            temperature = get_temperature(location)

            # Invalid temperature
            if temperature is None:
                write_message(
                    f"Not Found: Invalid location: {location}")
                client.send(create_response(
                    404, "Not Found: Invalid location\n"))
                client.close()
                continue

            client.send(create_response(
                200, '{"temperature": ' + str(temperature) + '}\n'))
            write_message(f"Temperature for {location} sent")
            client.close()
        except Exception as e:
            if e.errno != 9:
                write_message(f"Exception: {e}")
            break


if __name__ == "__main__":
    main()
