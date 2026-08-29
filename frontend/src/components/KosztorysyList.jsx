function KosztorysyList({ kosztorysy }) {
  if (kosztorysy.length === 0) {
    return <p>Brak kosztorysów.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Numer</th>
          <th>Inwestycja</th>
          <th>Suma brutto</th>
          <th>Zaliczka</th>
          <th>Do dopłaty</th>
        </tr>
      </thead>
      <tbody>
        {kosztorysy.map((kosztorys) => (
          <tr key={kosztorys.id}>
            <td>{kosztorys.numer}</td>
            <td>{kosztorys.nazwa_inwestycji || '—'}</td>
            <td>{kosztorys.suma_brutto.toFixed(2)} zł</td>
            <td>{kosztorys.zaliczka.toFixed(2)} zł</td>
            <td>{kosztorys.do_doplaty.toFixed(2)} zł</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default KosztorysyList
