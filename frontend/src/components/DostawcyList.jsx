function DostawcyList({ dostawcy, onUsun }) {
  if (dostawcy.length === 0) {
    return <p>Brak dostawców.</p>
  }

  return (
    <ul>
      {dostawcy.map((dostawca) => (
        <li key={dostawca.id}>
          <strong>{dostawca.nazwa}</strong>
          {dostawca.specyfikacja && ` — ${dostawca.specyfikacja}`}{' '}
          <button type="button" onClick={() => onUsun(dostawca)}>
            Usuń
          </button>
        </li>
      ))}
    </ul>
  )
}

export default DostawcyList
