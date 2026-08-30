import { useEffect, useState } from 'react'
import KlienciList from '../components/KlienciList'
import KlientForm from '../components/KlientForm'
import PasekZaznaczenia from '../components/PasekZaznaczenia'
import { pobierzKlientow, usunKlienta } from '../api'
import { useZaznaczenie } from '../useZaznaczenie'
import { usunZaznaczoneElementy } from '../usunZaznaczone'

function KlienciPage() {
  const [klienci, setKlienci] = useState([])
  const [szukaj, setSzukaj] = useState('')
  const [widok, setWidok] = useState('lista') // 'lista' | 'nowy' | 'edytuj'
  const [wybranyKlient, setWybranyKlient] = useState(null)
  const { zaznaczone, przelacz, wyczysc } = useZaznaczenie()

  useEffect(() => {
    pobierzKlientow().then(setKlienci)
  }, [])

  const wyszukiwaneKlienci = klienci.filter((klient) =>
    klient.imie_i_nazwisko.toLowerCase().includes(szukaj.trim().toLowerCase()),
  )

  function wrocDoListy() {
    setWidok('lista')
    setWybranyKlient(null)
  }

  function zapisanoKlienta(zapisany) {
    setKlienci((poprzedni) => {
      const juzIstnieje = poprzedni.some((k) => k.id === zapisany.id)
      return juzIstnieje ? poprzedni.map((k) => (k.id === zapisany.id ? zapisany : k)) : [...poprzedni, zapisany]
    })
    wrocDoListy()
  }

  function otworzDoEdycji(klient) {
    setWybranyKlient(klient)
    setWidok('edytuj')
  }

  async function usunZaznaczonych() {
    if (!window.confirm(`Usunąć ${zaznaczone.size} klientów?`)) {
      return
    }
    const { usunieteId, bledy } = await usunZaznaczoneElementy(
      zaznaczone,
      usunKlienta,
      klienci,
      (k) => k.imie_i_nazwisko,
    )
    setKlienci((poprzedni) => poprzedni.filter((k) => !usunieteId.includes(k.id)))
    wyczysc()
    if (bledy.length > 0) {
      window.alert(`Nie udało się usunąć niektórych klientów:\n${bledy.join('\n')}`)
    }
  }

  if (widok === 'nowy' || widok === 'edytuj') {
    return (
      <div>
        <button type="button" onClick={wrocDoListy}>
          ← Powrót do listy klientów
        </button>
        <h1>{widok === 'edytuj' ? 'Edycja klienta' : 'Nowy klient'}</h1>
        <KlientForm klient={widok === 'edytuj' ? wybranyKlient : null} onZapisano={zapisanoKlienta} />
      </div>
    )
  }

  return (
    <div>
      <h1>Klienci</h1>
      <button type="button" onClick={() => setWidok('nowy')}>
        + Dodaj klienta
      </button>
      <h2>Lista klientów</h2>
      <p>
        <em>Kliknij wiersz, żeby otworzyć klienta do edycji.</em>
      </p>
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Szukaj po imieniu i nazwisku..."
          value={szukaj}
          onChange={(event) => setSzukaj(event.target.value)}
        />
      </div>
      <KlienciList
        klienci={wyszukiwaneKlienci}
        onWybierz={otworzDoEdycji}
        zaznaczone={zaznaczone}
        onPrzelacz={przelacz}
      />
      <PasekZaznaczenia liczbaZaznaczonych={zaznaczone.size} onUsun={usunZaznaczonych} />
    </div>
  )
}

export default KlienciPage
