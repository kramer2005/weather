import React from 'react'
import CodeViewer from '../CodeViewer/CodeViewer'

const Server = () => {
  return (
    <>
      <h2>Código do servidor</h2>
      <a href="server.py.txt" target={'_blank'}>
        Download
      </a>
      <p>
        O código do servidor é muito mais complexo do que o do cliente, para
        simplificar o entendimento, estará dividido em partes.
      </p>
      <h3>Logging:</h3>
      <p>
        Para a criação dos logs, utiliza-se a função write_message, que escreve
        em um arquivo e no terminal. O código utilizado é este:
      </p>
      <CodeViewer language={'python'}>{`
log_file = open("log.dat", "w")


def write_message(message):
    """Print log messages"""
    
    # Escreve no arquivo de log
    log_file.write(f"[{datetime.now()}]: {message}\\n")

    # Não mantém a saída em memória, evitando perdas em caso de queda.
    log_file.flush()

    # Escreve no terminal
    print(f"[{datetime.now()}]: {message}")

`}</CodeViewer>
      <p>
        O log atual da aplicação pode ser consultado{' '}
        <a
          href="https://weather.kramer.dev.br/logs"
          target={'_blank'}
          rel="noreferrer"
        >
          aqui
        </a>
        .
      </p>
      <p>Abaixo está um exemplo de log comentado:</p>
      <CodeViewer language={'text'}>{`
[2022-04-24 18:08:42.533564]: Starting server...                                                  # Início do servidor
[2022-04-24 18:08:42.533619]: Listening on 0.0.0.0:3000                                           # Ouvindo na porta 3000
[2022-04-24 18:08:42.533663]: Waiting for connection...                                           # Esperando conexão
[2022-04-24 18:08:45.889431]: Client connected                                                    # Cliente conectado
[2022-04-24 18:08:45.889493]: No previous data for invalid-city, fetching                         # Buscando dados para cidade inválida
[2022-04-24 18:08:46.491762]: No data for invalid-city, or invalid-city is not a valid location   # Cidade não encontrada, retorna 404
[2022-04-24 18:08:46.492100]: Waiting for connection...                                           # Esperando conexão
[2022-04-24 18:09:16.153838]: Client connected                                                    # Cliente conectado
[2022-04-24 18:09:16.153924]: Exception: list index out of range                                  # Erro na leitura da URL
[2022-04-24 18:09:16.153954]: Bad Request: Invalid path                                           # A URL é inválida
[2022-04-24 18:09:16.154070]: Waiting for connection...                                           # Esperando conexão
[2022-04-24 18:09:16.655586]: Timeout                                                             # Tempo limite excedido, cliente não mandou dados
[2022-04-24 18:09:16.655739]: Waiting for connection...                                           # Esperando conexão
[2022-04-24 18:09:30.950526]: Client connected                                                    # Cliente conectado
[2022-04-24 18:09:30.950595]: No previous data for curitiba, fetching                             # Buscando dados para cidade curitiba
[2022-04-24 18:09:32.670555]: Temperature for curitiba sent                                       # Dados para cidade curitiba enviados
[2022-04-24 18:09:32.670833]: Waiting for connection...                                           # Esperando conexão
[2022-04-24 18:09:33.522224]: Client connected                                                    # Cliente conectado
[2022-04-24 18:09:33.522371]: Temperature for curitiba sent                                       # Dados para cidade curitiba enviados
[2022-04-24 18:09:33.522423]: Waiting for connection...                                           # Esperando conexão
[2022-04-24 18:09:34.569073]: Client connected                                                    # Cliente conectado
[2022-04-24 18:09:34.569129]: Log sent to client                                                  # Log enviado para o cliente
[2022-04-24 18:09:34.569183]: Waiting for connection...                                           # Esperando conexão
[2022-04-24 18:50:35.569073]: Client connected                                                    # Cliente conectado
[2022-04-24 18:50:35.569129]: Weather data for curitiba is obsolete, requesting new data          # Entrada para curitiba obsoleta, solicitando nova entrada
[2022-04-24 18:50:33.576542]: Temperature for curitiba sent                                       # Dados para cidade curitiba enviados
[2022-04-24 18:50:36.601051]: Server closing by user                                              # Fechando o servidor pelo usuário

`}</CodeViewer>
      <h3>Inicialização, conexão e recebimento de dados:</h3>
      <p>
        O servidor é inicializado com a função main, que cria um socket e
        escuta. Sempre que chega uma nova localização, o servidor decodifica o
        que foi solicitado e devolve os dados. O código utilizado é este:
      </p>
      <CodeViewer language={'python'}>{`
def main():
    # Avisa que está iniciando
    write_message("Starting server...")

    # Cria o socket
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Define a opção para encerrar o socket quando o programa terminar
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # Define o endereço e a porta do socket
    server.bind((args.host, args.port))

    # Escuta
    server.listen()
    write_message(f"Listening on {args.host}:{args.port}")

    # Encerra o servidor quando o programa terminar
    signal.signal(signal.SIGINT, lambda s, f: user_exit(
        server, "Server closing by user"))

    while True:
        try:
            # Aguarda conexão
            write_message("Waiting for connection...")
            client, addr = server.accept()

            # Se o cliente não envia dados, encerra a conexão com timeout
            ready = select.select([client], [], [], 0.5)
            if not ready[0]:
                client.send(create_response(408, "Timeout\\n"))
                client.close()
                write_message("Timeout")
                continue
            write_message(f"Client connected")

            # Recebe os dados
            data = client.recv(1024)

            # Decodifica os dados
            location = decode_location(data)

            # Se a localização é inválida, envia uma resposta com erro 400
            if location is None or location == "":
                write_message(f"Bad Request: Invalid path")
                client.send(create_response(
                    400, "Bad Request: Invalid path\\nPlease use /api?location=<location>\\n"))
                client.close()
                continue

            # Se o usuário requisitou o log, envia o arquivo de log
            if location == "log":
                send_log(client)
                write_message(f"Log sent to client")
                client.close()
                continue

            # Busca a temperatura para a localização
            temperature = get_temperature(location)

            # Trata local não encontrado
            if temperature is None:
                client.send(create_response(
                    404, "Not Found: Invalid location\\n"))
                client.close()
                continue

            # Envia a temperatura
            client.send(create_response(
                200, '{"temperature": ' + str(temperature) + '}\\n'))
            write_message(f"Temperature for {location} sent")

            # Encerra a conexão
            client.close()
        except Exception as e:
            # Se ocorreu algum erro, escreve no log e encerra o processo
            if e.errno != 9:
                write_message(f"Exception: {e}")
            break

`}</CodeViewer>
      <h3>Decodificação dos dados</h3>
      <p>
        Para decodificar o que foi requisitado, primeiro é verificado se o que
        foi pedido foi uma localização ou o log.
      </p>
      <CodeViewer language={'python'}>{`
def decode_location(data: bytes):
    try:
        # Separa o cabeçalho e o corpo
        headers, sep, body = data.partition(b'\\r\\n\\r\\n')

        # Decodifica o cabeçalho
        headers = headers.decode('latin1')
        params = headers.split('\\r\\n')[0]

        # Verifica se o log foi requisitado
        if "/log" in params:
            return "log"

        # Verifica se a localização foi requisitada
        path = params.split('location=')[1].split(' ')[0]
        return path
    except Exception as e:
        # Se ocorreu algum erro, retorna None e escreve no log
        write_message(f"Exception: {e}")
        return None

`}</CodeViewer>
      <h3>Criação de resposta</h3>
      <p>
        A criação de resposta é muito simples, apenas é criado o cabeçalho HTTP
        padrão, variando apenas o código de status e o corpo. Para o envio do
        log é lido o arquivo de log e enviado para o cliente com MIME type
        text/plain. Para o envio da temperatura é criado um JSON com a
        temperatura e enviado para o cliente.
      </p>
      <CodeViewer language={'python'}>{`
def create_response(status_code: int, body: str, type="application/json"):
# Status da resposta
response = f"HTTP/1.1 {status_code}\\r\\n"
# Acesso de qualquer local
response += "Access-Control-Allow-Origin: *\\r\\n"
# MIME type
response += "Content-Type: " + type + "\\r\\n"
# Tamanho do corpo
response += f"Content-Length: {len(body)}\\r\\n"
response += "\\r\\n"
# Corpo da resposta
response += body
return bytes(response, "utf-8")

`}</CodeViewer>
      <h3>A tabela cache</h3>
      <p>
        A tabela cache é implementada a partir de um dicionário em Python. Cada
        entrada do dicionário é indexada pelo nome da cidade, e contém uma tupla
        com o tempo de expiração e a temperatura.
      </p>
      <p>
        Os dados da tabela cache vem da OpenWeatherMap API. Os métodos para
        atualizar a tabela cache e enviar os dados corretos são os seguintes:
      </p>
      <CodeViewer language={'python'}>{`

locations_dict = {}


def get_temperature(location: str):
    # Verifica se a localização está na tabela cache
    data = locations_dict.get(location)
    coords = None

    # Se a localização não está na tabela cache, busca as coordenadas
    if data == None:
        write_message(f"No previous data for {location}, fetching")
        coords = get_coords(location)
    else:
        # Se a localização está na tabela cache, verifica se ainda é válida
        if datetime.now() < locations_dict[location]["expiration"]:
            return locations_dict[location]["temp"]
        else:
            # Se a entrada está expirada, seta as coordenadas para nova busca
            write_message(
                f"Weather data for {location} is obsolete, requesting new data")
            coords = locations_dict[location]["coords"]
    # Atualiza a tabela cache
    # Se as coordenadas não foram encontradas, retorna None
    if get_temperature_api(location, coords) is None:
        return None
    # Se as coordenadas foram encontradas, retorna a temperatura atualizada
    return locations_dict[location]["temp"]


def get_temperature_api(location, coords):
    # Se as coordenadas não foram encontradas, retorna None
    if coords is None:
        write_message(
            f"No data for {location}, or {location} is not a valid location")
        return None
    # Busca a temperatura na API
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
    # Atualiza a tabela cache com o tempo de expiração e a temperatura
    locations_dict.update(
        {
            location: {
                "coords": coords,
                "temp": temp,
                "expiration": datetime.now() + timedelta(seconds=30)
            }
        })
    return True

`}</CodeViewer>
    </>
  )
}

export default Server
