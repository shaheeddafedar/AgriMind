import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { rootApi, initApiConfig, getApiBaseUrl, setApiBaseUrl, clearSessionCookie, getSessionCookie } from '../services/api';

const USER_STORAGE_KEY = '@agrimind_user';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await initApiConfig();
        setApiUrlState(getApiBaseUrl());

        const savedUserStr = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (savedUserStr) {
          try {
            const parsedUser = JSON.parse(savedUserStr);
            if (parsedUser?._id === 'temp_user_id') {
              delete parsedUser._id;
            }
            setUser(parsedUser);
          } catch (parseErr) {
            console.warn('Error parsing cached user:', parseErr);
          }
        }

        // Verify session validity with backend /api/profile
        try {
          const profileRes = await api.get('/profile');
          if (profileRes.data?.success && profileRes.data?.user) {
            setUser(profileRes.data.user);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profileRes.data.user));
          } else {
            // Session is expired or unauthorized, reset user (matching web App.jsx)
            setUser(null);
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
          }
        } catch (sessionErr) {
          if (sessionErr.response?.status === 401 || sessionErr.response?.status === 403) {
            setUser(null);
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
          } else {
            console.log('Session sync note:', sessionErr.message);
          }
        }
      } catch (e) {
        console.warn('Failed to restore user session:', e);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const updateApiUrl = async (newUrl) => {
    await setApiBaseUrl(newUrl);
    setApiUrlState(getApiBaseUrl());
  };

  const login = async (email, password) => {
    try {
      const params = new URLSearchParams();
      params.append('email', email);
      params.append('password', password);

      const response = await rootApi.post('/login', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const responseUrl = response.request?.responseURL || '';
      const responseDataStr = typeof response.data === 'string' ? response.data : JSON.stringify(response.data || '');
      
      const isFailed = responseDataStr.includes('Invalid email or password') || (responseUrl && !responseUrl.endsWith('/dashboard') && responseUrl.endsWith('/'));

      if (isFailed) {
        throw new Error('Invalid email or password.');
      }

      // Immediately fetch the authenticated user profile with the real MongoDB _id
      let loggedUser = null;
      try {
        const profileRes = await api.get('/profile');
        if (profileRes.data?.success && profileRes.data?.user) {
          loggedUser = profileRes.data.user;
        }
      } catch (profileErr) {
        console.warn('Profile fetch after login notice:', profileErr.message);
      }

      // Fallback only if /profile is momentarily unreachable; never use temp_user_id
      if (!loggedUser) {
        const responseUser = response.data?.user;
        loggedUser = {
          _id: responseUser?._id,
          name: responseUser?.name || email.split('@')[0],
          email: responseUser?.email || email,
          location: responseUser?.location || '',
          profilePhoto: responseUser?.profilePhoto || '/images/default-user.png',
        };
      }

      setUser(loggedUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      throw new Error(msg);
    }
  };

  const signup = async (formData, photoAsset = null) => {
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('location', formData.location || 'India');
      data.append('phone', formData.phone);
      data.append('email', formData.email);
      data.append('password', formData.password);

      if (photoAsset && photoAsset.uri) {
        const uriParts = photoAsset.uri.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';
        data.append('profilePhoto', {
          uri: photoAsset.uri,
          name: `profile_${Date.now()}.${fileType}`,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        });
      }

      const response = await rootApi.post('/signup', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseDataStr = typeof response.data === 'string' ? response.data : JSON.stringify(response.data || '');
      if (responseDataStr.includes('Email already exists') || responseDataStr.includes('Signup failed')) {
        throw new Error('Email already exists or signup failed. Please try a different email.');
      }

      // Fetch user profile from /api/profile since backend creates session upon signup
      let newUser = null;
      try {
        const profileRes = await api.get('/profile');
        if (profileRes.data?.success && profileRes.data?.user) {
          newUser = profileRes.data.user;
        }
      } catch (profileErr) {
        console.warn('Profile fetch after signup notice:', profileErr.message);
      }

      if (!newUser) {
        newUser = {
          name: formData.name,
          email: formData.email,
          location: formData.location || 'India',
          phone: formData.phone,
          profilePhoto: photoAsset?.uri || '/images/default-user.png',
        };

        if (response.data?.user) {
          Object.assign(newUser, response.data.user);
        }
      }

      setUser(newUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await rootApi.post('/logout');
    } catch (e) {
      console.warn('Logout request warning:', e);
    } finally {
      setUser(null);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await clearSessionCookie();
    }
  };

  const updateUser = async (updatedData, photoAsset = null) => {
    try {
      const data = new FormData();
      data.append('name', updatedData.name);
      data.append('location', updatedData.location);
      data.append('email', updatedData.email);

      if (photoAsset && photoAsset.uri) {
        const uriParts = photoAsset.uri.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';
        data.append('profilePhoto', {
          uri: photoAsset.uri,
          name: `profile_${Date.now()}.${fileType}`,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        });
      }

      const response = await rootApi.post('/profile/update', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const mergedUser = {
        ...user,
        ...updatedData,
        profilePhoto: photoAsset?.uri || user?.profilePhoto,
      };

      if (response.data?.user) {
        Object.assign(mergedUser, response.data.user);
      }

      setUser(mergedUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mergedUser));
      return { success: true, user: mergedUser };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile.';
      throw new Error(msg);
    }
  };

  const setUserIdDirectly = async (userId) => {
    if (user && userId && userId !== 'temp_user_id' && user._id !== userId) {
      const updated = { ...user, _id: userId };
      setUser(updated);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        apiUrl,
        updateApiUrl,
        login,
        signup,
        logout,
        updateUser,
        setUserIdDirectly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
