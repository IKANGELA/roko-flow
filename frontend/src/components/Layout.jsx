import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

const POZYCJE_MENU = [
  { sciezka: '/klienci', etykieta: 'Klienci' },
  { sciezka: '/kosztorysy', etykieta: 'Kosztorysy' },
  { sciezka: '/zamowienia', etykieta: 'Zamówienia' },
  { sciezka: '/dostawcy', etykieta: 'Dostawcy' },
  { sciezka: '/montaze', etykieta: 'Montaże' },
]

function Layout() {
  return (
    <div className="uklad">
      <nav className="sidebar">
        <p className="sidebar-logo">ROKO Flow</p>
        <p className="sidebar-tagline">Centrum Designu</p>
        <ul className="sidebar-menu">
          {POZYCJE_MENU.map((pozycja) => (
            <li key={pozycja.sciezka}>
              <NavLink to={pozycja.sciezka} className={({ isActive }) => (isActive ? 'active' : '')}>
                {pozycja.etykieta}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="tresc">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
