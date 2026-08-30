import { STATUSY_ZAMOWIENIA } from '../zamowienieUtils'

function ZamowieniaList({ zamowienia, onWybierz, zaznaczone, onPrzelacz, onZmienStatus }) {
  if (zamowienia.length === 0) {
    return <p>Brak zamówień.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Klient</th>
          <th>Numer</th>
          <th>Data zamówienia</th>
          <th>Adres montażu</th>
          <th>Wartość brutto</th>
          <th>Zaliczka od klienta</th>
          <th>Do dopłaty</th>
          <th>Data dostawy</th>
          <th>Status</th>
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
            <td>
              {zamowienie.klient?.imie_i_nazwisko || zamowienie.kosztorys?.klient?.imie_i_nazwisko || '—'}
            </td>
            <td>{zamowienie.numer_zamowienia || '—'}</td>
            <td>{zamowienie.data_zamowienia || '—'}</td>
            <td>{zamowienie.adres_montazu || '—'}</td>
            <td>{zamowienie.wartosc_brutto === null ? '—' : `${zamowienie.wartosc_brutto.toFixed(2)} zł`}</td>
            <td>{zamowienie.zaliczka_klienta.toFixed(2)} zł</td>
            <td>{zamowienie.do_doplaty === null ? '—' : `${zamowienie.do_doplaty.toFixed(2)} zł`}</td>
            <td>{zamowienie.data_dostawy || '—'}</td>
            <td onClick={(event) => event.stopPropagation()}>
              <select value={zamowienie.status} onChange={(event) => onZmienStatus(zamowienie, event.target.value)}>
                {STATUSY_ZAMOWIENIA.map((wartosc) => (
                  <option key={wartosc} value={wartosc}>
                    {wartosc}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ZamowieniaList
