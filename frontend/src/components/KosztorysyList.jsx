function KosztorysyList({ kosztorysy, onWybierz }) {
  if (kosztorysy.length === 0) {
    return <p>Brak kosztorysów.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Numer</th>
          <th>Imię i nazwisko</th>
          <th>Telefon</th>
          <th>Adres montażu</th>
          <th>Data</th>
          <th>Suma brutto</th>
          <th>Zaliczka</th>
          <th>Do dopłaty</th>
          <th>Wybrany do realizacji</th>
          <th>Uwagi</th>
        </tr>
      </thead>
      <tbody>
        {kosztorysy.map((kosztorys) => (
          <tr key={kosztorys.id} onClick={() => onWybierz(kosztorys)} style={{ cursor: 'pointer' }}>
            <td>{kosztorys.numer}</td>
            <td>{kosztorys.klient.imie_i_nazwisko}</td>
            <td>{kosztorys.klient.telefon}</td>
            <td>{kosztorys.adres_montazu || '—'}</td>
            <td>{kosztorys.data}</td>
            <td>{kosztorys.suma_brutto.toFixed(2)} zł</td>
            <td>{kosztorys.zaliczka.toFixed(2)} zł</td>
            <td>{kosztorys.do_doplaty.toFixed(2)} zł</td>
            <td>{kosztorys.wybrany_do_realizacji ? 'Tak' : 'Nie'}</td>
            <td>{kosztorys.uwagi || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default KosztorysyList
