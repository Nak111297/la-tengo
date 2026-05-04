import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Buzz from './screens/Buzz.tsx'

const isBuzzPage = window.location.pathname === '/buzz';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isBuzzPage ? <Buzz /> : <App />}
  </StrictMode>,
)
