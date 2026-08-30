import { useState } from 'react'
import { aktualizujKlienta, utworzKlienta } from '../api'

const PUSTY_FORMULARZ = {
  imie_i_nazwisko: '',
  telefon: '',
  email: '',
  adres: '',
  nip: '',
  uwagi: '',
}

function danePoczatkowe(klient) {
  if (!klient) {
    return PUSTY_FORMULARZ
  }
  return {
    imie_i_nazwisko: klient.imie_i_nazwisko,
    telefon: klient.telefon,
    email: klient.email || '',
    adres: klient.adres || '',
    nip: klient.nip || '',
    uwagi: klient.uwagi || '',
  }
}

function KlientForm({ klient, onZapisano }) {
  const jestEdycja = Boolean(klient)

  const [dane, setDane] = useState(() => danePoczatkowe(klient))
  const [zapisywanie, setZapisywanie] = useState(false)
  const [blad, setBlad] = useState(null)

  function zmienPole(event) {
    const { name, value } = event.target
    setDane((poprzednie) => ({ ...poprzednie, [name]: value }))
  }

  async function wyslij() {
    setZapisywanie(true)
    setBlad(null)

    // Puste pola opcjonalne wysyłamy jako null, a nie pusty tekst — tak jak oczekuje backend.
    const oczyszczoneDane = {
      ...dane,
      email: dane.email || null,
      adres: dane.adres || null,
      nip: dane.nip || null,
      uwagi: dane.uwagi || null,
    }

    try {
      const zapisany = jestEdycja
        ? await aktualizujKlienta(klient.id, oczyszczoneDane)
        : await utworzKlienta(oczyszczoneDane)
      onZapisano(zapisany)
      if (!jestEdycja) {
        setDane(PUSTY_FORMULARZ)
      }
    } catch (e) {
      setBlad('Nie udało się zapisać klienta. Spróbuj ponownie.')
    } finally {
      setZapisywanie(false)
    }
  }

  // Uwaga: to celowo <div>, nie <form> — KlientForm bywa osadzany wewnątrz innych
  // formularzy (np. formularza kosztorysu przez KlientPicker), a zagnieżdżone <form>
  // w HTML są niepoprawne i powodują, że kliknięcie przycisku wysyła "zewnętrzny"
  // formularz zamiast tego, zamiast utworzyć klienta.
  return (
    <div className="karta-formularza">
      <h2>{jestEdycja ? 'Edytuj klienta' : 'Dodaj klienta'}</h2>

      <div className="siatka-pol">
        <label>
          Imię i nazwisko
          <input name="imie_i_nazwisko" value={dane.imie_i_nazwisko} onChange={zmienPole} required />
        </label>
        <label>
          Telefon
          <input name="telefon" value={dane.telefon} onChange={zmienPole} required />
        </label>
        <label>
          E-mail
          <input name="email" value={dane.email} onChange={zmienPole} />
        </label>
        <label>
          Adres
          <input name="adres" value={dane.adres} onChange={zmienPole} />
        </label>
        <label>
          NIP
          <input name="nip" value={dane.nip} onChange={zmienPole} />
        </label>
        <label>
          Uwagi
          <input name="uwagi" value={dane.uwagi} onChange={zmienPole} />
        </label>
      </div>

      <button type="button" onClick={wyslij} disabled={zapisywanie}>
        {zapisywanie ? 'Zapisywanie...' : jestEdycja ? 'Zapisz zmiany' : 'Utwórz klienta'}
      </button>

      {blad && <p style={{ color: 'red' }}>{blad}</p>}
    </div>
  )
}

export default KlientForm
