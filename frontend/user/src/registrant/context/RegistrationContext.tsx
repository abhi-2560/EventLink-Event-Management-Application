import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { Registration } from '@shared/types/api';

export type RegistrationFlowState = Partial<Registration> & {
  registration_id?: string;
  order_id?: string;
  payment_id?: string;
  amount?: string | number;
  payment_status?: string;
};

interface RegistrationContextValue {
  registration: RegistrationFlowState | null;
  setRegistration: Dispatch<SetStateAction<RegistrationFlowState | null>>;
  clearRegistration: () => void;
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [registration, setRegistration] = useState<RegistrationFlowState | null>(null);

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
