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

export async function aktualizujKlienta(id, dane) {
  const odpowiedz = await fetch(`${API_URL}/klienci/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dane),
  })
  if (!odpowiedz.ok) {
    throw new Error('Nie udało się zaktualizować klienta')
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

export async function aktualizujKosztorys(id, dane) {
  const odpowiedz = await fetch(`${API_URL}/kosztorysy/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dane),
  })
  if (!odpowiedz.ok) {
    throw new Error('Nie udało się zaktualizować kosztorysu')
  }
  return odpowiedz.json()
}

export async function pobierzDostawcow() {
  const odpowiedz = await fetch(`${API_URL}/dostawcy/`)
  return odpowiedz.json()
}

export async function utworzDostawce(dane) {
  const odpowiedz = await fetch(`${API_URL}/dostawcy/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dane),
  })
  if (!odpowiedz.ok) {
    throw new Error('Nie udało się utworzyć dostawcy')
  }
  return odpowiedz.json()
}

export async function aktualizujDostawce(id, dane) {
  const odpowiedz = await fetch(`${API_URL}/dostawcy/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dane),
  })
  if (!odpowiedz.ok) {
    throw new Error('Nie udało się zaktualizować dostawcy')
  }
  return odpowiedz.json()
}

export async function pobierzZamowienia() {
  const odpowiedz = await fetch(`${API_URL}/zamowienia/`)
  return odpowiedz.json()
}

export async function utworzZamowienie(dane) {
  const odpowiedz = await fetch(`${API_URL}/zamowienia/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dane),
  })
  if (!odpowiedz.ok) {
    throw new Error('Nie udało się utworzyć zamówienia')
  }
  return odpowiedz.json()
}

export async function aktualizujZamowienie(id, dane) {
  const odpowiedz = await fetch(`${API_URL}/zamowienia/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dane),
  })
  if (!odpowiedz.ok) {
    throw new Error('Nie udało się zaktualizować zamówienia')
  }
  return odpowiedz.json()
}

export async function pobierzMontaze() {
  const odpowiedz = await fetch(`${API_URL}/montaze/`)
  return odpowiedz.json()
}

export async function utworzMontaz(dane) {
  const odpowiedz = await fetch(`${API_URL}/montaze/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dane),
  })
  if (!odpowiedz.ok) {
    throw new Error('Nie udało się utworzyć montażu')
  }
  return odpowiedz.json()
}

export async function aktualizujMontaz(id, dane) {
  const odpowiedz = await fetch(`${API_URL}/montaze/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dane),
  })
  if (!odpowiedz.ok) {
    throw new Error('Nie udało się zaktualizować montażu')
  }
  return odpowiedz.json()
}

// Wspólna obsługa usuwania — jeśli backend odrzuci usunięcie (np. bo istnieją powiązane
// rekordy), pokazujemy dokładnie ten komunikat, który zwrócił, zamiast ogólnego "błąd".
async function usunPodAdresem(url) {
  const odpowiedz = await fetch(url, { method: 'DELETE' })
  if (!odpowiedz.ok) {
    const dane = await odpowiedz.json().catch(() => null)
    throw new Error(dane?.detail || 'Nie udało się usunąć.')
  }
}

export function usunKlienta(id) {
  return usunPodAdresem(`${API_URL}/klienci/${id}`)
}

export function usunDostawce(id) {
  return usunPodAdresem(`${API_URL}/dostawcy/${id}`)
}

export function usunKosztorys(id) {
  return usunPodAdresem(`${API_URL}/kosztorysy/${id}`)
}

export function usunZamowienie(id) {
  return usunPodAdresem(`${API_URL}/zamowienia/${id}`)
}

export function usunMontaz(id) {
  return usunPodAdresem(`${API_URL}/montaze/${id}`)
}
