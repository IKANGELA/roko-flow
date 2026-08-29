function KlienciList({ klienci, zaznaczone, onPrzelacz }) {
  if (klienci.length === 0) {
    return <p>Brak klientów.</p>
  }

  return (
    <ul>
      {klienci.map((klient) => (
        <li key={klient.id}>
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
