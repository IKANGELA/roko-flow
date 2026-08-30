import { useEffect, useState } from 'react'
import DostawcyList from '../components/DostawcyList'
import DostawcaForm from '../components/DostawcaForm'
import PasekZaznaczenia from '../components/PasekZaznaczenia'
import { pobierzDostawcow, usunDostawce } from '../api'
import { useZaznaczenie } from '../useZaznaczenie'
import { usunZaznaczoneElementy } from '../usunZaznaczone'

function DostawcyPage() {
  const [dostawcy, setDostawcy] = useState([])
  const { zaznaczone, przelacz, wyczysc } = useZaznaczenie()

  useEffect(() => {
    pobierzDostawcow().then(setDostawcy)
  }, [])

  function dodajDostawceDoListy(nowyDostawca) {
    setDostawcy((poprzedni) => [...poprzedni, nowyDostawca])
  }

  function zaktualizowanoDostawce(zaktualizowany) {
    setDostawcy((poprzedni) => poprzedni.map((d) => (d.id === zaktualizowany.id ? zaktualizowany : d)))
  }

  async function usunZaznaczonych() {
    if (!window.confirm(`Usunąć ${zaznaczone.size} dostawców?`)) {
      return
    }
    const { usunieteId, bledy } = await usunZaznaczoneElementy(zaznaczone, usunDostawce, dostawcy, (d) => d.nazwa)
    setDostawcy((poprzedni) => poprzedni.filter((d) => !usunieteId.includes(d.id)))
    wyczysc()
    if (bledy.length > 0) {
      window.alert(`Nie udało się usunąć niektórych dostawców:\n${bledy.join('\n')}`)
    }
  }

  return (
    <div>
      <h1>Dostawcy</h1>
      <DostawcaForm onUtworzono={dodajDostawceDoListy} />
      <DostawcyList
        dostawcy={dostawcy}
        zaznaczone={zaznaczone}
        onPrzelacz={przelacz}
        onZaktualizowano={zaktualizowanoDostawce}
      />
      <PasekZaznaczenia liczbaZaznaczonych={zaznaczone.size} onUsun={usunZaznaczonych} />
    </div>
  )
}

export default DostawcyPage
