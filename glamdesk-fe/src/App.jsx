import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { VendorProvider } from './context/VendorContext';
import { ClientProvider } from './context/ClientContext';
import { AppointmentProvider } from './context/AppointmentContext';
import { QuotationProvider } from './context/QuotationContext';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <VendorProvider>
            <ClientProvider>
              <AppointmentProvider>
                <QuotationProvider>
                  <BrowserRouter>
                    <AppRoutes />
                  </BrowserRouter>
                </QuotationProvider>
              </AppointmentProvider>
            </ClientProvider>
          </VendorProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;