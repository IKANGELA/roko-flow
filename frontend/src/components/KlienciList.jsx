function KlienciList({ klienci, zaznaczone, onPrzelacz }) {
  if (klienci.length === 0) {
    return <p>Brak klientów.</p>
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {klienci.map((klient) => (
        <li key={klient.id} style={{ textAlign: 'left' }}>
          <label>
            <input type="checkbox" checked={zaznaczone.has(klient.id)} onChange={() => onPrzelacz(klient.id)} />{' '}
            {klient.imie_i_nazwisko} — {klient.telefon}
            {klient.email && ` — ${klient.email}`}
          </label>
        </li>
      ))}
    </ul>
  )
}

export default KlienciList
