import { useEffect, useState } from 'react'
import DostawcyList from '../components/DostawcyList'
import DostawcaForm from '../components/DostawcaForm'
import { pobierzDostawcow, usunDostawce } from '../api'

function DostawcyPage() {
  const [dostawcy, setDostawcy] = useState([])

  useEffect(() => {
    pobierzDostawcow().then(setDostawcy)
  }, [])

  function dodajDostawceDoListy(nowyDostawca) {
    setDostawcy((poprzedni) => [...poprzedni, nowyDostawca])
  }

  async function usunZListy(dostawca) {
    if (!window.confirm(`Usunąć dostawcę „${dostawca.nazwa}"?`)) {
      return
    }
    try {
      await usunDostawce(dostawca.id)
      setDostawcy((poprzedni) => poprzedni.filter((d) => d.id !== dostawca.id))
    } catch (e) {
      window.alert(e.message)
    }
  }

  return (
    <div>
      <h1>Dostawcy</h1>
      <DostawcaForm onUtworzono={dodajDostawceDoListy} />
      <DostawcyList dostawcy={dostawcy} onUsun={usunZListy} />
    </div>
  )
}

export default DostawcyPage
