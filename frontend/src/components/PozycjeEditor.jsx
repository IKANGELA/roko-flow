const PUSTA_POZYCJA = () => ({
  nazwa: '',
  opis: '',
  kolor: '',
  oscieznica_rodzaj: '',
  informacje_dodatkowe: '',
  szklo: '',
  wentylacja: '',
  uwagi: '',
  skladniki: [],
})

const PUSTY_SKLADNIK = () => ({ opis: '', kwota: '' })

export function sumaNettoPozycji(pozycja) {
  return pozycja.skladniki.reduce((suma, skladnik) => suma + (Number(skladnik.kwota) || 0), 0)
}

function PozycjeEditor({ pozycje, onZmiana }) {
  function dodajPozycje() {
    onZmiana([...pozycje, PUSTA_POZYCJA()])
  }

  function usunPozycje(indeksPozycji) {
    onZmiana(pozycje.filter((_, i) => i !== indeksPozycji))
  }

  function zmienPozycje(indeksPozycji, pole, wartosc) {
    onZmiana(pozycje.map((pozycja, i) => (i === indeksPozycji ? { ...pozycja, [pole]: wartosc } : pozycja)))
  }

  function dodajSkladnik(indeksPozycji) {
    zmienPozycje(indeksPozycji, 'skladniki', [...pozycje[indeksPozycji].skladniki, PUSTY_SKLADNIK()])
  }

  function usunSkladnik(indeksPozycji, indeksSkladnika) {
    zmienPozycje(
      indeksPozycji,
      'skladniki',
      pozycje[indeksPozycji].skladniki.filter((_, i) => i !== indeksSkladnika),
    )
  }

  function zmienSkladnik(indeksPozycji, indeksSkladnika, pole, wartosc) {
    zmienPozycje(
      indeksPozycji,
      'skladniki',
      pozycje[indeksPozycji].skladniki.map((skladnik, i) =>
        i === indeksSkladnika ? { ...skladnik, [pole]: wartosc } : skladnik,
      ),
    )
  }

  return (
    <div>
      <h3>Pozycje</h3>
      {pozycje.length === 0 && <p>Brak pozycji — dodaj pierwszą przyciskiem poniżej.</p>}

      {pozycje.map((pozycja, indeksPozycji) => (
        <div key={indeksPozycji} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <input
              placeholder="Nazwa (np. Drzwi do salonu)"
              value={pozycja.nazwa}
              onChange={(event) => zmienPozycje(indeksPozycji, 'nazwa', event.target.value)}
              required
            />
            <input
              placeholder="Opis"
              value={pozycja.opis}
              onChange={(event) => zmienPozycje(indeksPozycji, 'opis', event.target.value)}
            />
            <input
              placeholder="Kolor"
              value={pozycja.kolor}
              onChange={(event) => zmienPozycje(indeksPozycji, 'kolor', event.target.value)}
            />
            <input
              placeholder="Ościeżnica rodzaj"
              value={pozycja.oscieznica_rodzaj}
              onChange={(event) => zmienPozycje(indeksPozycji, 'oscieznica_rodzaj', event.target.value)}
            />
            <input
              placeholder="Informacje dodatkowe"
              value={pozycja.informacje_dodatkowe}
              onChange={(event) => zmienPozycje(indeksPozycji, 'informacje_dodatkowe', event.target.value)}
            />
            <input
              placeholder="Szkło"
              value={pozycja.szklo}
              onChange={(event) => zmienPozycje(indeksPozycji, 'szklo', event.target.value)}
            />
            <input
              placeholder="Wentylacja"
              value={pozycja.wentylacja}
              onChange={(event) => zmienPozycje(indeksPozycji, 'wentylacja', event.target.value)}
            />
            <input
              placeholder="Uwagi"
              value={pozycja.uwagi}
              onChange={(event) => zmienPozycje(indeksPozycji, 'uwagi', event.target.value)}
            />
            <button type="button" onClick={() => usunPozycje(indeksPozycji)}>
              Usuń pozycję
            </button>
          </div>

          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Składnik kosztu</th>
                <th style={{ textAlign: 'left' }}>Kwota</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pozycja.skladniki.map((skladnik, indeksSkladnika) => (
                <tr key={indeksSkladnika}>
                  <td>
                    <input
                      placeholder="np. Montaż drzwi, Podfrezowanie, Ościeżnica"
                      value={skladnik.opis}
                      onChange={(event) =>
                        zmienSkladnik(indeksPozycji, indeksSkladnika, 'opis', event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={skladnik.kwota}
                      onChange={(event) =>
                        zmienSkladnik(indeksPozycji, indeksSkladnika, 'kwota', event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => usunSkladnik(indeksPozycji, indeksSkladnika)}>
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" onClick={() => dodajSkladnik(indeksPozycji)}>
            + Dodaj składnik kosztu
          </button>

          <p>
            <strong>Suma netto pozycji: {sumaNettoPozycji(pozycja).toFixed(2)} zł</strong>
          </p>
        </div>
      ))}

      <button type="button" onClick={dodajPozycje}>
        + Dodaj pozycję
      </button>
    </div>
  )
}

export default PozycjeEditor
