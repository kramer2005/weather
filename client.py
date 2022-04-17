import socket
from time import sleep
from enum import Enum

class Weather(Enum):
    London = "london"
    Paris = "paris"
    NewYork = "newyork"


def get_weather(location):
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect((socket.gethostbyname("localhost"), 3143))
    client.send(b'GET /api?location=' + location.encode('utf-8') + b'\r\n\r\n')
    data = client.recv(1024)
    print(data.decode("utf-8"))
    client.close()


def main():
    get_weather(Weather.London.value)
    get_weather(Weather.Paris.value)
    get_weather(Weather.NewYork.value)
    sleep(1)


if __name__ == '__main__':
    main()
