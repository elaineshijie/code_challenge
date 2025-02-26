import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CryptoSwapForm from './currencyForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="w-full">
      <CryptoSwapForm />
    </div>
  )
}

export default App
