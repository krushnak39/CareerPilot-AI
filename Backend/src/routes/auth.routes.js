const express = require("express");

const router = express.Router();

const {
  register,
  login,
  googleLogin,
  githubLogin,
  linkedinLogin,
  unlinkGoogle,
  unlinkLinkedin,
  getCurrentUser,
  setPassword,
  changePassword,
  forgotPassword,
  resetPassword,
} = require(
  "../controllers/auth.controller"
);

const authMiddleware = require(
  "../middleware/auth.middleware"
);

const {
  authLimiter,
  loginLimiter,
} = require(
  "../middleware/rateLimit.middleware"
);

const {
  validateRegister,
  validateLogin,
} = require(
  "../middleware/validation.middleware"
);

// ==========================
// REGISTER
// ==========================

router.post(
  "/register",
  authLimiter,
  validateRegister,
  register
);

// ==========================
// LOGIN
// ==========================

router.post(
  "/login",
  loginLimiter,
  validateLogin,
  login
);

// ==========================
// GOOGLE LOGIN
// ==========================

router.post(
  "/google",
  authLimiter,
  googleLogin
);

// ==========================
// GITHUB LOGIN
// ==========================

router.post(
  "/github",
  authLimiter,
  githubLogin
);

// ==========================
// LINKEDIN LOGIN
// ==========================

router.post(
  "/linkedin",
  authLimiter,
  linkedinLogin
);

// ==========================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ==========================

router.post(
  "/forgot-password",
  authLimiter,
  forgotPassword
);

// ==========================
// RESET PASSWORD
// POST /api/auth/reset-password
// ==========================

router.post(
  "/reset-password",
  authLimiter,
  resetPassword
);

// ==========================
// SET PASSWORD
// PUT /api/auth/set-password
// ==========================

router.put(
  "/set-password",
  authMiddleware,
  setPassword
);

// ==========================
// CHANGE PASSWORD
// PUT /api/auth/change-password
// ==========================

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

// ==========================
// UNLINK GOOGLE
// ==========================

router.delete(
  "/google",
  authMiddleware,
  unlinkGoogle
);

// ==========================
// UNLINK LINKEDIN
// ==========================

router.delete(
  "/linkedin",
  authMiddleware,
  unlinkLinkedin
);

// ==========================
// CURRENT USER
// ==========================

router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

module.exports = router;