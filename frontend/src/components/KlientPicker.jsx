import { useEffect, useState } from 'react'
import { pobierzKlientow } from '../api'
import KlientForm from './KlientForm'

function KlientPicker({ klientId, onZmiana }) {
  const [tryb, setTryb] = useState('wybierz')
  const [klienci, setKlienci] = useState([])

  useEffect(() => {
    pobierzKlientow().then(setKlienci)
  }, [])

  function klientUtworzony(nowyKlient) {
    setKlienci((poprzedni) => [...poprzedni, nowyKlient])
    onZmiana(nowyKlient.id)
    setTryb('wybierz')
  }

  return (
    <div>
      <div>
        <button type="button" onClick={() => setTryb('wybierz')} disabled={tryb === 'wybierz'}>
          Wybierz z listy
        </button>{' '}
        <button type="button" onClick={() => setTryb('utworz')} disabled={tryb === 'utworz'}>
          Utwórz klienta
        </button>
      </div>

      {tryb === 'wybierz' && (
        <select value={klientId ?? ''} onChange={(event) => onZmiana(Number(event.target.value))} required>
          <option value="" disabled>
            -- wybierz klienta --
          </option>
          {klienci.map((klient) => (
            <option key={klient.id} value={klient.id}>
              {klient.imie_i_nazwisko}
            </option>
          ))}
        </select>
      )}

      {tryb === 'utworz' && <KlientForm onUtworzono={klientUtworzony} />}
    </div>
  )
}

export default KlientPicker
