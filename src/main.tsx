import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Onboarding from './components/Onboarding'
import './index.css'

const SEEN_KEY = 'dailyflow-onboarding-done'

function Root() {
  const [done, setDone] = useState(() => localStorage.getItem(SEEN_KEY) === '1')

  const finish = () => {
    localStorage.setItem(SEEN_KEY, '1')
    setDone(true)
  }

  return done ? <App /> : <Onboarding onDone={finish} />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
