#!/usr/bin/env python3

"""Weather API Client

The Weather API Client can be imported and used to request temperature for a given location from Weather API.
Library usage:
    Import the get_weather function and call it as get_weather(city).

CLI usage:
    client.py <city>
    city:
        The city can be formated as:
        - <city>, example: 
                python client.py Paris
        - "<city>, <country>", example: 
                python client.py "Paris, FR"
"""

import os
import sys
import socket
import urllib.parse


def get_weather(location: str):
    """Request location temperature from Weather API"""
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect(('weather.kramer.dev.br', 80))
    client.send(b'GET /api?location=' + urllib.parse.quote(location).encode() +
                b' HTTP/1.1\r\nHost: weather.kramer.dev.br\r\n\r\n')
    response = client.recv(1024)
    response = response.decode('utf-8')
    if len(response.split("404")) > 1:
        return "Invalid location"
    temperature = response.split("temperature\": ")[1].split("}")[0]
    client.close()
    return float(temperature)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(get_weather(sys.argv[1]))
    else:
        print("Utilização: " + __file__ + " <cidade>")
        print("cidade:")
        print("\tA cidade pode estar formatada como:")
        print("\t - <cidade>, exemplo: \n\t\tpython " + __file__ + " Paris")
        print("\t - \"<cidade>, <Sigla do país>\", exemplo: \n\t\tpython " +
              __file__ + " \"Paris, FR\"")
