// Usuwa po kolei wszystkie zaznaczone elementy. Jeśli backend odrzuci któreś usunięcie
// (np. bo istnieją powiązane rekordy), nie przerywa reszty — zbiera błędy i pokazuje je razem.
export async function usunZaznaczoneElementy(zaznaczoneId, usunFunkcja, elementy, opisElementu) {
  const bledy = []
  const usunieteId = []

  for (const id of zaznaczoneId) {
    try {
      await usunFunkcja(id)
      usunieteId.push(id)
    } catch (e) {
      const element = elementy.find((el) => el.id === id)
      bledy.push(`${element ? opisElementu(element) : id}: ${e.message}`)
    }
  }

  return { usunieteId, bledy }
}
