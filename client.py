#!/usr/bin/env python3

"""Weather API Client

The Weather API Client can be imported and used to request temperature for a given location from Weather API.
Library usage:
    Import the get_weather function and call it as get_weather(city).

CLI usage:
    client.py <city> [--host=<host>] [--port=<port>]
    city:
        The city can be formated as:
        - <city>, example: 
                python client.py Paris
        - "<city>, <country>", example: 
                python client.py "Paris, FR"
"""

import argparse
import socket
import urllib.parse

__author__ = "Wagner Kramer, Diogo Kraut"


def get_weather(location: str, host: str = "weather.kramer.dev.br", port: int = 80):
    """Request location temperature from Weather API"""
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect((host, port))
    client.send(b'GET /api?location=' + urllib.parse.quote(location).encode() +
                b' HTTP/1.1\r\nHost: ' + host.encode() + b'\r\n\r\n')
    response = client.recv(1024)
    response = response.decode('utf-8')
    if "404" in response:
        return "Invalid location"
    temperature = response.split("temperature\": ")[1].split("}")[0]
    client.close()
    return float(temperature)


if __name__ == "__main__":
    # Parse arguments
    parser = argparse.ArgumentParser(description="Simple HTTP Server")
    parser.add_argument("location", help="Location to request temperature")
    parser.add_argument("--host", default="weather.kramer.dev.br", help="Host to bind to")
    parser.add_argument("--port", default=80,
                        type=int, help="Port to bind to")
    args = parser.parse_args()
    print(get_weather(args.location, args.host, args.port))
