import React from 'react'
import { BrowserRouter } from 'react-router-dom'

const LinkWrapper = (
  props: { children: React.ReactNode }
): React.JSX.Element => (
    <BrowserRouter>
      {props.children}
    </BrowserRouter>
  )

export default LinkWrapper
