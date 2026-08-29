function KosztorysyList({ kosztorysy, onWybierz, onAkceptuj, onUsun }) {
  if (kosztorysy.length === 0) {
    return <p>Brak kosztorysów.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Numer</th>
          <th>Klient</th>
          <th>Inwestycja</th>
          <th>Adres montażu</th>
          <th>Data</th>
          <th>Suma brutto</th>
          <th>Status</th>
          <th>Uwagi</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {kosztorysy.map((kosztorys) => (
          <tr key={kosztorys.id} onClick={() => onWybierz(kosztorys)} style={{ cursor: 'pointer' }}>
            <td>{kosztorys.numer}</td>
            <td>{kosztorys.klient.imie_i_nazwisko}</td>
            <td>{kosztorys.nazwa_inwestycji || '—'}</td>
            <td>{kosztorys.adres_montazu || '—'}</td>
            <td>{kosztorys.data}</td>
            <td>{kosztorys.suma_brutto.toFixed(2)} zł</td>
            <td>{kosztorys.wybrany_do_realizacji ? 'Zaakceptowany' : 'Oczekuje'}</td>
            <td>{kosztorys.uwagi || '—'}</td>
            <td>
              {!kosztorys.wybrany_do_realizacji && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onAkceptuj(kosztorys)
                  }}
                >
                  Akceptuj
                </button>
              )}{' '}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onUsun(kosztorys)
                }}
              >
                Usuń
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default KosztorysyList
