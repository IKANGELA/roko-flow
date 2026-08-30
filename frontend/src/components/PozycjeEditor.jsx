import { Fragment, useState } from 'react'

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

function PozycjeEditor({ pozycje, onZmiana, onZapiszKosztorys }) {
  const [rozwinieta, setRozwinieta] = useState(null)

  function dodajPozycje() {
    onZmiana([...pozycje, PUSTA_POZYCJA()])
    setRozwinieta(pozycje.length)
  }

  function usunPozycje(indeksPozycji) {
    onZmiana(pozycje.filter((_, i) => i !== indeksPozycji))
    if (rozwinieta === indeksPozycji) {
      setRozwinieta(null)
    }
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
      <table>
        <thead>
          <tr>
            <th>Nazwa</th>
            <th>Opis</th>
            <th>Kolor</th>
            <th>Ościeżnica rodzaj</th>
            <th>Informacje dodatkowe</th>
            <th>Szkło</th>
            <th>Wentylacja</th>
            <th>Uwagi</th>
            <th>Suma Netto</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pozycje.length === 0 && (
            <tr>
              <td colSpan={10}>Brak pozycji — dodaj pierwszą przyciskiem poniżej.</td>
            </tr>
          )}

          {pozycje.map((pozycja, indeksPozycji) => (
            <Fragment key={indeksPozycji}>
              <tr>
                <td>
                  <input
                    value={pozycja.nazwa}
                    onChange={(event) => zmienPozycje(indeksPozycji, 'nazwa', event.target.value)}
                    required
                  />
                </td>
                <td>
                  <input
                    value={pozycja.opis}
                    onChange={(event) => zmienPozycje(indeksPozycji, 'opis', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={pozycja.kolor}
                    onChange={(event) => zmienPozycje(indeksPozycji, 'kolor', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={pozycja.oscieznica_rodzaj}
                    onChange={(event) => zmienPozycje(indeksPozycji, 'oscieznica_rodzaj', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={pozycja.informacje_dodatkowe}
                    onChange={(event) => zmienPozycje(indeksPozycji, 'informacje_dodatkowe', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={pozycja.szklo}
                    onChange={(event) => zmienPozycje(indeksPozycji, 'szklo', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={pozycja.wentylacja}
                    onChange={(event) => zmienPozycje(indeksPozycji, 'wentylacja', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={pozycja.uwagi}
                    onChange={(event) => zmienPozycje(indeksPozycji, 'uwagi', event.target.value)}
                  />
                </td>
                <td>
                  <strong>{sumaNettoPozycji(pozycja).toFixed(2)} zł</strong>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    onClick={() => setRozwinieta(rozwinieta === indeksPozycji ? null : indeksPozycji)}
                  >
                    Składniki ({pozycja.skladniki.length})
                  </button>{' '}
                  <button type="button" onClick={() => usunPozycje(indeksPozycji)}>
                    Usuń
                  </button>{' '}
                  <button type="button" onClick={onZapiszKosztorys}>
                    Zapisz
                  </button>
                </td>
              </tr>

              {rozwinieta === indeksPozycji && (
                <tr>
                  <td colSpan={10} style={{ background: 'var(--bg)' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Składnik kosztu</th>
                          <th>Kwota</th>
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
                              <button
                                type="button"
                                onClick={() => usunSkladnik(indeksPozycji, indeksSkladnika)}
                              >
                                Usuń
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ marginTop: 8 }}>
                      <button type="button" onClick={() => dodajSkladnik(indeksPozycji)}>
                        + Dodaj składnik kosztu
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
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
