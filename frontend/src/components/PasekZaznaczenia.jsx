function PasekZaznaczenia({ liczbaZaznaczonych, onUsun }) {
  if (liczbaZaznaczonych === 0) {
    return null
  }

  return (
    <div
      style={{
        padding: 8,
        background: '#f0f0f0',
        marginTop: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span>Zaznaczono: {liczbaZaznaczonych}</span>
      <button type="button" onClick={onUsun}>
        Usuń zaznaczone
      </button>
    </div>
  )
}

export default PasekZaznaczenia
