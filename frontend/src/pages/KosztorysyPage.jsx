import { useEffect, useState } from 'react'
import KosztorysyList from '../components/KosztorysyList'
import KosztorysForm from '../components/KosztorysForm'
import { pobierzKosztorysy } from '../api'

function KosztorysyPage() {
  const [kosztorysy, setKosztorysy] = useState([])
  const [widok, setWidok] = useState('lista') // 'lista' | 'nowy' | 'edytuj'
  const [wybranyKosztorys, setWybranyKosztorys] = useState(null)

  useEffect(() => {
    pobierzKosztorysy().then(setKosztorysy)
  }, [])

  function wrocDoListy() {
    setWidok('lista')
    setWybranyKosztorys(null)
  }

  function zapisanoKosztorys(zapisany) {
    setKosztorysy((poprzednie) => {
      const juzIstnieje = poprzednie.some((k) => k.id === zapisany.id)
      return juzIstnieje
        ? poprzednie.map((k) => (k.id === zapisany.id ? zapisany : k))
        : [...poprzednie, zapisany]
    })
    wrocDoListy()
  }

  function otworzDoEdycji(kosztorys) {
    setWybranyKosztorys(kosztorys)
    setWidok('edytuj')
  }

  if (widok === 'nowy' || widok === 'edytuj') {
    return (
      <div>
        <button type="button" onClick={wrocDoListy}>
          ← Powrót do listy kosztorysów
        </button>
        <h1>{widok === 'edytuj' ? `Edycja kosztorysu ${wybranyKosztorys.numer}` : 'Nowy kosztorys'}</h1>
        <KosztorysForm
          kosztorys={widok === 'edytuj' ? wybranyKosztorys : null}
          onZapisano={zapisanoKosztorys}
        />
      </div>
    )
  }

  return (
    <div>
      <h1>Kosztorysy</h1>
      <button type="button" onClick={() => setWidok('nowy')}>
        + Dodaj kosztorys
      </button>
      <h2>Lista kosztorysów</h2>
      <p>
        <em>Kliknij wiersz, żeby otworzyć kosztorys do edycji.</em>
      </p>
      <KosztorysyList kosztorysy={kosztorysy} onWybierz={otworzDoEdycji} />
    </div>
  )
}

export default KosztorysyPage
