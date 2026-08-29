import { useState } from 'react'
import KlientPicker from './KlientPicker'
import PozycjeEditor from './PozycjeEditor'
import { aktualizujKosztorys, utworzKosztorys } from '../api'

const PUSTY_FORMULARZ = {
  klient_id: null,
  nazwa_inwestycji: '',
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
    opis: pozycja.opis || '',
    kolor: pozycja.kolor || '',
    oscieznica_rodzaj: pozycja.oscieznica_rodzaj || '',
    informacje_dodatkowe: pozycja.informacje_dodatkowe || '',
    szklo: pozycja.szklo || '',
    wentylacja: pozycja.wentylacja || '',
    uwagi: pozycja.uwagi || '',
    skladniki: pozycja.skladniki.map((skladnik) => ({ opis: skladnik.opis, kwota: String(skladnik.kwota) })),
  }))
}

function KosztorysForm({ kosztorys, onZapisano }) {
  const jestEdycja = Boolean(kosztorys)

  const [dane, setDane] = useState(() => danePoczatkowe(kosztorys))
  const [pozycje, setPozycje] = useState(() => pozycjePoczatkowe(kosztorys))
  const [zapisywanie, setZapisywanie] = useState(false)
  const [blad, setBlad] = useState(null)

  function zmienPole(event) {
    const { name, value } = event.target
    setDane((poprzednie) => ({ ...poprzednie, [name]: value }))
  }

  function zmienKlienta(klientId) {
    setDane((poprzednie) => ({ ...poprzednie, klient_id: klientId }))
  }

  async function wyslij(event) {
    event.preventDefault()
    if (!dane.klient_id) {
      setBlad('Wybierz lub utwórz klienta.')
      return
    }

    setZapisywanie(true)
    setBlad(null)

    const daneDoWyslania = {
      klient_id: dane.klient_id,
      nazwa_inwestycji: dane.nazwa_inwestycji || null,
      adres_montazu: dane.adres_montazu || null,
      termin: dane.termin || null,
      uwagi: dane.uwagi || null,
      wybrany_do_realizacji: dane.wybrany_do_realizacji,
      vat_procent: Number(dane.vat_procent),
      dodatkowe_koszty: Number(dane.dodatkowe_koszty) || 0,
      rabat: Number(dane.rabat) || 0,
      ustalona_zaliczka: dane.ustalona_zaliczka === '' ? null : Number(dane.ustalona_zaliczka),
      pozycje: pozycje.map((pozycja) => ({
        nazwa: pozycja.nazwa,
        opis: pozycja.opis || null,
        kolor: pozycja.kolor || null,
        oscieznica_rodzaj: pozycja.oscieznica_rodzaj || null,
        informacje_dodatkowe: pozycja.informacje_dodatkowe || null,
        szklo: pozycja.szklo || null,
        wentylacja: pozycja.wentylacja || null,
        uwagi: pozycja.uwagi || null,
        skladniki: pozycja.skladniki.map((skladnik) => ({
          opis: skladnik.opis,
          kwota: Number(skladnik.kwota) || 0,
        })),
      })),
    }

    try {
      const zapisany = jestEdycja
        ? await aktualizujKosztorys(kosztorys.id, daneDoWyslania)
        : await utworzKosztorys(daneDoWyslania)
      onZapisano(zapisany)
      if (!jestEdycja) {
        setDane(PUSTY_FORMULARZ)
        setPozycje([])
      }
    } catch (e) {
      setBlad(jestEdycja ? 'Nie udało się zaktualizować kosztorysu.' : 'Nie udało się zapisać kosztorysu.')
    } finally {
      setZapisywanie(false)
    }
  }

  return (
    <form onSubmit={wyslij}>
      <h3>Dane klienta i inwestycji</h3>

      <KlientPicker klientId={dane.klient_id} onZmiana={zmienKlienta} />

      <div>
        <input
          name="nazwa_inwestycji"
          placeholder="Nazwa inwestycji"
          value={dane.nazwa_inwestycji}
          onChange={zmienPole}
        />
      </div>
      <div>
        <input
          name="adres_montazu"
          placeholder="Adres montażu"
          value={dane.adres_montazu}
          onChange={zmienPole}
        />
      </div>
      <div>
        <input name="termin" placeholder="Termin (np. 2 tygodnie)" value={dane.termin} onChange={zmienPole} />
      </div>
      <div>
        <textarea name="uwagi" placeholder="Uwagi" value={dane.uwagi} onChange={zmienPole} rows={2} />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            name="wybrany_do_realizacji"
            checked={dane.wybrany_do_realizacji}
            onChange={(event) =>
              setDane((poprzednie) => ({ ...poprzednie, wybrany_do_realizacji: event.target.checked }))
            }
          />{' '}
          Wybrany do realizacji
        </label>
      </div>

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
          <input name="dodatkowe_koszty" type="number" step="0.01" value={dane.dodatkowe_koszty} onChange={zmienPole} />
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

      <hr style={{ margin: '24px 0' }} />

      <PozycjeEditor pozycje={pozycje} onZmiana={setPozycje} />

      <div style={{ marginTop: 24 }}>
        <button type="submit" disabled={zapisywanie}>
          {zapisywanie ? 'Zapisywanie...' : jestEdycja ? 'Zapisz zmiany' : 'Utwórz kosztorys'}
        </button>
      </div>

      {blad && <p style={{ color: 'red' }}>{blad}</p>}
    </form>
  )
}

export default KosztorysForm
