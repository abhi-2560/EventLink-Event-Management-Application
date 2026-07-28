import { createContext, useContext, useMemo, useState } from 'react';

const RegistrationContext = createContext(null);

export function RegistrationProvider({ children }) {
  const [registration, setRegistration] = useState(null);

  const value = useMemo(
    () => ({
      registration,
      setRegistration,
      clearRegistration: () => setRegistration(null),
    }),
    [registration],
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return context;
}
