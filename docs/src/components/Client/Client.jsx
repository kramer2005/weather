import React from 'react'
import CodeViewer from '../CodeViewer/CodeViewer'

const Client = () => {
  return (
    <>
      <h2>Código do cliente</h2>
      <a href="client.py.txt" target={'_blank'}>
        Download
      </a>
      <p>
        O código do cliente é muito simples, ele apenas envia uma requisição
        HTTP para o servidor (por padrão não é utilizado HTTPS nele para
        simplificar a solicitação). Abaixo está o código do cliente comentado em
        português:
      </p>
      <CodeViewer language={'python'}>{`
def get_weather(location: str, host: str = "weather.kramer.dev.br", port: int = 80):
    # Cria Socket
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    # Conecta ao servidor
    client.connect(('weather.kramer.dev.br', 80))
    
    # Envia requisição
    client.send(b'GET /api?location=' + urllib.parse.quote(location).encode() +
                b' HTTP/1.1\\r\\nHost: ' + host.encode() + b'\\r\\n\\r\\n')
    
    # Recebe resposta
    response = client.recv(1024)
    response = response.decode('utf-8')

    # Fecha conexão
    client.close()
    
    # Se a resposta não for válida, retorna erro
    if "404" in response:
        return "Invalid location"
    
    # Se a resposta for válida, retorna temperatura
    temperature = response.split("temperature\\": ")[1].split("}")[0]
    return float(temperature)`}</CodeViewer>
    </>
  )
}

export default Client
