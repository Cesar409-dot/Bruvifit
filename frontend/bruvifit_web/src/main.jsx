import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { restoreSession } from './pages/acesso/api/authRepository.js'
import { session } from './shared/auth/session.js'
import { getSafeInitialPath } from './shared/auth/navigation-entry.js'
import '@fontsource-variable/montserrat'
import '@fontsource-variable/manrope'
import './styles/tokens.css'
import './styles/global.css'

async function startApplication() {
  const safePath = getSafeInitialPath(window.location.pathname);
  if (safePath) window.history.replaceState(null, '', safePath);

  try {
    session.setSession(await restoreSession());
  } catch {
    session.clearSession();
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

void startApplication();
