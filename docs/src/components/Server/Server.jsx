import React, { useEffect, useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/default-highlight'

const Server = () => {
  const [data, setData] = useState('...loading')

  useEffect(() => {
    fetch('server.py').then(async (response) => {
      setData(await response.text())
    })
  }, [])
  return (
    <div>
      <h2>Server Code</h2>
      <SyntaxHighlighter language={'python'} PreTag="code">
        {data}
      </SyntaxHighlighter>
    </div>
  )
}

export default Server
