const API_URL = 'http://localhost:8000'

export async function pobierzKlientow() {
  const odpowiedz = await fetch(`${API_URL}/klienci/`)
  return odpowiedz.json()
}

export async function utworzKlienta(dane) {
  const odpowiedz = await fetch(`${API_URL}/klienci/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dane),
  })
  if (!odpowiedz.ok) {
    throw new Error('Nie udało się utworzyć klienta')
  }
  return odpowiedz.json()
}
