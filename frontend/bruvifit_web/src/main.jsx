import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { getSafeInitialPath } from './shared/auth/navigation-entry.js'
import '@fontsource-variable/montserrat'
import '@fontsource-variable/manrope'
import './styles/tokens.css'
import './styles/global.css'

const root = createRoot(document.getElementById('root'));

root.render(<main role="status" aria-live="polite" className="app-startup">Carregando o BruVi Fit…</main>);

function startApplication() {
  const safePath = getSafeInitialPath(window.location.pathname);
  if (safePath) window.history.replaceState(null, '', safePath);

  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

startApplication();
