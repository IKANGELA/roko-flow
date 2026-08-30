import { STATUSY_ZAMOWIENIA } from '../zamowienieUtils'

function ZamowieniaList({ zamowienia, onWybierz, zaznaczone, onPrzelacz, onZmienStatus, onZmienStatusDostawcy }) {
  if (zamowienia.length === 0) {
    return <p>Brak zamówień.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Numer</th>
          <th>Klient</th>
          <th>Kosztorys</th>
          <th>Status</th>
          <th>Zamówione u dostawcy</th>
          <th>Wartość brutto</th>
          <th>Zaliczka klienta</th>
          <th>Do dopłaty</th>
          <th>Data dostawy</th>
        </tr>
      </thead>
      <tbody>
        {zamowienia.map((zamowienie) => (
          <tr key={zamowienie.id} onClick={() => onWybierz(zamowienie)} style={{ cursor: 'pointer' }}>
            <td onClick={(event) => event.stopPropagation()}>
              <input
                type="checkbox"
                checked={zaznaczone.has(zamowienie.id)}
                onChange={() => onPrzelacz(zamowienie.id)}
              />
            </td>
            <td>{zamowienie.numer_zamowienia || '—'}</td>
            <td>{zamowienie.kosztorys ? zamowienie.kosztorys.klient.imie_i_nazwisko : '—'}</td>
            <td>
              {zamowienie.kosztorys
                ? `${zamowienie.kosztorys.numer}${zamowienie.kosztorys.nazwa_inwestycji ? ` (${zamowienie.kosztorys.nazwa_inwestycji})` : ''}`
                : '—'}
            </td>
            <td onClick={(event) => event.stopPropagation()}>
              <select value={zamowienie.status} onChange={(event) => onZmienStatus(zamowienie, event.target.value)}>
                {STATUSY_ZAMOWIENIA.map((wartosc) => (
                  <option key={wartosc} value={wartosc}>
                    {wartosc}
                  </option>
                ))}
              </select>
            </td>
            <td onClick={(event) => event.stopPropagation()}>
              <select
                value={zamowienie.status_zamowienia_dostawcy}
                onChange={(event) => onZmienStatusDostawcy(zamowienie, event.target.value)}
              >
                <option value="Do zamówienia">Do zamówienia</option>
                <option value="Zamówione częściowo">Zamówione częściowo</option>
                <option value="Zamówione kompletnie">Zamówione kompletnie</option>
              </select>
            </td>
            <td>{zamowienie.wartosc_brutto === null ? '—' : `${zamowienie.wartosc_brutto.toFixed(2)} zł`}</td>
            <td>{zamowienie.zaliczka_klienta.toFixed(2)} zł</td>
            <td>{zamowienie.do_doplaty === null ? '—' : `${zamowienie.do_doplaty.toFixed(2)} zł`}</td>
            <td>{zamowienie.data_dostawy || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ZamowieniaList
