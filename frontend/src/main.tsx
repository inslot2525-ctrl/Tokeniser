import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

import './styles/variables.css'
import './styles/index.css'
import './styles/animations.css'
import './styles/layout.css'
import './styles/responsive.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
