import React from 'react'
import { BrowserRouter } from 'react-router-dom'

const LinkWrapper = (props: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {props.children}
    </BrowserRouter>
  )
}

export default LinkWrapper
