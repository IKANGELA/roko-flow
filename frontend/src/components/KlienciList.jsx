function KlienciList({ klienci, onWybierz, zaznaczone, onPrzelacz, liczbyDlaKlienta }) {
  if (klienci.length === 0) {
    return <p>Brak klientów.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Imię i nazwisko</th>
          <th>Typ</th>
          <th>Telefon</th>
          <th>E-mail</th>
          <th>Adres</th>
          <th>NIP</th>
          <th>Uwagi</th>
          <th>Kosztorysy</th>
          <th>Zamówienia</th>
        </tr>
      </thead>
      <tbody>
        {klienci.map((klient) => {
          const liczby = liczbyDlaKlienta(klient.id)
          return (
            <tr key={klient.id} onClick={() => onWybierz(klient)} style={{ cursor: 'pointer' }}>
              <td onClick={(event) => event.stopPropagation()}>
                <input type="checkbox" checked={zaznaczone.has(klient.id)} onChange={() => onPrzelacz(klient.id)} />
              </td>
              <td>{klient.imie_i_nazwisko}</td>
              <td>{klient.typ_klienta || 'Prywatny'}</td>
              <td>{klient.telefon}</td>
              <td>{klient.email || '—'}</td>
              <td>{klient.adres || '—'}</td>
              <td>{klient.nip || '—'}</td>
              <td>{klient.uwagi || '—'}</td>
              <td>{liczby.kosztorysy}</td>
              <td>{liczby.zamowienia}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default KlienciList
