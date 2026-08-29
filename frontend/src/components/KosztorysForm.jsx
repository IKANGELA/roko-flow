import { useState } from 'react'
import KlientPicker from './KlientPicker'
import { utworzKosztorys } from '../api'

const PUSTY_FORMULARZ = {
  klient_id: null,
  nazwa_inwestycji: '',
  adres_montazu: '',
  termin: '',
  vat_procent: 8,
  dodatkowe_koszty: 0,
  rabat: 0,
  ustalona_zaliczka: '',
}

function KosztorysForm({ onUtworzono }) {
  const [dane, setDane] = useState(PUSTY_FORMULARZ)
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

    const nowyKosztorys = {
      klient_id: dane.klient_id,
      nazwa_inwestycji: dane.nazwa_inwestycji || null,
      adres_montazu: dane.adres_montazu || null,
      termin: dane.termin || null,
      vat_procent: Number(dane.vat_procent),
      dodatkowe_koszty: Number(dane.dodatkowe_koszty) || 0,
      rabat: Number(dane.rabat) || 0,
      ustalona_zaliczka: dane.ustalona_zaliczka === '' ? null : Number(dane.ustalona_zaliczka),
      pozycje: [],
    }

    try {
      const utworzony = await utworzKosztorys(nowyKosztorys)
      onUtworzono(utworzony)
      setDane(PUSTY_FORMULARZ)
    } catch (e) {
      setBlad('Nie udało się zapisać kosztorysu.')
    } finally {
      setZapisywanie(false)
    }
  }

  return (
    <form onSubmit={wyslij}>
      <h2>Nowy kosztorys</h2>

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

      <p>
        <em>Pozycje kosztorysu dodamy w kolejnym etapie — na razie kosztorys tworzy się bez pozycji.</em>
      </p>

      <button type="submit" disabled={zapisywanie}>
        {zapisywanie ? 'Zapisywanie...' : 'Utwórz kosztorys'}
      </button>

      {blad && <p style={{ color: 'red' }}>{blad}</p>}
    </form>
  )
}

export default KosztorysForm
