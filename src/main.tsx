import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/app/stores/store";
import { Provider } from "react-redux";
import { ThemeProvider } from "@/app/providers/theme/ThemeProvider";
import LoadingPage from "./pages/common/LoadingPage";
import "@fontsource/inter/400.css";
import "@fontsource/inter/400-italic.css";

const App = lazy(() => import("./App"));
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {/* <I18nProvider> */}
        <Provider store={store}>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Suspense fallback={<LoadingPage/>}>
              <App />
              <Toaster />
            </Suspense>
          </ThemeProvider>
        </Provider>
      {/* </I18nProvider> */}
    </ErrorBoundary>
   </StrictMode>
)
