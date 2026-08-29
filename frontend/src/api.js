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

export async function pobierzKosztorysy() {
  const odpowiedz = await fetch(`${API_URL}/kosztorysy/`)
  return odpowiedz.json()
}

export async function utworzKosztorys(dane) {
  const odpowiedz = await fetch(`${API_URL}/kosztorysy/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dane),
  })
  if (!odpowiedz.ok) {
    throw new Error('Nie udało się utworzyć kosztorysu')
  }
  return odpowiedz.json()
}
