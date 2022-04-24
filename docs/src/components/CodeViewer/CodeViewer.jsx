import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/default-highlight'
import styled from 'styled-components'

const Highlighter = styled(SyntaxHighlighter)`
  width: 100%;
`

const CodeViewer = ({ children, language }) => {
  return (
    <Highlighter language={language || 'python'} PreTag="code">
      {children}
    </Highlighter>
  )
}

export default CodeViewer
