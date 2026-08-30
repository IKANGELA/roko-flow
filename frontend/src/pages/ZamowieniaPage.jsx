import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ZamowieniaList from '../components/ZamowieniaList'
import ZamowienieForm from '../components/ZamowienieForm'
import PasekZaznaczenia from '../components/PasekZaznaczenia'
import { aktualizujZamowienie, pobierzZamowienia, usunZamowienie } from '../api'
import { useZaznaczenie } from '../useZaznaczenie'
import { usunZaznaczoneElementy } from '../usunZaznaczone'
import { zamowienieDoPayloadu } from '../zamowienieUtils'

function ZamowieniaPage() {
  const location = useLocation()
  const kosztorysIdZNawigacji = location.state?.kosztorysId

  const [zamowienia, setZamowienia] = useState([])
  // Jeśli trafiliśmy tu po kliknięciu "Akceptuj" na kosztorysie, od razu otwieramy formularz.
  const [widok, setWidok] = useState(kosztorysIdZNawigacji ? 'nowy' : 'lista')
  const [wybraneZamowienie, setWybraneZamowienie] = useState(null)
  const { zaznaczone, przelacz, wyczysc } = useZaznaczenie()

  useEffect(() => {
    pobierzZamowienia().then(setZamowienia)
  }, [])

  function wrocDoListy() {
    setWidok('lista')
    setWybraneZamowienie(null)
  }

  function zapisanoZamowienie(zapisane) {
    setZamowienia((poprzednie) => {
      const juzIstnieje = poprzednie.some((z) => z.id === zapisane.id)
      return juzIstnieje
        ? poprzednie.map((z) => (z.id === zapisane.id ? zapisane : z))
        : [...poprzednie, zapisane]
    })
    wrocDoListy()
  }

  function otworzDoEdycji(zamowienie) {
    setWybraneZamowienie(zamowienie)
    setWidok('edytuj')
  }

  // Szybka zmiana statusu wprost z listy, bez otwierania całego formularza edycji —
  // PUT robi pełną podmianę, więc bazujemy na już wczytanym obiekcie. Status u dostawcy
  // edytuje się już tylko w formularzu zamówienia — na liście widać go w Raportach.
  async function zmienStatus(zamowienie, nowyStatus) {
    const zaktualizowane = await aktualizujZamowienie(zamowienie.id, zamowienieDoPayloadu(zamowienie, { status: nowyStatus }))
    setZamowienia((poprzednie) => poprzednie.map((z) => (z.id === zaktualizowane.id ? zaktualizowane : z)))
  }

  async function usunZaznaczone() {
    if (!window.confirm(`Usunąć ${zaznaczone.size} zamówień?`)) {
      return
    }
    const { usunieteId, bledy } = await usunZaznaczoneElementy(
      zaznaczone,
      usunZamowienie,
      zamowienia,
      (z) => z.kosztorys?.numer || z.numer_zamowienia || `zamówienie #${z.id}`,
    )
    setZamowienia((poprzednie) => poprzednie.filter((z) => !usunieteId.includes(z.id)))
    wyczysc()
    if (bledy.length > 0) {
      window.alert(`Nie udało się usunąć niektórych zamówień:\n${bledy.join('\n')}`)
    }
  }

  if (widok === 'nowy' || widok === 'edytuj') {
    return (
      <div>
        <button type="button" onClick={wrocDoListy}>
          ← Powrót do listy zamówień
        </button>
        <h1>{widok === 'edytuj' ? 'Edycja zamówienia' : 'Nowe zamówienie'}</h1>
        <ZamowienieForm
          zamowienie={widok === 'edytuj' ? wybraneZamowienie : null}
          wstepnyKosztorysId={widok === 'nowy' ? kosztorysIdZNawigacji : undefined}
          onZapisano={zapisanoZamowienie}
        />
      </div>
    )
  }

  return (
    <div>
      <h1>Zamówienia</h1>
      <button type="button" onClick={() => setWidok('nowy')}>
        + Dodaj zamówienie
      </button>
      <h2>Lista zamówień</h2>
      <p>
        <em>Kliknij wiersz, żeby otworzyć zamówienie do edycji.</em>
      </p>
      <ZamowieniaList
        zamowienia={zamowienia}
        onWybierz={otworzDoEdycji}
        zaznaczone={zaznaczone}
        onPrzelacz={przelacz}
        onZmienStatus={zmienStatus}
      />
      <PasekZaznaczenia liczbaZaznaczonych={zaznaczone.size} onUsun={usunZaznaczone} />
    </div>
  )
}

export default ZamowieniaPage
