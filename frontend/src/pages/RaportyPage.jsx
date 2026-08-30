import { useEffect, useState } from 'react'
import { pobierzDostawcow, pobierzKosztorysy, pobierzZamowienia } from '../api'

// Zestawienie "ile klientów czeka na zamówienie u danego dostawcy" — grupuje kosztorysy
// po producencie/marce przypisanym do ich pozycji, ograniczone do zamówień, których status
// u dostawcy nie jest jeszcze "Zamówione kompletnie". Liczymy kosztorysy/zamówienia,
// nie pojedyncze pozycje — jeden kosztorys liczy się raz na dostawcę, nawet jeśli ma
// u niego kilka pozycji.
function zbudujRaport(zamowienia, kosztorysy, dostawcy) {
  const kosztorysById = new Map(kosztorysy.map((k) => [k.id, k]))
  const dostawcaById = new Map(dostawcy.map((d) => [d.id, d]))
  const grupy = new Map() // dostawca_id -> Map(kosztorys_id -> wpis)

  for (const zamowienie of zamowienia) {
    if (zamowienie.status_zamowienia_dostawcy === 'Zamówione kompletnie') {
      continue
    }
    if (!zamowienie.kosztorys_id) {
      continue
    }
    const kosztorys = kosztorysById.get(zamowienie.kosztorys_id)
    if (!kosztorys) {
      continue
    }

    const dostawcyWKosztorysie = new Set(
      kosztorys.pozycje.map((pozycja) => pozycja.dostawca_id).filter((id) => id != null),
    )

    for (const dostawcaId of dostawcyWKosztorysie) {
      if (!grupy.has(dostawcaId)) {
        grupy.set(dostawcaId, new Map())
      }
      // Ten sam kosztorys może mieć kilka zamówień (u różnych dostawców) — zapisujemy
      // po kosztorys_id, żeby jeden klient nie pojawił się dwa razy w tej samej grupie.
      grupy.get(dostawcaId).set(kosztorys.id, {
        klient: kosztorys.klient.imie_i_nazwisko,
        kosztorysNumer: kosztorys.numer,
        nazwaInwestycji: kosztorys.nazwa_inwestycji,
        status: zamowienie.status_zamowienia_dostawcy,
      })
    }
  }

  return [...grupy.entries()]
    .map(([dostawcaId, wpisyPoKosztorysie]) => ({
      dostawca: dostawcaById.get(dostawcaId),
      wpisy: [...wpisyPoKosztorysie.values()],
    }))
    .filter((grupa) => grupa.dostawca)
    .sort((a, b) => a.dostawca.nazwa.localeCompare(b.dostawca.nazwa, 'pl'))
}

function RaportyPage() {
  const [wczytywanie, setWczytywanie] = useState(true)
  const [raport, setRaport] = useState([])

  useEffect(() => {
    Promise.all([pobierzZamowienia(), pobierzKosztorysy(), pobierzDostawcow()]).then(
      ([zamowienia, kosztorysy, dostawcy]) => {
        setRaport(zbudujRaport(zamowienia, kosztorysy, dostawcy))
        setWczytywanie(false)
      },
    )
  }, [])

  return (
    <div>
      <h1>Raporty</h1>
      <h2>Do zamówienia u dostawcy</h2>
      <p>
        <em>
          Dla każdego dostawcy: klienci, u których w kosztorysie jest jego pozycja, a zamówienie nie ma
          jeszcze statusu „Zamówione kompletnie”.
        </em>
      </p>

      {wczytywanie && <p>Wczytywanie...</p>}

      {!wczytywanie && raport.length === 0 && <p>Brak dostawców z niezamówionymi pozycjami.</p>}

      {!wczytywanie &&
        raport.map((grupa) => (
          <fieldset key={grupa.dostawca.id} style={{ marginTop: 16 }}>
            <legend>
              {grupa.dostawca.nazwa} ({grupa.wpisy.length})
            </legend>
            <table>
              <thead>
                <tr>
                  <th>Klient</th>
                  <th>Kosztorys</th>
                  <th>Status u dostawcy</th>
                </tr>
              </thead>
              <tbody>
                {grupa.wpisy.map((wpis) => (
                  <tr key={wpis.kosztorysNumer}>
                    <td>{wpis.klient}</td>
                    <td>
                      {wpis.kosztorysNumer}
                      {wpis.nazwaInwestycji ? ` (${wpis.nazwaInwestycji})` : ''}
                    </td>
                    <td>{wpis.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </fieldset>
        ))}
    </div>
  )
}

export default RaportyPage
