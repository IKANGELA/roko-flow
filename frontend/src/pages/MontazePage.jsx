import { useEffect, useState } from 'react'
import MontazeList from '../components/MontazeList'
import MontazForm from '../components/MontazForm'
import PasekZaznaczenia from '../components/PasekZaznaczenia'
import { pobierzMontaze, usunMontaz } from '../api'
import { useZaznaczenie } from '../useZaznaczenie'
import { usunZaznaczoneElementy } from '../usunZaznaczone'

function MontazePage() {
  const [montaze, setMontaze] = useState([])
  const [widok, setWidok] = useState('lista') // 'lista' | 'nowy' | 'edytuj'
  const [wybranyMontaz, setWybranyMontaz] = useState(null)
  const { zaznaczone, przelacz, wyczysc } = useZaznaczenie()

  useEffect(() => {
    pobierzMontaze().then(setMontaze)
  }, [])

  function wrocDoListy() {
    setWidok('lista')
    setWybranyMontaz(null)
  }

  function zapisanoMontaz(zapisany) {
    setMontaze((poprzednie) => {
      const juzIstnieje = poprzednie.some((m) => m.id === zapisany.id)
      return juzIstnieje
        ? poprzednie.map((m) => (m.id === zapisany.id ? zapisany : m))
        : [...poprzednie, zapisany]
    })
    wrocDoListy()
  }

  function otworzDoEdycji(montaz) {
    setWybranyMontaz(montaz)
    setWidok('edytuj')
  }

  async function usunZaznaczone() {
    if (!window.confirm(`Usunąć ${zaznaczone.size} montaży?`)) {
      return
    }
    const { usunieteId, bledy } = await usunZaznaczoneElementy(
      zaznaczone,
      usunMontaz,
      montaze,
      (m) => m.kosztorys.numer,
    )
    setMontaze((poprzednie) => poprzednie.filter((m) => !usunieteId.includes(m.id)))
    wyczysc()
    if (bledy.length > 0) {
      window.alert(`Nie udało się usunąć niektórych montaży:\n${bledy.join('\n')}`)
    }
  }

  if (widok === 'nowy' || widok === 'edytuj') {
    return (
      <div>
        <button type="button" onClick={wrocDoListy}>
          ← Powrót do listy montaży
        </button>
        <h1>{widok === 'edytuj' ? 'Edycja montażu' : 'Nowy montaż'}</h1>
        <MontazForm montaz={widok === 'edytuj' ? wybranyMontaz : null} onZapisano={zapisanoMontaz} />
      </div>
    )
  }

  return (
    <div>
      <h1>Montaże</h1>
      <button type="button" onClick={() => setWidok('nowy')}>
        + Dodaj montaż
      </button>
      <h2>Lista montaży</h2>
      <p>
        <em>Kliknij wiersz, żeby otworzyć montaż do edycji.</em>
      </p>
      <MontazeList montaze={montaze} onWybierz={otworzDoEdycji} zaznaczone={zaznaczone} onPrzelacz={przelacz} />
      <PasekZaznaczenia liczbaZaznaczonych={zaznaczone.size} onUsun={usunZaznaczone} />
    </div>
  )
}

export default MontazePage
