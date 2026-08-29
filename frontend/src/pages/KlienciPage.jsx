import { useEffect, useState } from 'react'
import KlienciList from '../components/KlienciList'
import KlientForm from '../components/KlientForm'
import { pobierzKlientow, usunKlienta } from '../api'

function KlienciPage() {
  const [klienci, setKlienci] = useState([])

  useEffect(() => {
    pobierzKlientow().then(setKlienci)
  }, [])

  function dodajKlientaDoListy(nowyKlient) {
    setKlienci((poprzedni) => [...poprzedni, nowyKlient])
  }

  async function usunZListy(klient) {
    if (!window.confirm(`Usunąć klienta „${klient.imie_i_nazwisko}"?`)) {
      return
    }
    try {
      await usunKlienta(klient.id)
      setKlienci((poprzedni) => poprzedni.filter((k) => k.id !== klient.id))
    } catch (e) {
      window.alert(e.message)
    }
  }

  return (
    <div>
      <h1>Klienci</h1>
      <KlientForm onUtworzono={dodajKlientaDoListy} />
      <h2>Lista klientów</h2>
      <KlienciList klienci={klienci} onUsun={usunZListy} />
    </div>
  )
}

export default KlienciPage
