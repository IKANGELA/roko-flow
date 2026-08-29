import { useEffect, useState } from 'react'

function App() {
  const [klienci, setKlienci] = useState([])

  useEffect(() => {
    fetch('http://localhost:8000/klienci/')
      .then((odpowiedz) => odpowiedz.json())
      .then((dane) => setKlienci(dane))
  }, [])

  return (
    <div>
      <h1>ROKO Flow</h1>
      <h2>Klienci</h2>
      <ul>
        {klienci.map((klient) => (
          <li key={klient.id}>
            {klient.imie_i_nazwisko} — {klient.telefon}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
