function DostawcyList({ dostawcy, zaznaczone, onPrzelacz }) {
  if (dostawcy.length === 0) {
    return <p>Brak dostawców.</p>
  }

  return (
    <ul>
      {dostawcy.map((dostawca) => (
        <li key={dostawca.id}>
          <label>
            <input
              type="checkbox"
              checked={zaznaczone.has(dostawca.id)}
              onChange={() => onPrzelacz(dostawca.id)}
            />{' '}
            <strong>{dostawca.nazwa}</strong>
            {dostawca.specyfikacja && ` — ${dostawca.specyfikacja}`}
          </label>
        </li>
      ))}
    </ul>
  )
}

export default DostawcyList
