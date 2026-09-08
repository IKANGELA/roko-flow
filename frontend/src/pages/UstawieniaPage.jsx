import { useEffect, useState } from 'react'
import { aktualizujUstawieniaFirmy, pobierzUstawieniaFirmy } from '../api'

const PUSTY_FORMULARZ = {
  nazwa: '',
  adres: '',
  miejscowosc: '',
  nip: '',
  konto_bankowe: '',
  telefon: '',
  email: '',
  www: '',
  dane_rejestrowe: '',
  stawka_niedotrzymania_wymiarow: '',
}

function UstawieniaPage() {
  const [dane, setDane] = useState(PUSTY_FORMULARZ)
  const [wczytywanie, setWczytywanie] = useState(true)
  const [zapisywanie, setZapisywanie] = useState(false)
  const [statusZapisu, setStatusZapisu] = useState(null) // null | 'zapisano' | 'blad'

  useEffect(() => {
    pobierzUstawieniaFirmy().then((ustawienia) => {
      setDane({
        nazwa: ustawienia.nazwa || '',
        adres: ustawienia.adres || '',
        miejscowosc: ustawienia.miejscowosc || '',
        nip: ustawienia.nip || '',
        konto_bankowe: ustawienia.konto_bankowe || '',
        telefon: ustawienia.telefon || '',
        email: ustawienia.email || '',
        www: ustawienia.www || '',
        dane_rejestrowe: ustawienia.dane_rejestrowe || '',
        stawka_niedotrzymania_wymiarow: ustawienia.stawka_niedotrzymania_wymiarow || '',
      })
      setWczytywanie(false)
    })
  }, [])

  function zmienPole(event) {
    const { name, value } = event.target
    setDane((poprzednie) => ({ ...poprzednie, [name]: value }))
  }

  async function wyslij(event) {
    event.preventDefault()
    setZapisywanie(true)
    setStatusZapisu(null)

    const oczyszczoneDane = Object.fromEntries(Object.entries(dane).map(([klucz, wartosc]) => [klucz, wartosc || null]))

    try {
      await aktualizujUstawieniaFirmy(oczyszczoneDane)
      setStatusZapisu('zapisano')
    } catch (e) {
      setStatusZapisu('blad')
    } finally {
      setZapisywanie(false)
    }
  }

  if (wczytywanie) {
    return (
      <div>
        <h1>Ustawienia firmy</h1>
        <p>Wczytywanie...</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Ustawienia firmy</h1>
      <p>
        <em>Te dane pojawiają się na drukach (kosztorysy, umowy) — wypełnij je raz, tutaj.</em>
      </p>

      <form className="pelny-formularz" onSubmit={wyslij}>
        <fieldset>
          <legend>Dane Wykonawcy</legend>
          <div className="siatka-pol">
            <label>
              Nazwa firmy
              <input name="nazwa" value={dane.nazwa} onChange={zmienPole} />
            </label>
            <label>
              NIP
              <input name="nip" value={dane.nip} onChange={zmienPole} />
            </label>
            <label className="pole-szerokie">
              Adres
              <input name="adres" value={dane.adres} onChange={zmienPole} />
            </label>
            <label>
              Miejscowość (do "Miejscowość, dnia..." na drukach)
              <input name="miejscowosc" value={dane.miejscowosc} onChange={zmienPole} />
            </label>
            <label>
              Telefon
              <input name="telefon" value={dane.telefon} onChange={zmienPole} />
            </label>
            <label>
              E-mail
              <input name="email" value={dane.email} onChange={zmienPole} />
            </label>
            <label>
              WWW
              <input name="www" value={dane.www} onChange={zmienPole} />
            </label>
            <label>
              Konto bankowe
              <input name="konto_bankowe" value={dane.konto_bankowe} onChange={zmienPole} />
            </label>
            <label className="pole-szerokie">
              Dane rejestrowe (do zdania „prowadzącym działalność zarejestrowaną w..." w umowie)
              <input name="dane_rejestrowe" value={dane.dane_rejestrowe} onChange={zmienPole} />
            </label>
            <label>
              Opłata za niedotrzymanie wymiarów (karta otworów)
              <input
                name="stawka_niedotrzymania_wymiarow"
                placeholder="np. 500 zł netto"
                value={dane.stawka_niedotrzymania_wymiarow}
                onChange={zmienPole}
              />
            </label>
          </div>
        </fieldset>

        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={zapisywanie}>
            {zapisywanie ? 'Zapisywanie...' : 'Zapisz ustawienia'}
          </button>
        </div>

        {statusZapisu === 'zapisano' && <p>Zapisano ✓</p>}
        {statusZapisu === 'blad' && <p style={{ color: 'red' }}>Nie udało się zapisać ustawień.</p>}
      </form>
    </div>
  )
}

export default UstawieniaPage
