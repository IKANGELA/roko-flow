import { useEffect, useState } from 'react'
import KosztorysyList from '../components/KosztorysyList'
import KosztorysForm from '../components/KosztorysForm'
import { pobierzKosztorysy } from '../api'

function KosztorysyPage() {
  const [kosztorysy, setKosztorysy] = useState([])
  const [pokazFormularz, setPokazFormularz] = useState(false)

  useEffect(() => {
    pobierzKosztorysy().then(setKosztorysy)
  }, [])

  function dodajKosztorysDoListy(nowyKosztorys) {
    setKosztorysy((poprzednie) => [...poprzednie, nowyKosztorys])
    setPokazFormularz(false)
  }

  return (
    <div>
      <h1>Kosztorysy</h1>

      <button type="button" onClick={() => setPokazFormularz((poprzedni) => !poprzedni)}>
        {pokazFormularz ? 'Anuluj' : 'Dodaj nowy kosztorys'}
      </button>

      {pokazFormularz && (
        <div style={{ border: '1px solid #ccc', padding: 16, marginTop: 8, marginBottom: 16 }}>
          <KosztorysForm onUtworzono={dodajKosztorysDoListy} />
        </div>
      )}

      <h2>Lista kosztorysów</h2>
      <KosztorysyList kosztorysy={kosztorysy} />
    </div>
  )
}

export default KosztorysyPage
