import React, { createContext, useContext } from "react";

export const AuthContext = createContext({ token: null, setToken: () => {} });

export const useAuth = () => useContext(AuthContext);
