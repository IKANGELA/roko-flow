import { useState } from 'react'
import { utworzKlienta } from '../api'

const PUSTY_FORMULARZ = {
  imie_i_nazwisko: '',
  telefon: '',
  email: '',
  adres: '',
  nip: '',
  uwagi: '',
}

function KlientForm({ onUtworzono }) {
  const [dane, setDane] = useState(PUSTY_FORMULARZ)
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
      const nowyKlient = await utworzKlienta(oczyszczoneDane)
      onUtworzono(nowyKlient)
      setDane(PUSTY_FORMULARZ)
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
      <h2>Dodaj klienta</h2>

      <input
        name="imie_i_nazwisko"
        placeholder="Imię i nazwisko"
        value={dane.imie_i_nazwisko}
        onChange={zmienPole}
        required
      />
      <input name="telefon" placeholder="Telefon" value={dane.telefon} onChange={zmienPole} required />
      <input name="email" placeholder="E-mail" value={dane.email} onChange={zmienPole} />
      <input name="adres" placeholder="Adres" value={dane.adres} onChange={zmienPole} />
      <input name="nip" placeholder="NIP" value={dane.nip} onChange={zmienPole} />
      <input name="uwagi" placeholder="Uwagi" value={dane.uwagi} onChange={zmienPole} />

      <button type="button" onClick={wyslij} disabled={zapisywanie}>
        {zapisywanie ? 'Zapisywanie...' : 'Utwórz klienta'}
      </button>

      {blad && <p style={{ color: 'red' }}>{blad}</p>}
    </div>
  )
}

export default KlientForm
