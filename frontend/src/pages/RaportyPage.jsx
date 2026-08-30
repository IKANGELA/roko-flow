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

// Suma kwot, które klienci mają jeszcze dopłacić — łącznie, po wszystkich zamówieniach
// (niezależnie od etapu), bo to pieniądze firmy niezależnie od tego, na jakim etapie jest sprawa.
function sumaDoDoplaty(zamowienia) {
  return zamowienia.reduce((suma, z) => suma + (z.do_doplaty || 0), 0)
}

// Wpłacone zaliczki klientów pogrupowane wg daty wpłaty, od najnowszej — tylko tam,
// gdzie faktycznie zapisano datę i kwotę większą od zera.
function zaliczkiWgDaty(zamowienia) {
  const sumyPoDacie = new Map()
  for (const z of zamowienia) {
    if (!z.data_zaliczki || !z.zaliczka_klienta) {
      continue
    }
    sumyPoDacie.set(z.data_zaliczki, (sumyPoDacie.get(z.data_zaliczki) || 0) + z.zaliczka_klienta)
  }
  return [...sumyPoDacie.entries()]
    .map(([data, suma]) => ({ data, suma }))
    .sort((a, b) => b.data.localeCompare(a.data))
}

// Wartość brutto zamówień, które nie mają jeszcze statusu "Zakończone" — czyli firma
// ma jeszcze przed sobą pracę (dostawę, montaż, dokończenie...) o tej łącznej wartości.
function sumaBruttoWRealizacji(zamowienia) {
  return zamowienia
    .filter((z) => z.status !== 'Zakończone')
    .reduce((suma, z) => suma + (z.wartosc_brutto || 0), 0)
}

function RaportyPage() {
  const [wczytywanie, setWczytywanie] = useState(true)
  const [raportDostawcy, setRaportDostawcy] = useState([])
  const [doDoplaty, setDoDoplaty] = useState(0)
  const [zaliczki, setZaliczki] = useState([])
  const [bruttoWRealizacji, setBruttoWRealizacji] = useState(0)

  useEffect(() => {
    Promise.all([pobierzZamowienia(), pobierzKosztorysy(), pobierzDostawcow()]).then(
      ([zamowienia, kosztorysy, dostawcy]) => {
        setRaportDostawcy(zbudujRaport(zamowienia, kosztorysy, dostawcy))
        setDoDoplaty(sumaDoDoplaty(zamowienia))
        setZaliczki(zaliczkiWgDaty(zamowienia))
        setBruttoWRealizacji(sumaBruttoWRealizacji(zamowienia))
        setWczytywanie(false)
      },
    )
  }, [])

  if (wczytywanie) {
    return (
      <div>
        <h1>Raporty operacyjne</h1>
        <p>Wczytywanie...</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Raporty operacyjne</h1>

      <h2>Podsumowanie finansowe</h2>
      <div className="siatka-pol">
        <label>
          Do dopłaty od klientów (łącznie)
          <input value={`${doDoplaty.toFixed(2)} zł`} disabled />
        </label>
        <label>
          Wartość brutto zamówień w realizacji
          <input value={`${bruttoWRealizacji.toFixed(2)} zł`} disabled />
        </label>
      </div>

      <h3 style={{ marginTop: 16 }}>Wpłacone zaliczki wg daty</h3>
      {zaliczki.length === 0 && <p>Brak zarejestrowanych wpłat zaliczek.</p>}
      {zaliczki.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Suma zaliczek</th>
            </tr>
          </thead>
          <tbody>
            {zaliczki.map((wpis) => (
              <tr key={wpis.data}>
                <td>{wpis.data}</td>
                <td>{wpis.suma.toFixed(2)} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: 32 }}>Zamówienia do dostawców</h2>
      <p>
        <em>
          Dla każdego dostawcy: klienci, u których w kosztorysie jest jego pozycja, a zamówienie nie ma
          jeszcze statusu „Zamówione kompletnie”.
        </em>
      </p>

      {raportDostawcy.length === 0 && <p>Brak dostawców z niezamówionymi pozycjami.</p>}

      {raportDostawcy.map((grupa) => (
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
