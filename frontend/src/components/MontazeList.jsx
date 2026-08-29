function MontazeList({ montaze, onWybierz, zaznaczone, onPrzelacz }) {
  if (montaze.length === 0) {
    return <p>Brak montaży.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Klient</th>
          <th>Telefon</th>
          <th>Adres montażu</th>
          <th>Data</th>
          <th>Godzina</th>
          <th>Co do montażu</th>
          <th>Montażysta</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {montaze.map((montaz) => (
          <tr key={montaz.id} onClick={() => onWybierz(montaz)} style={{ cursor: 'pointer' }}>
            <td onClick={(event) => event.stopPropagation()}>
              <input
                type="checkbox"
                checked={zaznaczone.has(montaz.id)}
                onChange={() => onPrzelacz(montaz.id)}
              />
            </td>
            <td>{montaz.kosztorys.klient.imie_i_nazwisko}</td>
            <td>{montaz.kosztorys.klient.telefon}</td>
            <td>{montaz.kosztorys.adres_montazu || '—'}</td>
            <td>{montaz.data_montazu || '—'}</td>
            <td>{montaz.godzina_montazu || '—'}</td>
            <td>{montaz.co_do_montazu || '—'}</td>
            <td>{montaz.nazwa_montazysty || '—'}</td>
            <td>{montaz.status_montazu}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default MontazeList
