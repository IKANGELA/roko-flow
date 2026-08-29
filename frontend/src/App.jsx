import { useEffect, useState } from 'react'
import KlienciList from './components/KlienciList'
import KlientForm from './components/KlientForm'
import { pobierzKlientow } from './api'

function App() {
  const [klienci, setKlienci] = useState([])

  useEffect(() => {
    pobierzKlientow().then(setKlienci)
  }, [])

  function dodajKlientaDoListy(nowyKlient) {
    setKlienci((poprzedni) => [...poprzedni, nowyKlient])
  }

  return (
    <div>
      <h1>ROKO Flow</h1>
      <h2>Klienci</h2>
      <KlienciList klienci={klienci} />
      <KlientForm onUtworzono={dodajKlientaDoListy} />
    </div>
  )
}

export default App
