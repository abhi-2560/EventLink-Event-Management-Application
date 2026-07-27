import {
    createContext,
    useContext,
    useState,
} from "react";

const RegistrationContext =
    createContext();

export function RegistrationProvider({
    children,
}) {

    const [registration,
        setRegistration] =
        useState({

            event: null,

            participants: [],

            contact: null,

            total: 0,

        });

    return (
        <RegistrationContext.Provider
            value={{
                registration,
                setRegistration,
            }}
        >
            {children}
        </RegistrationContext.Provider>
    );
}

export function useRegistration() {
    return useContext(
        RegistrationContext
    );
}