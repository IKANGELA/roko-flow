import { useEffect, useState } from 'react'
import KlienciList from '../components/KlienciList'
import KlientForm from '../components/KlientForm'
import PasekZaznaczenia from '../components/PasekZaznaczenia'
import { pobierzKlientow, usunKlienta } from '../api'
import { useZaznaczenie } from '../useZaznaczenie'
import { usunZaznaczoneElementy } from '../usunZaznaczone'

function KlienciPage() {
  const [klienci, setKlienci] = useState([])
  const { zaznaczone, przelacz, wyczysc } = useZaznaczenie()

  useEffect(() => {
    pobierzKlientow().then(setKlienci)
  }, [])

  function dodajKlientaDoListy(nowyKlient) {
    setKlienci((poprzedni) => [...poprzedni, nowyKlient])
  }

  async function usunZaznaczonych() {
    if (!window.confirm(`Usunąć ${zaznaczone.size} klientów?`)) {
      return
    }
    const { usunieteId, bledy } = await usunZaznaczoneElementy(
      zaznaczone,
      usunKlienta,
      klienci,
      (k) => k.imie_i_nazwisko,
    )
    setKlienci((poprzedni) => poprzedni.filter((k) => !usunieteId.includes(k.id)))
    wyczysc()
    if (bledy.length > 0) {
      window.alert(`Nie udało się usunąć niektórych klientów:\n${bledy.join('\n')}`)
    }
  }

  return (
    <div>
      <h1>Klienci</h1>
      <KlientForm onUtworzono={dodajKlientaDoListy} />
      <h2>Lista klientów</h2>
      <KlienciList klienci={klienci} zaznaczone={zaznaczone} onPrzelacz={przelacz} />
      <PasekZaznaczenia liczbaZaznaczonych={zaznaczone.size} onUsun={usunZaznaczonych} />
    </div>
  )
}

export default KlienciPage
