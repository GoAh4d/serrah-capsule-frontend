import { AuthProvider } from './context/AuthContext';
import { EnvironmentProvider } from './context/EnvironmentContext';
import MainApp from './MainApp';
import './styles/index.css';

export default function App() {
  return (
    <AuthProvider>
      <EnvironmentProvider>
        <MainApp />
      </EnvironmentProvider>
    </AuthProvider>
  );
}
