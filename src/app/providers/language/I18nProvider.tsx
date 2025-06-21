import { type ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/utils/i18n";

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const [isLoading,setIsLoading] = useState(true);

  useEffect(() => {
    const initializeI18n = async () => {
      try {

        await i18n.loadNamespaces("translation");
        
        if (i18n.language !== i18n.resolvedLanguage) {
          await i18n.changeLanguage(i18n.resolvedLanguage);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load i18n resources:", error);
      }
    };

    initializeI18n();
  }, []);

  if(isLoading) return <div>Loading Language</div>

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};
