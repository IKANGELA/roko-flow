function KlienciList({ klienci }) {
  if (klienci.length === 0) {
    return <p>Brak klientów.</p>
  }

  return (
    <ul>
      {klienci.map((klient) => (
        <li key={klient.id}>
          {klient.imie_i_nazwisko} — {klient.telefon}
          {klient.email && ` — ${klient.email}`}
        </li>
      ))}
    </ul>
  )
}

export default KlienciList
