import './polyfills'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { removeKeys } from './utils/storage'

// Ogni apertura del sito riparte "pulita": chat vuota. Puliamo lo stato
// persistito UNA VOLTA al boot, prima del render; durante la sessione la
// persistenza resta attiva, così cambiare tab non azzera una conversazione
// in corso. Le preferenze (tema, lingua) restano salvate.
removeKeys(['assistantConversation'])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
