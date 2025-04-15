import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwind.css'
import App from './App.jsx'


console.log("🚀 React starting");
const root = document.getElementById('root');
console.log("Root element:", root);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
