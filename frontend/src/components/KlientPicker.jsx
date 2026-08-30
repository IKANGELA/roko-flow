import { useEffect, useState } from 'react'
import { pobierzKlientow } from '../api'
import KlientForm from './KlientForm'

function KlientPicker({ klientId, onZmiana, wymagany = true }) {
  const [tryb, setTryb] = useState('wybierz')
  const [klienci, setKlienci] = useState([])

  useEffect(() => {
    pobierzKlientow().then(setKlienci)
  }, [])

  function klientUtworzony(nowyKlient) {
    setKlienci((poprzedni) => [...poprzedni, nowyKlient])
    onZmiana(nowyKlient)
    setTryb('wybierz')
  }

  return (
    <div>
      <div className="zakladki">
        <button
          type="button"
          className={tryb === 'wybierz' ? 'aktywna' : ''}
          onClick={() => setTryb('wybierz')}
        >
          Wybierz z listy
        </button>
        <button type="button" className={tryb === 'utworz' ? 'aktywna' : ''} onClick={() => setTryb('utworz')}>
          Utwórz klienta
        </button>
      </div>

      {tryb === 'wybierz' && (
        <select
          value={klientId ?? ''}
          onChange={(event) => {
            const wybrany = klienci.find((klient) => String(klient.id) === event.target.value)
            onZmiana(wybrany ?? null)
          }}
          required={wymagany}
        >
          <option value="" disabled={wymagany}>
            {wymagany ? '-- wybierz klienta --' : '-- bez klienta --'}
          </option>
          {klienci.map((klient) => (
            <option key={klient.id} value={klient.id}>
              {klient.imie_i_nazwisko}
            </option>
          ))}
        </select>
      )}

      {tryb === 'utworz' && <KlientForm onZapisano={klientUtworzony} />}
    </div>
  )
}

export default KlientPicker
