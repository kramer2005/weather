import React from 'react'
import styled from 'styled-components'
import Client from '../Client/Client'
import CodeViewer from '../CodeViewer/CodeViewer'
import Content from '../Content/Content'
import Header from '../Header/Header'
import Server from '../Server/Server'
import Temperature from '../Widgets/Temperature'
import { Container } from './styled'

const Background = styled.img`
  position: sticky;
  top: 0;
  z-index: -4;
  width: 100%;
  height: 100vh;
  background: url(bg.jpg) no-repeat center center fixed;
  filter: blur(1rem);
  -webkit-filter: blur(1rem);
`

const App = () => {
  return (
    <>
      <Background />
      <Container>
        <Header />
        <Temperature />
        <Content>
          <h2>Introdução e utilização</h2>
          <p>A API Weather é um serviço de consulta de temperatura.</p>
          <p>
            Para utilizar o serviço, pode-se usar o{' '}
            <a href="client.py.txt" target={'_blank'}>
              cliente
            </a>{' '}
            ou fazer uma requisição HTTP para
            https://weather.kramer.dev.br/api?location=&lt;<b>Cidade</b>
            &gt;.
          </p>
          <p>
            Exemplo:{' '}
            <a
              href="https://weather.kramer.dev.br/api?location=Curitiba"
              target="__blank"
            >
              https://weather.kramer.dev.br/api?location=Curitiba
            </a>
          </p>
          <h2>Considerações iniciais e propósito do desenvolvimento</h2>
          <p>
            Como a ideia do projeto era a implementação de um socket TCP/IP e
            uma tabela cache simples, nos propusemos a oferecer um pouco mais do
            que isso. Estudamos a estrutura do HTTP e implementamos com socket
            uma API que não apenas pode ser acessada por um socket comum (como o
            do cliente), mas também pode ser utilizada por qualquer aplicação
            que possa fazer solicitação HTTP, como é o caso desta página de
            documentação (se liberou o acesso à localização do seu dispositivo,
            poderá ver a temperatura atual da sua cidade no card acima).
          </p>
          <p>
            Como o objetivo é que fosse expansível caso quiséssemos continuar o
            projeto e que fosse facilmente utilizado em aplicações WEB, a
            resposta é dada por um JSON como segue:
          </p>
          <CodeViewer language={'json'}>{`
{
  "temperature": 20
}
            `}</CodeViewer>
          <p>
            Para expandir a aplicação e adicionar mais informações climáticas,
            basta adicionar uma nova entrada no JSON, como por exemplo pressão
            ou chance de chover.
          </p>
          <p>
            O servidor está rodando em um container Docker e hospedado em uma
            máquina virtual na AWS.
          </p>
          <h2>Diagrama de Sequência</h2>
          <p>
            O diagrama de sequência ilustra a ordem das operações realizadas
            pelo cliente/servidor para os diferentes estados dos dados na cache.
          </p>
          <img
            src="sequence.jpg"
            alt="Diagrama de sequência."
            width="100%"
            height="auto"
          />
          <Client />
          <Server />
        </Content>
      </Container>
    </>
  )
}

export default App
