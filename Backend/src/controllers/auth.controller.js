const {
  registerUser,
  loginUser,
  googleLoginUser,
  githubLoginUser,
  linkedinLoginUser,
  unlinkGoogleUser,
  unlinkLinkedinUser,
  setPasswordUser,
  changePasswordUser,
  forgotPasswordUser,
  resetPasswordUser,
} = require("../services/auth.service");

// ==========================
// REGISTER
// ==========================
const register = async (
  req,
  res,
  next
) => {
  try {
    const {
      fullName,
      email,
      password,
    } = req.body;

    const result =
      await registerUser({
        fullName,
        email,
        password,
      });

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Register Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// LOGIN
// ==========================
const login = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const result =
      await loginUser({
        email,
        password,
      });

    return res.status(200).json({
      success: true,
      message:
        "Login successful",
      data: result,
    });
  } catch (error) {
    console.error(
      "Login Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// GOOGLE LOGIN
// ==========================
const googleLogin = async (
  req,
  res,
  next
) => {
  try {
    const {
      credential,
    } = req.body;

    const result =
      await googleLoginUser({
        credential,
      });

    return res.status(200).json({
      success: true,
      message:
        "Google login successful",
      data: result,
    });
  } catch (error) {
    console.error(
      "Google Login Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// GITHUB LOGIN
// ==========================
const githubLogin = async (
  req,
  res,
  next
) => {
  try {
    const {
      code,
    } = req.body || {};

    if (!code) {
      return res.status(400).json({
        success: false,
        message:
          "GitHub authorization code is required",
      });
    }

    const result =
      await githubLoginUser({
        code,
      });

    return res.status(200).json({
      success: true,
      message:
        "GitHub login successful",
      data: result,
    });
  } catch (error) {
    console.error(
      "GitHub Login Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// LINKEDIN LOGIN
// ==========================
const linkedinLogin = async (
  req,
  res,
  next
) => {
  try {
    const {
      code,
    } = req.body || {};

    if (!code) {
      return res.status(400).json({
        success: false,
        message:
          "LinkedIn authorization code is required",
      });
    }

    const result =
      await linkedinLoginUser({
        code,
      });

    return res.status(200).json({
      success: true,
      message:
        "LinkedIn login successful",
      data: result,
    });
  } catch (error) {
    console.error(
      "LinkedIn Login Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// CURRENT USER
// ==========================
const getCurrentUser = async (
  req,
  res
) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

// ==========================
// SET PASSWORD
// ==========================
const setPassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      newPassword,
    } = req.body || {};

    await setPasswordUser({
      userId:
        req.user.id,

      newPassword,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password set successfully",
    });
  } catch (error) {
    console.error(
      "Set Password Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// CHANGE PASSWORD
// ==========================
const changePassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body || {};

    await changePasswordUser({
      userId:
        req.user.id,

      currentPassword,

      newPassword,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change Password Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// FORGOT PASSWORD
// ==========================
const forgotPassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
    } = req.body || {};

    const result =
      await forgotPasswordUser({
        email,
      });

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with that email, a password reset request has been created.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// RESET PASSWORD
// ==========================
const resetPassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      token,
      newPassword,
    } = req.body || {};

    await resetPasswordUser({
      token,
      newPassword,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset Password Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// UNLINK GOOGLE
// ==========================
const unlinkGoogle = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await unlinkGoogleUser(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Google account removed successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Unlink Google Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// UNLINK LINKEDIN
// ==========================
const unlinkLinkedin = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await unlinkLinkedinUser(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message:
        "LinkedIn account removed successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Unlink LinkedIn Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// EXPORTS
// ==========================
module.exports = {
  register,
  login,
  googleLogin,
  githubLogin,
  linkedinLogin,
  getCurrentUser,
  setPassword,
  changePassword,
  forgotPassword,
  resetPassword,
  unlinkGoogle,
  unlinkLinkedin,
};