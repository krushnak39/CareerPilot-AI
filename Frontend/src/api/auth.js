import api from "./axios";

// Register User
export const register = async (userData) => {
  const response = await api.post(
    "/auth/register",
    userData
  );

  return response.data;
};

// Login User
export const login = async (userData) => {
  const response = await api.post(
    "/auth/login",
    userData
  );

  return response.data;
};

// Google Login
export const googleLogin = async (
  credential
) => {
  const response = await api.post(
    "/auth/google",
    {
      credential,
    }
  );

  return response.data;
};

// GitHub Login
export const githubLogin = async (
  code
) => {
  const response = await api.post(
    "/auth/github",
    {
      code,
    }
  );

  return response.data;
};

// LinkedIn Login
export const linkedinLogin = async (
  code
) => {
  const response = await api.post(
    "/auth/linkedin",
    {
      code,
    }
  );

  return response.data;
};

// Unlink Google Account
export const unlinkGoogle = async () => {
  const response = await api.delete(
    "/auth/google"
  );

  return response.data;
};

// Unlink LinkedIn Account
export const unlinkLinkedin = async () => {
  const response = await api.delete(
    "/auth/linkedin"
  );

  return response.data;
};

// Set password for accounts
// that do not have a password
export const setPassword = async (
  passwordData
) => {
  const response = await api.put(
    "/auth/set-password",
    passwordData
  );

  return response.data;
};

// Change Password
export const changePassword = async (
  passwordData
) => {
  const response = await api.put(
    "/auth/change-password",
    passwordData
  );

  return response.data;
};

// Forgot Password
export const forgotPassword = async (
  email
) => {
  const response = await api.post(
    "/auth/forgot-password",
    {
      email,
    }
  );

  return response.data;
};

// Reset Password
export const resetPassword = async ({
  token,
  newPassword,
}) => {
  const response = await api.post(
    "/auth/reset-password",
    {
      token,
      newPassword,
    }
  );

  return response.data;
};