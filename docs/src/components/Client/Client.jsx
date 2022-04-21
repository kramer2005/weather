import React, { useEffect, useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/default-highlight'

const Client = () => {
  const [data, setData] = useState('...loading')

  useEffect(() => {
    fetch('/client.py').then(async (response) => {
      setData(await response.text())
    })
  }, [])
  return (
    <div>
      <h2>Client code</h2>
      <SyntaxHighlighter language={'python'} PreTag="code">
        {data}
      </SyntaxHighlighter>
    </div>
  )
}

export default Client
