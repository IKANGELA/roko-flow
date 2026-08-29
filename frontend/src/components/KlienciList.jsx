function KlienciList({ klienci, onUsun }) {
  if (klienci.length === 0) {
    return <p>Brak klientów.</p>
  }

  return (
    <ul>
      {klienci.map((klient) => (
        <li key={klient.id}>
          {klient.imie_i_nazwisko} — {klient.telefon}
          {klient.email && ` — ${klient.email}`}{' '}
          <button type="button" onClick={() => onUsun(klient)}>
            Usuń
          </button>
        </li>
      ))}
    </ul>
  )
}

export default KlienciList
