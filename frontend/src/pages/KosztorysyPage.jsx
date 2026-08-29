import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import KosztorysyList from '../components/KosztorysyList'
import KosztorysForm from '../components/KosztorysForm'
import PasekZaznaczenia from '../components/PasekZaznaczenia'
import { aktualizujKosztorys, pobierzKosztorysy, pobierzZamowienia, usunKosztorys, usunZamowienie } from '../api'
import { kosztorysDoPayloadu } from '../kosztorysUtils'
import { useZaznaczenie } from '../useZaznaczenie'
import { usunZaznaczoneElementy } from '../usunZaznaczone'

function KosztorysyPage() {
  const navigate = useNavigate()
  const [kosztorysy, setKosztorysy] = useState([])
  const [widok, setWidok] = useState('lista') // 'lista' | 'nowy' | 'edytuj'
  const [wybranyKosztorys, setWybranyKosztorys] = useState(null)
  const { zaznaczone, przelacz, wyczysc } = useZaznaczenie()

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
    await aktualizujKosztorys(kosztorys.id, payload)
    // Zaakceptowany kosztorys od razu przechodzi do tworzenia zamówienia — z tym kosztorysem
    // już wybranym, żeby nie trzeba było go szukać ręcznie na liście.
    navigate('/zamowienia', { state: { kosztorysId: kosztorys.id } })
  }

  async function wycofajAkceptacjeKosztorysu(kosztorys) {
    if (
      !window.confirm(
        `Cofnąć akceptację kosztorysu „${kosztorys.numer}"? Usunie to również powiązane z nim zamówienie(a).`,
      )
    ) {
      return
    }

    // Usuwamy wszystkie zamówienia powiązane z tym kosztorysem — nie mamy osobnego
    // endpointu "po kosztorysie", więc pobieramy wszystkie i filtrujemy po stronie frontendu.
    const wszystkieZamowienia = await pobierzZamowienia()
    const powiazane = wszystkieZamowienia.filter((z) => z.kosztorys_id === kosztorys.id)
    for (const zamowienie of powiazane) {
      await usunZamowienie(zamowienie.id)
    }

    const payload = kosztorysDoPayloadu(kosztorys, { wybrany_do_realizacji: false })
    const zaktualizowany = await aktualizujKosztorys(kosztorys.id, payload)
    setKosztorysy((poprzednie) => poprzednie.map((k) => (k.id === zaktualizowany.id ? zaktualizowany : k)))
  }

  async function usunZaznaczone() {
    if (!window.confirm(`Usunąć ${zaznaczone.size} kosztorysów?`)) {
      return
    }
    const { usunieteId, bledy } = await usunZaznaczoneElementy(zaznaczone, usunKosztorys, kosztorysy, (k) => k.numer)
    setKosztorysy((poprzednie) => poprzednie.filter((k) => !usunieteId.includes(k.id)))
    wyczysc()
    if (bledy.length > 0) {
      window.alert(`Nie udało się usunąć niektórych kosztorysów:\n${bledy.join('\n')}`)
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
        onWycofajAkceptacje={wycofajAkceptacjeKosztorysu}
        zaznaczone={zaznaczone}
        onPrzelacz={przelacz}
      />
      <PasekZaznaczenia liczbaZaznaczonych={zaznaczone.size} onUsun={usunZaznaczone} />
    </div>
  )
}

export default KosztorysyPage
