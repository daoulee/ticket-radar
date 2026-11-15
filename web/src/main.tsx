import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createApiFromEnvironment } from './api'
import { TossTestReturn } from './components/TossTestCheckout'
import { SharedTossReturn } from './components/SharedTossCheckout'
import { MobileTestPayment, MobileTestPaymentReturn } from './components/MobileTestPayment'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {window.location.pathname === '/toss-test-return' ? <TossTestReturn /> : window.location.pathname === '/shared-toss-return' && import.meta.env.VITE_SHARED_TOSS_TEST === '1' ? <SharedTossReturn /> : window.location.pathname === '/mobile-test-payment' && import.meta.env.VITE_SHARED_TOSS_TEST === '1' ? <MobileTestPayment /> : window.location.pathname === '/mobile-toss-return' && import.meta.env.VITE_SHARED_TOSS_TEST === '1' ? <MobileTestPaymentReturn /> : <App api={createApiFromEnvironment()} />}
  </StrictMode>,
)
