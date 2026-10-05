const crypto = require("crypto");

const prisma = require("../config/prisma");

const {
  hashPassword,
  comparePassword,
} = require("../utils/hash");

const generateToken =
  require("../utils/jwt");

// ==========================
// REGISTER USER
// ==========================
const registerUser = async ({
  fullName,
  email,
  password,
}) => {
  if (
    !fullName ||
    !email ||
    !password
  ) {
    throw new Error(
      "All fields are required"
    );
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  if (password.length < 8) {
    throw new Error(
      "Password must be at least 8 characters long"
    );
  }

  if (
    !/[A-Za-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    throw new Error(
      "Password must contain at least one letter and one number"
    );
  }

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

  if (existingUser) {
    throw new Error(
      "An account with this email already exists"
    );
  }

  const hashedPassword =
    await hashPassword(password);

  const user =
    await prisma.user.create({
      data: {
        fullName:
          fullName.trim(),

        email:
          normalizedEmail,

        password:
          hashedPassword,

        provider:
          "credentials",
      },
    });

  const token =
    generateToken(user.id);

  return {
    user: {
      id:
        user.id,

      fullName:
        user.fullName,

      email:
        user.email,

      provider:
        user.provider,
    },

    token,
  };
};

// ==========================
// EMAIL/PASSWORD LOGIN
// ==========================
const loginUser = async ({
  email,
  password,
}) => {
  if (
    !email ||
    !password
  ) {
    throw new Error(
      "Email and password are required"
    );
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const user =
    await prisma.user.findUnique({
      where: {
        email:
          normalizedEmail,
      },
    });

  if (!user) {
    throw new Error(
      "Invalid email or password"
    );
  }

  if (!user.password) {
    throw new Error(
      `Please sign in using ${
        user.provider ||
        "your social account"
      }`
    );
  }

  const isMatch =
    await comparePassword(
      password,
      user.password
    );

  if (!isMatch) {
    throw new Error(
      "Invalid email or password"
    );
  }

  const token =
    generateToken(user.id);

  return {
    user: {
      id:
        user.id,

      fullName:
        user.fullName,

      email:
        user.email,

      provider:
        user.provider,
    },

    token,
  };
};

// ==========================
// GOOGLE LOGIN
// ==========================
const googleLoginUser = async ({
  credential,
}) => {
  if (!credential) {
    throw new Error(
      "Google access token is required"
    );
  }

  const googleResponse =
    await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${credential}`,
        },
      }
    );

  if (!googleResponse.ok) {
    throw new Error(
      "Invalid or expired Google access token"
    );
  }

  const googleProfile =
    await googleResponse.json();

  const {
    sub,
    email,
    name,
    email_verified,
  } = googleProfile;

  if (!email) {
    throw new Error(
      "Google account does not contain an email"
    );
  }

  if (!email_verified) {
    throw new Error(
      "Google email is not verified"
    );
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const googleId =
    sub
      ? String(sub)
      : null;

  let user = null;

  if (googleId) {
    user =
      await prisma.user.findUnique({
        where: {
          googleId,
        },
      });
  }

  if (!user) {
    user =
      await prisma.user.findUnique({
        where: {
          email:
            normalizedEmail,
        },
      });
  }

  if (!user) {
    user =
      await prisma.user.create({
        data: {
          fullName:
            name?.trim() ||
            "Google User",

          email:
            normalizedEmail,

          password:
            null,

          provider:
            "google",

          googleId,
        },
      });
  } else if (
    googleId &&
    !user.googleId
  ) {
    user =
      await prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          googleId,
        },
      });
  }

  const token =
    generateToken(user.id);

  return {
    user: {
      id:
        user.id,

      fullName:
        user.fullName,

      email:
        user.email,

      provider:
        user.provider,
    },

    token,
  };
};

// ==========================
// GITHUB LOGIN
// ==========================
const githubLoginUser = async ({
  code,
}) => {
  if (!code) {
    throw new Error(
      "GitHub authorization code is required"
    );
  }

  if (
    !process.env.GITHUB_CLIENT_ID ||
    !process.env.GITHUB_CLIENT_SECRET
  ) {
    throw new Error(
      "GitHub OAuth is not configured"
    );
  }

  const tokenResponse =
    await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          client_id:
            process.env
              .GITHUB_CLIENT_ID,

          client_secret:
            process.env
              .GITHUB_CLIENT_SECRET,

          code,

          redirect_uri:
            process.env
              .GITHUB_CALLBACK_URL,
        }),
      }
    );

  if (!tokenResponse.ok) {
    throw new Error(
      "Failed to contact GitHub"
    );
  }

  const tokenData =
    await tokenResponse.json();

  if (
    tokenData.error ||
    !tokenData.access_token
  ) {
    console.error(
      "GitHub Token Error:",
      tokenData.error_description ||
        tokenData.error
    );

    throw new Error(
      "GitHub authorization failed"
    );
  }

  const githubAccessToken =
    tokenData.access_token;

  const profileResponse =
    await fetch(
      "https://api.github.com/user",
      {
        headers: {
          Authorization:
            `Bearer ${githubAccessToken}`,

          Accept:
            "application/vnd.github+json",

          "User-Agent":
            "CareerPilot-AI",

          "X-GitHub-Api-Version":
            "2022-11-28",
        },
      }
    );

  if (!profileResponse.ok) {
    throw new Error(
      "Unable to fetch GitHub profile"
    );
  }

  const githubProfile =
    await profileResponse.json();

  const emailsResponse =
    await fetch(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization:
            `Bearer ${githubAccessToken}`,

          Accept:
            "application/vnd.github+json",

          "User-Agent":
            "CareerPilot-AI",

          "X-GitHub-Api-Version":
            "2022-11-28",
        },
      }
    );

  if (!emailsResponse.ok) {
    throw new Error(
      "Unable to retrieve GitHub email"
    );
  }

  const emails =
    await emailsResponse.json();

  let githubEmail =
    emails.find(
      (item) =>
        item.primary &&
        item.verified
    );

  if (!githubEmail) {
    githubEmail =
      emails.find(
        (item) =>
          item.verified
      );
  }

  if (!githubEmail?.email) {
    throw new Error(
      "No verified email found on your GitHub account"
    );
  }

  const normalizedEmail =
    githubEmail.email
      .trim()
      .toLowerCase();

  const githubId =
    String(
      githubProfile.id
    );

  let user =
    await prisma.user.findUnique({
      where: {
        githubId,
      },
    });

  if (!user) {
    user =
      await prisma.user.findUnique({
        where: {
          email:
            normalizedEmail,
        },
      });
  }

  if (!user) {
    user =
      await prisma.user.create({
        data: {
          fullName:
            githubProfile
              .name?.trim() ||
            githubProfile.login ||
            "GitHub User",

          email:
            normalizedEmail,

          password:
            null,

          provider:
            "github",

          githubId,
        },
      });
  } else if (!user.githubId) {
    user =
      await prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          githubId,
        },
      });
  }

  const token =
    generateToken(user.id);

  return {
    user: {
      id:
        user.id,

      fullName:
        user.fullName,

      email:
        user.email,

      provider:
        user.provider,
    },

    token,
  };
};

// ==========================
// LINKEDIN LOGIN
// ==========================
const linkedinLoginUser = async ({
  code,
}) => {
  if (!code) {
    throw new Error(
      "LinkedIn authorization code is required"
    );
  }

  if (
    !process.env.LINKEDIN_CLIENT_ID ||
    !process.env.LINKEDIN_CLIENT_SECRET ||
    !process.env.LINKEDIN_CALLBACK_URL
  ) {
    throw new Error(
      "LinkedIn OAuth is not configured"
    );
  }

  const tokenResponse =
    await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body:
          new URLSearchParams({
            grant_type:
              "authorization_code",

            code,

            redirect_uri:
              process.env
                .LINKEDIN_CALLBACK_URL,

            client_id:
              process.env
                .LINKEDIN_CLIENT_ID,

            client_secret:
              process.env
                .LINKEDIN_CLIENT_SECRET,
          }),
      }
    );

  if (!tokenResponse.ok) {
    const errorText =
      await tokenResponse.text();

    console.error(
      "LinkedIn Token Error:",
      errorText
    );

    throw new Error(
      "LinkedIn authorization failed"
    );
  }

  const tokenData =
    await tokenResponse.json();

  if (!tokenData.access_token) {
    throw new Error(
      "LinkedIn did not return an access token"
    );
  }

  const linkedinAccessToken =
    tokenData.access_token;

  const profileResponse =
    await fetch(
      "https://api.linkedin.com/v2/userinfo",
      {
        method:
          "GET",

        headers: {
          Authorization:
            `Bearer ${linkedinAccessToken}`,
        },
      }
    );

  if (!profileResponse.ok) {
    const errorText =
      await profileResponse.text();

    console.error(
      "LinkedIn Profile Error:",
      errorText
    );

    throw new Error(
      "Unable to fetch LinkedIn profile"
    );
  }

  const linkedinProfile =
    await profileResponse.json();

  const {
    sub,
    email,
    name,
    given_name,
    family_name,
    email_verified,
  } = linkedinProfile;

  if (!sub) {
    throw new Error(
      "LinkedIn account does not contain a valid user ID"
    );
  }

  if (!email) {
    throw new Error(
      "LinkedIn account does not contain an email"
    );
  }

  if (
    email_verified === false
  ) {
    throw new Error(
      "LinkedIn email is not verified"
    );
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const linkedinId =
    String(sub);

  const linkedinFullName =
    name?.trim() ||
    `${given_name || ""} ${
      family_name || ""
    }`.trim() ||
    "LinkedIn User";

  let user =
    await prisma.user.findUnique({
      where: {
        linkedinId,
      },
    });

  if (!user) {
    user =
      await prisma.user.findUnique({
        where: {
          email:
            normalizedEmail,
        },
      });
  }

  if (!user) {
    user =
      await prisma.user.create({
        data: {
          fullName:
            linkedinFullName,

          email:
            normalizedEmail,

          password:
            null,

          provider:
            "linkedin",

          linkedinId,
        },
      });
  } else if (!user.linkedinId) {
    user =
      await prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          linkedinId,
        },
      });
  }

  const token =
    generateToken(user.id);

  return {
    user: {
      id:
        user.id,

      fullName:
        user.fullName,

      email:
        user.email,

      provider:
        user.provider,
    },

    token,
  };
};

// ==========================
// UNLINK GOOGLE ACCOUNT
// ==========================
const unlinkGoogleUser =
  async (userId) => {
    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    if (!user.googleId) {
      throw new Error(
        "Google account is not linked"
      );
    }

    const hasAnotherLoginMethod =
      Boolean(user.password) ||
      Boolean(user.githubId) ||
      Boolean(user.linkedinId);

    if (!hasAnotherLoginMethod) {
      throw new Error(
        "You cannot remove Google because it is your only sign-in method. Add a password or connect another account first."
      );
    }

    const updatedUser =
      await prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          googleId:
            null,
        },
      });

    return {
      id:
        updatedUser.id,

      fullName:
        updatedUser.fullName,

      email:
        updatedUser.email,

      provider:
        updatedUser.provider,

      googleLinked:
        Boolean(
          updatedUser.googleId
        ),
    };
  };

// ==========================
// UNLINK LINKEDIN ACCOUNT
// ==========================
const unlinkLinkedinUser =
  async (userId) => {
    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    if (!user.linkedinId) {
      throw new Error(
        "LinkedIn account is not linked"
      );
    }

    const hasAnotherLoginMethod =
      Boolean(user.password) ||
      Boolean(user.googleId) ||
      Boolean(user.githubId);

    if (!hasAnotherLoginMethod) {
      throw new Error(
        "You cannot remove LinkedIn because it is your only sign-in method. Add another login method first."
      );
    }

    const updatedUser =
      await prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          linkedinId:
            null,
        },
      });

    return {
      id:
        updatedUser.id,

      fullName:
        updatedUser.fullName,

      email:
        updatedUser.email,

      provider:
        updatedUser.provider,

      linkedinLinked:
        Boolean(
          updatedUser.linkedinId
        ),
    };
  };

// ==========================
// SET PASSWORD
// ==========================
// Used by social-login users
// who currently do not have
// an email/password login.
const setPasswordUser =
  async ({
    userId,
    newPassword,
  }) => {
    if (!newPassword) {
      throw new Error(
        "New password is required"
      );
    }

    if (
      newPassword.length < 8
    ) {
      throw new Error(
        "New password must be at least 8 characters long"
      );
    }

    if (
      !/[A-Za-z]/.test(
        newPassword
      ) ||
      !/[0-9]/.test(
        newPassword
      )
    ) {
      throw new Error(
        "New password must contain at least one letter and one number"
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id:
            userId,
        },
      });

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    // Do not allow this endpoint
    // to overwrite an existing password.
    if (user.password) {
      throw new Error(
        "Password already exists. Use Change Password instead."
      );
    }

    const hashedPassword =
      await hashPassword(
        newPassword
      );

    await prisma.user.update({
      where: {
        id:
          userId,
      },

      data: {
        password:
          hashedPassword,
      },
    });

    return {
      success:
        true,
    };
  };

// ==========================
// CHANGE PASSWORD
// ==========================
const changePasswordUser =
  async ({
    userId,
    currentPassword,
    newPassword,
  }) => {
    if (
      !currentPassword ||
      !newPassword
    ) {
      throw new Error(
        "Current password and new password are required"
      );
    }

    if (
      newPassword.length < 8
    ) {
      throw new Error(
        "New password must be at least 8 characters long"
      );
    }

    if (
      !/[A-Za-z]/.test(
        newPassword
      ) ||
      !/[0-9]/.test(
        newPassword
      )
    ) {
      throw new Error(
        "New password must contain at least one letter and one number"
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id:
            userId,
        },
      });

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    if (!user.password) {
      throw new Error(
        "Password change is unavailable for this account"
      );
    }

    const isCurrentPasswordValid =
      await comparePassword(
        currentPassword,
        user.password
      );

    if (
      !isCurrentPasswordValid
    ) {
      throw new Error(
        "Current password is incorrect"
      );
    }

    const isSamePassword =
      await comparePassword(
        newPassword,
        user.password
      );

    if (isSamePassword) {
      throw new Error(
        "New password must be different from current password"
      );
    }

    const hashedPassword =
      await hashPassword(
        newPassword
      );

    await prisma.user.update({
      where: {
        id:
          userId,
      },

      data: {
        password:
          hashedPassword,
      },
    });

    return {
      success:
        true,
    };
  };

// ==========================
// FORGOT PASSWORD
// ==========================
const forgotPasswordUser =
  async ({
    email,
  }) => {
    if (!email) {
      throw new Error(
        "Email is required"
      );
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const user =
      await prisma.user.findUnique({
        where: {
          email:
            normalizedEmail,
        },
      });

    // Do not reveal whether
    // the account exists.
    if (!user) {
      return {
        success:
          true,
      };
    }

    // Do not expose whether this
    // is a social-only account.
    if (!user.password) {
      return {
        success:
          true,
      };
    }

    const resetToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    const hashedToken =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const resetPasswordExpires =
      new Date(
        Date.now() +
          15 * 60 * 1000
      );

    await prisma.user.update({
      where: {
        id:
          user.id,
      },

      data: {
        resetPasswordToken:
          hashedToken,

        resetPasswordExpires,
      },
    });

    const result = {
      success:
        true,
    };

    // Development-only shortcut.
    // Never expose reset tokens
    // when NODE_ENV=production.
    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      result.resetToken =
        resetToken;
    }

    return result;
  };

// ==========================
// RESET PASSWORD
// ==========================
const resetPasswordUser =
  async ({
    token,
    newPassword,
  }) => {
    if (
      !token ||
      !newPassword
    ) {
      throw new Error(
        "Reset token and new password are required"
      );
    }

    if (
      newPassword.length < 8
    ) {
      throw new Error(
        "New password must be at least 8 characters long"
      );
    }

    if (
      !/[A-Za-z]/.test(
        newPassword
      ) ||
      !/[0-9]/.test(
        newPassword
      )
    ) {
      throw new Error(
        "New password must contain at least one letter and one number"
      );
    }

    const hashedToken =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user =
      await prisma.user.findFirst({
        where: {
          resetPasswordToken:
            hashedToken,

          resetPasswordExpires: {
            gt:
              new Date(),
          },
        },
      });

    if (!user) {
      throw new Error(
        "Reset token is invalid or has expired"
      );
    }

    const isSamePassword =
      user.password
        ? await comparePassword(
            newPassword,
            user.password
          )
        : false;

    if (isSamePassword) {
      throw new Error(
        "New password must be different from your current password"
      );
    }

    const hashedPassword =
      await hashPassword(
        newPassword
      );

    await prisma.user.update({
      where: {
        id:
          user.id,
      },

      data: {
        password:
          hashedPassword,

        resetPasswordToken:
          null,

        resetPasswordExpires:
          null,
      },
    });

    return {
      success:
        true,
    };
  };

// ==========================
// EXPORTS
// ==========================
module.exports = {
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
};