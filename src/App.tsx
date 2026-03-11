import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BuilderPage } from './pages/BuilderPage';
import { SuggestionsPage } from './pages/SuggestionsPage';
import { TierListPage } from './pages/TierListPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, paddingBottom: '3rem' }}>
          <Routes>
            <Route path="/" element={<BuilderPage />} />
            <Route path="/suggestions" element={<SuggestionsPage />} />
            <Route path="/tierlist" element={<TierListPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <footer
          style={{
            borderTop: '1px solid #30363d',
            padding: '1rem',
            textAlign: 'center',
            color: '#8b949e',
            fontSize: '0.75rem',
            background: '#161b22',
          }}
        >
          Dofus Team Builder — Données sauvegardées localement dans votre navigateur
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
