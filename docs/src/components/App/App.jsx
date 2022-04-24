import React from 'react'
import Client from '../Client/Client'
import Server from '../Server/Server'
import Temperature from '../Widgets/Temperature'

const App = () => {
  return (
    <>
      <Temperature />
      <Client />
      <Server />
    </>
  )
}

export default App
