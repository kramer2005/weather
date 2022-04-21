import socket
from time import sleep
from enum import Enum


class Weather(Enum):
    London = "london"
    Paris = "paris"
    NewYork = "newyork"


def get_weather(location):
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect(('54.237.151.129', 80))
    client.send(b'GET /' + location.encode() +
                b' HTTP/1.1\r\nHost: weather.kramer.dev.br\r\n\r\n')
    response = client.recv(1024)
    client.close()
    return response.decode('utf-8')


def main():
    print(get_weather(Weather.London.value))
    print(get_weather(Weather.Paris.value))
    print(get_weather(Weather.NewYork.value))
    sleep(1)


if __name__ == '__main__':
    main()
