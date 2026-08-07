import { act, renderHook } from '@testing-library/react';
import { RegistrationProvider, useRegistration } from '@registrant/context/RegistrationContext';

test('stores and clears registration flow state', () => {
  const { result } = renderHook(() => useRegistration(), {
    wrapper: ({ children }) => <RegistrationProvider>{children}</RegistrationProvider>,
  });

  act(() => result.current.setRegistration({ registration_id: 'reg-1', order_id: 'order-1' }));
  expect(result.current.registration?.registration_id).toBe('reg-1');

  act(() => result.current.clearRegistration());
  expect(result.current.registration).toBeNull();
});
