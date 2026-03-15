import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BuilderPage } from './pages/BuilderPage';
import { TierListPage } from './pages/TierListPage';
import { RankingPage } from './pages/RankingPage';
import { AdminPage } from './pages/AdminPage';
import { ClassesPage } from './pages/ClassesPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, paddingBottom: '3rem' }}>
          <Routes>
            <Route path="/" element={<BuilderPage />} />
            <Route path="/tierlist" element={<TierListPage />} />
            <Route path="/classement" element={<RankingPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<LoginPage />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
