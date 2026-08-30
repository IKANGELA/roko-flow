import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import KlienciPage from './pages/KlienciPage'
import KosztorysyPage from './pages/KosztorysyPage'
import ZamowieniaPage from './pages/ZamowieniaPage'
import DostawcyPage from './pages/DostawcyPage'
import MontazePage from './pages/MontazePage'
import RaportyPage from './pages/RaportyPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/klienci" replace />} />
        <Route path="/klienci" element={<KlienciPage />} />
        <Route path="/kosztorysy" element={<KosztorysyPage />} />
        <Route path="/zamowienia" element={<ZamowieniaPage />} />
        <Route path="/dostawcy" element={<DostawcyPage />} />
        <Route path="/montaze" element={<MontazePage />} />
        <Route path="/raporty" element={<RaportyPage />} />
      </Route>
    </Routes>
  )
}

export default App
