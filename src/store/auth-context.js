import { createContext, useState, useEffect } from "react";

let logoutTimer;

// intialize context with some initial data
// so that we define the general shape of our context and get better autocompletion later
const AuthContext = createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime(); // gets current time in milliseconds
  const adjExpirationTime = new Date(expirationTime).getTime();

  const remainingDuration = adjExpirationTime - currentTime;

  return remainingDuration;
};

const retrievedStoredToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedExpirationDate = localStorage.getItem("expirationTime");

  const remainingTime = calculateRemainingTime(storedExpirationDate);

  if (remainingTime <= 60000) {
    localStorage.removeItem("toekn");
    localStorage.removeItem("expirationTime");
    return null;
  }

  return { token: storedToken, duration: remainingTime };
};

// AuthContextProvider component responsible for managing the auth related state.
// receives props
// and returns AuthContext.Provider wrapped around props.children
// so that we can then use AuthContextProvider component as wrapper around other components
// that then will have access to AuthContext
// and its in this AuthContextProvider component where I want to manage state for that auth data
export const AuthContextProvider = (props) => {
  const tokenData = retrievedStoredToken();
  // const initialToken = localStorage.getItem("token");
  let initialToken;
  if (tokenData) {
    initialToken = tokenData.token;
  }

  // const [token, setToken] = useState(null);
  const [token, setToken] = useState(initialToken);
  // we do not need a useEffect here
  // that is possible because localStorage is a synchronous API

  // !! operator converts the truthy/falsy value to a true or false
  const userIsLoggedIn = !!token;

  // function for changing the token state
  const logoutHandler = () => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expirtionTime");

    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  };

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expirationTime", expirationTime);

    const remainingTime = calculateRemainingTime(expirationTime);

    // setTimeout(logoutHandler, 3000);
    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  useEffect(() => {
    if (tokenData) {
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
