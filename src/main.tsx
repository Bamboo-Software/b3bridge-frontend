import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/sonner";
import { Provider } from "react-redux";
import LoadingPage from "./pages/common/LoadingPage";
import "@fontsource/inter/400.css";
import "@fontsource/inter/400-italic.css";
import './index.css'
import { store } from './stores/store';
import { ThemeProvider } from './providers/theme/ThemeProvider';
import { WagmiProvider } from './providers/wallet/WagmiProvider';

const App = lazy(() => import("./App"));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {/* <I18nProvider> */}
        <Provider store={store}>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <WagmiProvider>
              <Suspense fallback={<LoadingPage/>}>
                <App />
                <Toaster />
              </Suspense>
            </WagmiProvider>
          </ThemeProvider>
        </Provider>
      {/* </I18nProvider> */}
    </ErrorBoundary>
   </StrictMode>
)
