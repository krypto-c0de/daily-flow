import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('index.tsx loaded')

const root = document.getElementById('root')

if (root) {
  const App = () =>  <div style={{ padding: '20px', fontSize: '20px', backgroundColor: 'red', color: 'white' }}>Index App Works!</div>
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
