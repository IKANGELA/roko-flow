import { useEffect, useState } from 'react'
import KosztorysyList from '../components/KosztorysyList'
import KosztorysForm from '../components/KosztorysForm'
import { aktualizujKosztorys, pobierzKosztorysy, usunKosztorys } from '../api'
import { kosztorysDoPayloadu } from '../kosztorysUtils'

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

  async function zaakceptujKosztorys(kosztorys) {
    const payload = kosztorysDoPayloadu(kosztorys, { wybrany_do_realizacji: true })
    const zaktualizowany = await aktualizujKosztorys(kosztorys.id, payload)
    setKosztorysy((poprzednie) => poprzednie.map((k) => (k.id === zaktualizowany.id ? zaktualizowany : k)))
  }

  async function usunZListy(kosztorys) {
    if (!window.confirm(`Usunąć kosztorys „${kosztorys.numer}"?`)) {
      return
    }
    try {
      await usunKosztorys(kosztorys.id)
      setKosztorysy((poprzednie) => poprzednie.filter((k) => k.id !== kosztorys.id))
    } catch (e) {
      window.alert(e.message)
    }
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
      <KosztorysyList
        kosztorysy={kosztorysy}
        onWybierz={otworzDoEdycji}
        onAkceptuj={zaakceptujKosztorys}
        onUsun={usunZListy}
      />
    </div>
  )
}

export default KosztorysyPage
