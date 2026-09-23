import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { VendorProvider } from './context/VendorContext';
import { AppointmentProvider } from './context/AppointmentContext';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <VendorProvider>
            <AppointmentProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AppointmentProvider>
          </VendorProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;