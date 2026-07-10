import { createContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, loginUser, registerUser, logoutUser, updateUserInfo } from '../store/slices/authSlice';

export const AuthContext = createContext();

// AuthProvider is kept for backward compatibility but now delegates to Redux.
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // On app startup, restore session from token
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.rejected.match(result)) {
      const error = new Error(result.payload);
      error.response = { data: { message: result.payload } };
      throw error;
    }
    return result.payload; // { user, token }
  };

  const register = async (userData) => {
    const result = await dispatch(registerUser(userData));
    if (registerUser.rejected.match(result)) {
      const error = new Error(result.payload);
      error.response = { data: { message: result.payload } };
      throw error;
    }
    return result.payload;
  };

  const logout = async () => {
    await dispatch(logoutUser());
  };

  const updateUser = (updatedUserData) => {
    dispatch(updateUserInfo(updatedUserData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
