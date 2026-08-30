const PUSTA_POZYCJA = () => ({
  nazwa: '',
  dostawca_id: '',
  montaz_kwota: '',
  opis: '',
  opis_kwota: '',
  kolor: '',
  kolor_kwota: '',
  oscieznica_rodzaj: '',
  oscieznica_rodzaj_kwota: '',
  informacje_dodatkowe: '',
  informacje_dodatkowe_kwota: '',
  szklo: '',
  szklo_kwota: '',
  wentylacja: '',
  wentylacja_kwota: '',
  uwagi: '',
  uwagi_kwota: '',
})

// Kolumny opisowe, które mają pod treścią własne pole na cenę — nazwa pola tekstowego
// i odpowiadającego mu pola z kwotą, zgodnie z układem z arkusza.
const KOLUMNY_Z_CENA = [
  { pole: 'opis', poleKwoty: 'opis_kwota', naglowek: 'Model/wzór' },
  { pole: 'kolor', poleKwoty: 'kolor_kwota', naglowek: 'Kolor' },
  { pole: 'oscieznica_rodzaj', poleKwoty: 'oscieznica_rodzaj_kwota', naglowek: 'Ościeżnica rodzaj' },
  { pole: 'informacje_dodatkowe', poleKwoty: 'informacje_dodatkowe_kwota', naglowek: 'Informacje dodatkowe' },
  { pole: 'szklo', poleKwoty: 'szklo_kwota', naglowek: 'Szkło' },
  { pole: 'wentylacja', poleKwoty: 'wentylacja_kwota', naglowek: 'Wentylacja' },
  { pole: 'uwagi', poleKwoty: 'uwagi_kwota', naglowek: 'Uwagi' },
]

// Wszystkie pola z kwotą pozycji (kolumny opisowe + sam montaż) — suma z nich to suma netto.
const POLA_KWOT = ['montaz_kwota', ...KOLUMNY_Z_CENA.map((kolumna) => kolumna.poleKwoty)]

export function sumaNettoPozycji(pozycja) {
  return POLA_KWOT.reduce((suma, pole) => suma + (Number(pozycja[pole]) || 0), 0)
}

function PozycjeEditor({ pozycje, onZmiana, onZapiszKosztorys, dostawcy = [], niezapisaneZmiany = false }) {
  function dodajPozycje() {
    onZmiana([...pozycje, PUSTA_POZYCJA()])
  }

  function usunPozycje(indeksPozycji) {
    onZmiana(pozycje.filter((_, i) => i !== indeksPozycji))
  }

  function zmienPozycje(indeksPozycji, pole, wartosc) {
    onZmiana(pozycje.map((pozycja, i) => (i === indeksPozycji ? { ...pozycja, [pole]: wartosc } : pozycja)))
  }

  return (
    <div>
      <table className="tabela-pozycji" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '3%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '8%' }} />
          {KOLUMNY_Z_CENA.map((kolumna) => (
            <col key={kolumna.pole} style={{ width: '8%' }} />
          ))}
          <col style={{ width: '9%' }} />
          <col style={{ width: '8%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Lp.</th>
            <th>Nazwa</th>
            <th>Producent/Marka</th>
            <th>Montaż</th>
            {KOLUMNY_Z_CENA.map((kolumna) => (
              <th key={kolumna.pole}>{kolumna.naglowek}</th>
            ))}
            <th>Suma Netto</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pozycje.length === 0 && (
            <tr>
              <td colSpan={6 + KOLUMNY_Z_CENA.length}>Brak pozycji — dodaj pierwszą przyciskiem poniżej.</td>
            </tr>
          )}

          {pozycje.map((pozycja, indeksPozycji) => (
            <tr key={indeksPozycji}>
              <td>{indeksPozycji + 1}</td>
              <td>
                <input
                  value={pozycja.nazwa}
                  onChange={(event) => zmienPozycje(indeksPozycji, 'nazwa', event.target.value)}
                  required
                />
              </td>
              <td>
                <select
                  value={pozycja.dostawca_id}
                  onChange={(event) => zmienPozycje(indeksPozycji, 'dostawca_id', event.target.value)}
                >
                  <option value="">-- brak --</option>
                  {dostawcy.map((dostawca) => (
                    <option key={dostawca.id} value={dostawca.id}>
                      {dostawca.nazwa}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  placeholder="cena"
                  value={pozycja.montaz_kwota}
                  onChange={(event) => zmienPozycje(indeksPozycji, 'montaz_kwota', event.target.value)}
                />
              </td>

              {KOLUMNY_Z_CENA.map((kolumna) => (
                <td key={kolumna.pole}>
                  <div className="komorka-cena">
                    <input
                      placeholder="treść"
                      value={pozycja[kolumna.pole]}
                      onChange={(event) => zmienPozycje(indeksPozycji, kolumna.pole, event.target.value)}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="cena"
                      value={pozycja[kolumna.poleKwoty]}
                      onChange={(event) => zmienPozycje(indeksPozycji, kolumna.poleKwoty, event.target.value)}
                    />
                  </div>
                </td>
              ))}

              <td>
                <strong>{sumaNettoPozycji(pozycja).toFixed(2)} zł</strong>
              </td>
              <td>
                <div className="przyciski-akcji">
                  <button type="button" onClick={() => usunPozycje(indeksPozycji)}>
                    Usuń
                  </button>
                  <button
                    type="button"
                    className={niezapisaneZmiany ? 'do-zapisania' : ''}
                    onClick={onZapiszKosztorys}
                  >
                    Zapisz
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <button type="button" onClick={dodajPozycje}>
          + Dodaj pozycję
        </button>
      </div>
    </div>
  )
}

export default PozycjeEditor
