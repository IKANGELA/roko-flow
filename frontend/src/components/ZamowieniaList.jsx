function ZamowieniaList({ zamowienia, onWybierz, zaznaczone, onPrzelacz }) {
  if (zamowienia.length === 0) {
    return <p>Brak zamówień.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Numer</th>
          <th>Kosztorys</th>
          <th>Dostawca</th>
          <th>Status</th>
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
            <td>
              {zamowienie.kosztorys.numer}
              {zamowienie.kosztorys.nazwa_inwestycji ? ` (${zamowienie.kosztorys.nazwa_inwestycji})` : ''}
            </td>
            <td>{zamowienie.dostawca.nazwa}</td>
            <td>{zamowienie.status}</td>
            <td>{zamowienie.wartosc_brutto.toFixed(2)} zł</td>
            <td>{zamowienie.zaliczka_klienta.toFixed(2)} zł</td>
            <td>{zamowienie.do_doplaty.toFixed(2)} zł</td>
            <td>{zamowienie.data_dostawy || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ZamowieniaList
