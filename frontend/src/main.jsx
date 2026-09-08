import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// HashRouter (adresy z #, np. /#/kosztorysy), nie BrowserRouter — GitHub Pages to zwykły
// hosting plików statycznych, bez przekierowań po stronie serwera, więc "czyste" adresy
// (BrowserRouter) dawałyby błąd 404 po odświeżeniu strony na podstronie innej niż główna.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
