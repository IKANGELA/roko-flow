import { useState } from 'react'
import { utworzDostawce } from '../api'

const PUSTY_FORMULARZ = { nazwa: '', specyfikacja: '' }

function DostawcaForm({ onUtworzono }) {
  const [dane, setDane] = useState(PUSTY_FORMULARZ)
  const [zapisywanie, setZapisywanie] = useState(false)

  function zmienPole(event) {
    const { name, value } = event.target
    setDane((poprzednie) => ({ ...poprzednie, [name]: value }))
  }

  async function wyslij(event) {
    event.preventDefault()
    setZapisywanie(true)
    try {
      const nowyDostawca = await utworzDostawce({
        nazwa: dane.nazwa,
        specyfikacja: dane.specyfikacja || null,
      })
      onUtworzono(nowyDostawca)
      setDane(PUSTY_FORMULARZ)
    } finally {
      setZapisywanie(false)
    }
  }

  return (
    <form onSubmit={wyslij} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
      <input name="nazwa" placeholder="Nazwa dostawcy (np. Erkado)" value={dane.nazwa} onChange={zmienPole} required />
      <input
        name="specyfikacja"
        placeholder="Specyfikacja (np. drzwi, klamki)"
        value={dane.specyfikacja}
        onChange={zmienPole}
      />
      <button type="submit" disabled={zapisywanie}>
        {zapisywanie ? 'Zapisywanie...' : 'Dodaj dostawcę'}
      </button>
    </form>
  )
}

export default DostawcaForm
