import os
import sys
import socket
import urllib.parse


def get_weather(location):
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect(('weather.kramer.dev.br', 80))
    client.send(b'GET /' + urllib.parse.quote(location).encode() +
                b' HTTP/1.1\r\nHost: weather.kramer.dev.br\r\n\r\n')
    response = client.recv(1024)
    response = response.decode('utf-8')
    if len(response.split("404")) > 1:
        return "Invalid location"
    temperature = response.split("temperature\": ")[1].split("}")[0]
    client.close()
    return temperature


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
