import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/tokens.css';
import './styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// The provider wraps the route tree so every page can read the same mock session through context.
// QueryClient manages cached query data and fetching.
// QueryClientProvider makes that client available to components using useQuery or useQueryClient.
const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
