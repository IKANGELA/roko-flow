import { NavLink, Outlet } from 'react-router-dom'

const POZYCJE_MENU = [
  { sciezka: '/klienci', etykieta: 'Klienci' },
  { sciezka: '/kosztorysy', etykieta: 'Kosztorysy' },
  { sciezka: '/zamowienia', etykieta: 'Zamówienia' },
  { sciezka: '/dostawcy', etykieta: 'Dostawcy' },
  { sciezka: '/montaze', etykieta: 'Montaże' },
]

function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 200, borderRight: '1px solid #ddd', padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>ROKO Flow</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {POZYCJE_MENU.map((pozycja) => (
            <li key={pozycja.sciezka} style={{ marginBottom: 8 }}>
              <NavLink
                to={pozycja.sciezka}
                style={({ isActive }) => ({
                  fontWeight: isActive ? 'bold' : 'normal',
                  textDecoration: 'none',
                })}
              >
                {pozycja.etykieta}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
