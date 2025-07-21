import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChatBot from './components/chatbot.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ChatBot></ChatBot>
    </>
  )
}

export default App
