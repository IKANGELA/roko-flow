import { useEffect, useState } from 'react'
import KlienciList from '../components/KlienciList'
import KlientForm from '../components/KlientForm'
import { pobierzKlientow } from '../api'

function KlienciPage() {
  const [klienci, setKlienci] = useState([])

  useEffect(() => {
    pobierzKlientow().then(setKlienci)
  }, [])

  function dodajKlientaDoListy(nowyKlient) {
    setKlienci((poprzedni) => [...poprzedni, nowyKlient])
  }

  return (
    <div>
      <h1>Klienci</h1>
      <KlientForm onUtworzono={dodajKlientaDoListy} />
      <h2>Lista klientów</h2>
      <KlienciList klienci={klienci} />
    </div>
  )
}

export default KlienciPage
