import { useState } from 'react'
import { aktualizujDostawce } from '../api'

function DostawcyList({ dostawcy, zaznaczone, onPrzelacz, onZaktualizowano }) {
  const [edytowanyId, setEdytowanyId] = useState(null)
  const [dane, setDane] = useState({ nazwa: '', specyfikacja: '' })
  const [zapisywanie, setZapisywanie] = useState(false)

  if (dostawcy.length === 0) {
    return <p>Brak dostawców.</p>
  }

  function rozpocznijEdycje(dostawca) {
    setEdytowanyId(dostawca.id)
    setDane({ nazwa: dostawca.nazwa, specyfikacja: dostawca.specyfikacja || '' })
  }

  async function zapiszEdycje(id) {
    setZapisywanie(true)
    try {
      const zaktualizowany = await aktualizujDostawce(id, {
        nazwa: dane.nazwa,
        specyfikacja: dane.specyfikacja || null,
      })
      onZaktualizowano(zaktualizowany)
      setEdytowanyId(null)
    } finally {
      setZapisywanie(false)
    }
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {dostawcy.map((dostawca) => (
        <li key={dostawca.id} style={{ textAlign: 'left' }}>
          {edytowanyId === dostawca.id ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={dane.nazwa}
                onChange={(event) => setDane((poprzednie) => ({ ...poprzednie, nazwa: event.target.value }))}
              />
              <input
                value={dane.specyfikacja}
                onChange={(event) =>
                  setDane((poprzednie) => ({ ...poprzednie, specyfikacja: event.target.value }))
                }
                placeholder="Specyfikacja"
              />
              <button type="button" onClick={() => zapiszEdycje(dostawca.id)} disabled={zapisywanie}>
                Zapisz
              </button>
              <button type="button" onClick={() => setEdytowanyId(null)}>
                Anuluj
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={zaznaczone.has(dostawca.id)}
                onChange={() => onPrzelacz(dostawca.id)}
              />
              <strong>{dostawca.nazwa}</strong>
              {dostawca.specyfikacja && <span>— {dostawca.specyfikacja}</span>}
              <button type="button" onClick={() => rozpocznijEdycje(dostawca)}>
                Edytuj
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export default DostawcyList
