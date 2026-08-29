import { useState } from 'react'

// Wspólna logika zaznaczania wierszy checkboxami — używana na listach Klientów,
// Dostawców i Kosztorysów, żeby nie powtarzać tego samego kodu trzy razy.
export function useZaznaczenie() {
  const [zaznaczone, setZaznaczone] = useState(new Set())

  function przelacz(id) {
    setZaznaczone((poprzednie) => {
      const nowe = new Set(poprzednie)
      if (nowe.has(id)) {
        nowe.delete(id)
      } else {
        nowe.add(id)
      }
      return nowe
    })
  }

  function wyczysc() {
    setZaznaczone(new Set())
  }

  return { zaznaczone, przelacz, wyczysc }
}
