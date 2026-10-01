const prisma = require("../config/prisma");
const { createActivity } = require("../services/activity.service");
// ==========================
// GET PROFILE
// ==========================
const getProfile = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },

        select: {
          id: true,
          fullName: true,
          email: true,
          provider: true,

          profile: true,
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(
      "Get Profile Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// UPDATE PROFILE
// ==========================
const updateProfile = async (
  req,
  res,
  next
) => {
  try {
    const {
      fullName,
      phone,
      bio,
      location,
      college,
      degree,
      graduationYear,
      skills,
    } = req.body || {};

    // ==========================
    // BASIC VALIDATION
    // ==========================
    if (
      fullName !== undefined &&
      (
        typeof fullName !== "string" ||
        fullName.trim().length < 2 ||
        fullName.trim().length > 60
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Full name must be between 2 and 60 characters",
      });
    }

    if (
      bio !== undefined &&
      bio !== null &&
      typeof bio === "string" &&
      bio.length > 500
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Bio must be 500 characters or less",
      });
    }

    if (
      graduationYear !== undefined &&
      graduationYear !== null &&
      graduationYear !== ""
    ) {
      const year =
        Number(graduationYear);

      if (
        !Number.isInteger(year) ||
        year < 1950 ||
        year > 2100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid graduation year",
        });
      }
    }

    if (
      skills !== undefined &&
      !Array.isArray(skills)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Skills must be an array",
      });
    }

    // ==========================
    // NORMALIZE PROFILE DATA
    // ==========================
    const cleanSkills =
      Array.isArray(skills)
        ? skills
            .filter(
              (skill) =>
                typeof skill === "string"
            )
            .map(
              (skill) =>
                skill.trim()
            )
            .filter(Boolean)
        : undefined;

    const parsedGraduationYear =
      graduationYear === undefined
        ? undefined
        : graduationYear === null ||
            graduationYear === ""
          ? null
          : Number(graduationYear);

    // ==========================
    // TRANSACTION
    // ==========================
    const result =
      await prisma.$transaction(
        async (tx) => {
          let updatedUser;

          if (
            fullName !== undefined
          ) {
            updatedUser =
              await tx.user.update({
                where: {
                  id: req.user.id,
                },

                data: {
                  fullName:
                    fullName.trim(),
                },

                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  provider: true,
                },
              });
          } else {
            updatedUser =
              await tx.user.findUnique({
                where: {
                  id: req.user.id,
                },

                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  provider: true,
                },
              });
          }

          const profileData = {};

          if (phone !== undefined) {
            profileData.phone =
              phone === null
                ? null
                : String(phone).trim() ||
                  null;
          }

          if (bio !== undefined) {
            profileData.bio =
              bio === null
                ? null
                : String(bio).trim() ||
                  null;
          }

          if (location !== undefined) {
            profileData.location =
              location === null
                ? null
                : String(
                    location
                  ).trim() || null;
          }

          if (college !== undefined) {
            profileData.college =
              college === null
                ? null
                : String(
                    college
                  ).trim() || null;
          }

          if (degree !== undefined) {
            profileData.degree =
              degree === null
                ? null
                : String(
                    degree
                  ).trim() || null;
          }

          if (
            parsedGraduationYear !==
            undefined
          ) {
            profileData.graduationYear =
              parsedGraduationYear;
          }

          if (
            cleanSkills !== undefined
          ) {
            profileData.skills =
              cleanSkills;
          }

          const profile =
            await tx.userProfile.upsert({
              where: {
                userId:
                  req.user.id,
              },

              update:
                profileData,

              create: {
                userId:
                  req.user.id,

                ...profileData,
              },
            });

          return {
            ...updatedUser,
            profile,
          };
        }
      );

      await createActivity({
        userId: req.user.id,
        type: "PROFILE_UPDATED",
        title: "Profile updated",
        description: "Your profile information was updated",
      });

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Update Profile Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// GET NOTIFICATION PREFERENCE
// ==========================
const getNotificationPreference =
  async (
    req,
    res,
    next
  ) => {
    try {
      const profile =
        await prisma.userProfile.findUnique({
          where: {
            userId:
              req.user.id,
          },

          select: {
            notificationsEnabled:
              true,
          },
        });

      return res.status(200).json({
        success: true,

        data: {
          notificationsEnabled:
            profile?.notificationsEnabled ??
            true,
        },
      });
    } catch (error) {
      console.error(
        "Get Notification Preference Error:",
        error.message
      );

      return next(error);
    }
  };

// ==========================
// UPDATE NOTIFICATION PREFERENCE
// ==========================
const updateNotificationPreference =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        notificationsEnabled,
      } = req.body || {};

      if (
        typeof notificationsEnabled !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "notificationsEnabled must be true or false",
        });
      }

      const profile =
        await prisma.userProfile.upsert({
          where: {
            userId:
              req.user.id,
          },

          update: {
            notificationsEnabled,
          },

          create: {
            userId:
              req.user.id,

            notificationsEnabled,
          },

          select: {
            notificationsEnabled:
              true,
          },
        });

      return res.status(200).json({
        success: true,
        message:
          "Notification preference updated successfully",
        data: profile,
      });
    } catch (error) {
      console.error(
        "Update Notification Preference Error:",
        error.message
      );

      return next(error);
    }
  };

// ==========================
// GET CAREER PREFERENCES
// ==========================
const getCareerPreferences =
  async (
    req,
    res,
    next
  ) => {
    try {
      const preferences =
        await prisma.careerPreference.findUnique({
          where: {
            userId:
              req.user.id,
          },
        });

      return res.status(200).json({
        success: true,

        data:
          preferences || {
            targetRole: null,
            preferredLocation:
              null,
            workMode: null,
            jobType: null,
            experienceLevel:
              null,
            industries: [],
          },
      });
    } catch (error) {
      console.error(
        "Get Career Preferences Error:",
        error.message
      );

      return next(error);
    }
  };

// ==========================
// UPDATE CAREER PREFERENCES
// ==========================
const updateCareerPreferences =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        targetRole,
        preferredLocation,
        workMode,
        jobType,
        experienceLevel,
        industries,
      } = req.body || {};

      if (
        industries !== undefined &&
        !Array.isArray(industries)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Industries must be an array",
        });
      }

      const cleanIndustries =
        Array.isArray(industries)
          ? industries
              .filter(
                (item) =>
                  typeof item ===
                  "string"
              )
              .map(
                (item) =>
                  item.trim()
              )
              .filter(Boolean)
          : undefined;

      const data = {};

      if (
        targetRole !== undefined
      ) {
        data.targetRole =
          targetRole === null
            ? null
            : String(
                targetRole
              ).trim() || null;
      }

      if (
        preferredLocation !==
        undefined
      ) {
        data.preferredLocation =
          preferredLocation === null
            ? null
            : String(
                preferredLocation
              ).trim() || null;
      }

      if (
        workMode !== undefined
      ) {
        data.workMode =
          workMode === null
            ? null
            : String(
                workMode
              ).trim() || null;
      }

      if (
        jobType !== undefined
      ) {
        data.jobType =
          jobType === null
            ? null
            : String(
                jobType
              ).trim() || null;
      }

      if (
        experienceLevel !==
        undefined
      ) {
        data.experienceLevel =
          experienceLevel === null
            ? null
            : String(
                experienceLevel
              ).trim() || null;
      }

      if (
        cleanIndustries !==
        undefined
      ) {
        data.industries =
          cleanIndustries;
      }

      const preferences =
        await prisma.careerPreference.upsert({
          where: {
            userId:
              req.user.id,
          },

          update: data,

          create: {
            userId:
              req.user.id,

            ...data,
          },
        });

      return res.status(200).json({
        success: true,
        message:
          "Career preferences updated successfully",
        data: preferences,
      });
    } catch (error) {
      console.error(
        "Update Career Preferences Error:",
        error.message
      );

      return next(error);
    }
  };

module.exports = {
  getProfile,
  updateProfile,

  getNotificationPreference,
  updateNotificationPreference,

  getCareerPreferences,
  updateCareerPreferences,
};