import { useEffect, useState } from 'react'
import KlientPicker from './KlientPicker'
import PozycjeEditor from './PozycjeEditor'
import { aktualizujKosztorys, pobierzDostawcow, utworzKosztorys } from '../api'
import { pozycjeDoPayloadu } from '../kosztorysUtils'

const PUSTY_FORMULARZ = {
  klient_id: null,
  nazwa_inwestycji: '',
  adres_nabywcy: '',
  adres_montazu: '',
  termin: '',
  uwagi: '',
  wybrany_do_realizacji: false,
  vat_procent: 8,
  dodatkowe_koszty: 0,
  rabat: 0,
  ustalona_zaliczka: '',
}

function danePoczatkowe(kosztorys) {
  if (!kosztorys) {
    return PUSTY_FORMULARZ
  }
  return {
    klient_id: kosztorys.klient_id,
    nazwa_inwestycji: kosztorys.nazwa_inwestycji || '',
    adres_nabywcy: kosztorys.adres_nabywcy || '',
    adres_montazu: kosztorys.adres_montazu || '',
    termin: kosztorys.termin || '',
    uwagi: kosztorys.uwagi || '',
    wybrany_do_realizacji: kosztorys.wybrany_do_realizacji,
    vat_procent: kosztorys.vat_procent,
    dodatkowe_koszty: kosztorys.dodatkowe_koszty,
    rabat: kosztorys.rabat,
    ustalona_zaliczka: kosztorys.ustalona_zaliczka ?? '',
  }
}

function pozycjePoczatkowe(kosztorys) {
  if (!kosztorys) {
    return []
  }
  return kosztorys.pozycje.map((pozycja) => ({
    nazwa: pozycja.nazwa,
    dostawca_id: pozycja.dostawca_id ?? '',
    montaz_kwota: pozycja.montaz_kwota ?? '',
    opis: pozycja.opis || '',
    opis_kwota: pozycja.opis_kwota ?? '',
    kolor: pozycja.kolor || '',
    kolor_kwota: pozycja.kolor_kwota ?? '',
    oscieznica_rodzaj: pozycja.oscieznica_rodzaj || '',
    oscieznica_rodzaj_kwota: pozycja.oscieznica_rodzaj_kwota ?? '',
    informacje_dodatkowe: pozycja.informacje_dodatkowe || '',
    informacje_dodatkowe_kwota: pozycja.informacje_dodatkowe_kwota ?? '',
    szklo: pozycja.szklo || '',
    szklo_kwota: pozycja.szklo_kwota ?? '',
    wentylacja: pozycja.wentylacja || '',
    wentylacja_kwota: pozycja.wentylacja_kwota ?? '',
    uwagi: pozycja.uwagi || '',
    uwagi_kwota: pozycja.uwagi_kwota ?? '',
  }))
}

function KosztorysForm({ kosztorys, onZapisano }) {
  const [dane, setDane] = useState(() => danePoczatkowe(kosztorys))
  const [pozycje, setPozycje] = useState(() => pozycjePoczatkowe(kosztorys))
  const [zapisywanie, setZapisywanie] = useState(false)
  const [blad, setBlad] = useState(null)

  // Id kosztorysu w bazie — na starcie taki, jaki dostałyśmy (edycja), albo brak (nowy).
  // Gdy pierwszy raz zapiszemy "w tle" (np. przy dodaniu pozycji), dostajemy nowe id
  // i od tej pory kolejne zapisy (także ten końcowy, przyciskiem na dole) są już edycją.
  const [kosztorysId, setKosztorysId] = useState(kosztorys?.id ?? null)
  const [statusZapisu, setStatusZapisu] = useState(null) // null | 'zapisywanie' | 'zapisano' | 'blad'
  const [dostawcy, setDostawcy] = useState([])

  useEffect(() => {
    pobierzDostawcow().then(setDostawcy)
  }, [])

  function zmienPole(event) {
    const { name, value } = event.target
    setDane((poprzednie) => ({ ...poprzednie, [name]: value }))
  }

  function zmienKlienta(klientId) {
    setDane((poprzednie) => ({ ...poprzednie, klient_id: klientId }))
  }

  function zbudujPayload() {
    return {
      klient_id: dane.klient_id,
      nazwa_inwestycji: dane.nazwa_inwestycji || null,
      adres_nabywcy: dane.adres_nabywcy || null,
      adres_montazu: dane.adres_montazu || null,
      termin: dane.termin || null,
      uwagi: dane.uwagi || null,
      wybrany_do_realizacji: dane.wybrany_do_realizacji,
      vat_procent: Number(dane.vat_procent),
      dodatkowe_koszty: Number(dane.dodatkowe_koszty) || 0,
      rabat: Number(dane.rabat) || 0,
      ustalona_zaliczka: dane.ustalona_zaliczka === '' ? null : Number(dane.ustalona_zaliczka),
      pozycje: pozycjeDoPayloadu(pozycje),
    }
  }

  // Zapisuje cały kosztorys "w tle" (bez zamykania formularza) — wywoływane z przycisku
  // "Zapisz" przy pozycji, żeby nic nie zginęło przy wypełnianiu długiej listy pozycji.
  async function zapiszWTle() {
    if (!dane.klient_id) {
      setBlad('Wybierz lub utwórz klienta, zanim zapiszesz pozycję.')
      return
    }
    setBlad(null)
    setStatusZapisu('zapisywanie')
    try {
      const payload = zbudujPayload()
      const zapisany = kosztorysId
        ? await aktualizujKosztorys(kosztorysId, payload)
        : await utworzKosztorys(payload)
      setKosztorysId(zapisany.id)
      setStatusZapisu('zapisano')
    } catch (e) {
      setStatusZapisu('blad')
    }
  }

  async function wyslij(event) {
    event.preventDefault()
    if (!dane.klient_id) {
      setBlad('Wybierz lub utwórz klienta.')
      return
    }

    setZapisywanie(true)
    setBlad(null)

    try {
      const payload = zbudujPayload()
      const zapisany = kosztorysId
        ? await aktualizujKosztorys(kosztorysId, payload)
        : await utworzKosztorys(payload)
      onZapisano(zapisany)
    } catch (e) {
      setBlad('Nie udało się zapisać kosztorysu.')
    } finally {
      setZapisywanie(false)
    }
  }

  return (
    <form className="pelny-formularz" onSubmit={wyslij}>
      <fieldset>
        <legend>Dane klienta i inwestycji</legend>

        <KlientPicker klientId={dane.klient_id} onZmiana={zmienKlienta} />

        <div className="siatka-pol">
          <label>
            Nazwa inwestycji
            <input name="nazwa_inwestycji" value={dane.nazwa_inwestycji} onChange={zmienPole} />
          </label>
          <label>
            Adres nabywcy (do faktury)
            <input name="adres_nabywcy" value={dane.adres_nabywcy} onChange={zmienPole} />
          </label>
          <label>
            Adres montażu
            <input name="adres_montazu" value={dane.adres_montazu} onChange={zmienPole} />
          </label>
          <label>
            Termin
            <input name="termin" placeholder="np. 2 tygodnie" value={dane.termin} onChange={zmienPole} />
          </label>

          <label className="pole-szerokie">
            Uwagi
            <textarea name="uwagi" value={dane.uwagi} onChange={zmienPole} rows={2} />
          </label>
          <label className="pole-checkbox">
            <input
              type="checkbox"
              name="wybrany_do_realizacji"
              checked={dane.wybrany_do_realizacji}
              onChange={(event) =>
                setDane((poprzednie) => ({ ...poprzednie, wybrany_do_realizacji: event.target.checked }))
              }
            />
            Wybrany do realizacji
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Pozycje</legend>
        {statusZapisu === 'zapisywanie' && <p>Zapisywanie kosztorysu...</p>}
        {statusZapisu === 'zapisano' && <p>Zapisano ✓</p>}
        {statusZapisu === 'blad' && <p style={{ color: 'red' }}>Nie udało się zapisać.</p>}
        <PozycjeEditor
          pozycje={pozycje}
          onZmiana={setPozycje}
          onZapiszKosztorys={zapiszWTle}
          dostawcy={dostawcy}
        />
      </fieldset>

      <fieldset>
        <legend>Podsumowanie finansowe</legend>

        <div>
          <label>
            VAT:{' '}
            <select name="vat_procent" value={dane.vat_procent} onChange={zmienPole}>
              <option value={8}>8%</option>
              <option value={23}>23%</option>
              <option value={0}>0%</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Dodatkowe koszty:{' '}
            <input
              name="dodatkowe_koszty"
              type="number"
              step="0.01"
              value={dane.dodatkowe_koszty}
              onChange={zmienPole}
            />
          </label>
        </div>

        <div>
          <label>
            Rabat:{' '}
            <input name="rabat" type="number" step="0.01" value={dane.rabat} onChange={zmienPole} />
          </label>
        </div>

        <div>
          <label>
            Ustalona zaliczka (puste = domyślne 40%):{' '}
            <input
              name="ustalona_zaliczka"
              type="number"
              step="0.01"
              value={dane.ustalona_zaliczka}
              onChange={zmienPole}
            />
          </label>
        </div>
      </fieldset>

      <div style={{ marginTop: 24 }}>
        <button type="submit" disabled={zapisywanie}>
          {zapisywanie ? 'Zapisywanie...' : kosztorysId ? 'Zapisz zmiany' : 'Utwórz kosztorys'}
        </button>
      </div>

      {blad && <p style={{ color: 'red' }}>{blad}</p>}
    </form>
  )
}

export default KosztorysForm
