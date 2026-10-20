const prisma = require("../config/prisma");
const fs = require("fs");
const path = require("path");

// ==========================
// HELPER: URL -> LOCAL PATH
// ==========================
const getLocalFilePath = (fileUrl) => {
  const relativePath = fileUrl.replace(/^\/+/, "");

  return path.join(
    process.cwd(),
    relativePath
  );
};

// ==========================
// HELPER: SAFE FILE DELETE
// ==========================
const safeDeleteFile = (
  filePath
) => {
  try {
    if (
      fs.existsSync(
        filePath
      )
    ) {
      fs.unlinkSync(
        filePath
      );
    }
  } catch (error) {
    console.error(
      "File Delete Error:",
      filePath,
      error.message
    );
  }
};

// ==========================
// CREATE RESUME
// ==========================
const createResume = async ({
  userId,
  title,
  fileName,
  fileUrl,
  fileType,
  fileSize,
}) => {
  return await prisma.$transaction(
    async (tx) => {
      // Check whether user already
      // has any resumes
      const resumeCount =
        await tx.resume.count({
          where: {
            userId,
          },
        });

      // First uploaded resume
      // automatically becomes primary
      const isPrimary =
        resumeCount === 0;

      return await tx.resume.create({
        data: {
          userId,

          title:
            title?.trim() ||
            null,

          fileName,
          fileUrl,
          fileType,
          fileSize:
            fileSize ?? null,

          isPrimary,
        },
      });
    }
  );
};

// ==========================
// GET USER RESUMES
// ==========================
const getUserResumes = async (
  userId
) => {
  return await prisma.resume.findMany({
    where: {
      userId,
    },

    orderBy: [
      {
        isPrimary: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
};

// ==========================
// SET PRIMARY RESUME
// ==========================
const setPrimaryResume = async ({
  resumeId,
  userId,
}) => {
  const resume =
    await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

  if (!resume) {
    throw new Error(
      "Resume not found"
    );
  }

  return await prisma.$transaction(
    async (tx) => {
      // Remove primary status
      // from all user's resumes
      await tx.resume.updateMany({
        where: {
          userId,
          isPrimary: true,
        },

        data: {
          isPrimary: false,
        },
      });

      // Set selected resume
      // as primary
      return await tx.resume.update({
        where: {
          id: resumeId,
        },

        data: {
          isPrimary: true,
        },
      });
    }
  );
};

// ==========================
// UPDATE / REPLACE RESUME
// ==========================
const updateResume = async ({
  resumeId,
  userId,
  title,
  fileName,
  fileUrl,
  fileType,
  fileSize,
}) => {
  const existingResume =
    await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

  if (!existingResume) {
    throw new Error(
      "Resume not found"
    );
  }

  // ==========================
  // TRANSACTION
  // ==========================
  const updatedResume =
    await prisma.$transaction(
      async (tx) => {
        // Save old version
        await tx.resumeVersion.create({
          data: {
            resumeId:
              existingResume.id,

            fileName:
              existingResume.fileName,

            fileUrl:
              existingResume.fileUrl,

            fileType:
              existingResume.fileType,

            fileSize:
              existingResume.fileSize,
          },
        });

        // Update current resume
        //
        // isPrimary is NOT changed,
        // so replacing a primary resume
        // keeps it primary.
        return await tx.resume.update({
          where: {
            id: resumeId,
          },

          data: {
            title:
              title !== undefined
                ? title?.trim() ||
                  null
                : existingResume.title,

            fileName,
            fileUrl,
            fileType,

            fileSize:
              fileSize ?? null,
          },
        });
      }
    );

  return updatedResume;
};

// ==========================
// UPDATE RESUME TITLE ONLY
// ==========================
const updateResumeTitle = async ({
  resumeId,
  userId,
  title,
}) => {
  const resume =
    await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

  if (!resume) {
    throw new Error(
      "Resume not found"
    );
  }

  return await prisma.resume.update({
    where: {
      id: resumeId,
    },

    data: {
      title:
        title?.trim() ||
        null,
    },
  });
};

// ==========================
// GET RESUME HISTORY
// ==========================
const getResumeHistory = async ({
  resumeId,
  userId,
}) => {
  const resume =
    await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

  if (!resume) {
    throw new Error(
      "Resume not found"
    );
  }

  return await prisma.resumeVersion.findMany({
    where: {
      resumeId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================
// DELETE RESUME
// ==========================
const deleteResume = async ({
  resumeId,
  userId,
}) => {
  const resume =
    await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },

      include: {
        versions: true,
      },
    });

  if (!resume) {
    throw new Error(
      "Resume not found"
    );
  }

  // ==========================
  // COLLECT FILE PATHS FIRST
  // ==========================
  const filesToDelete = [];

  filesToDelete.push(
    getLocalFilePath(
      resume.fileUrl
    )
  );

  for (
    const version of
    resume.versions
  ) {
    filesToDelete.push(
      getLocalFilePath(
        version.fileUrl
      )
    );
  }

  // ==========================
  // DATABASE TRANSACTION
  // ==========================
  await prisma.$transaction(
    async (tx) => {
      // Delete selected resume.
      // ResumeVersion rows are
      // automatically deleted
      // because of Cascade.
      await tx.resume.delete({
        where: {
          id: resumeId,
        },
      });

      // If deleted resume was primary,
      // automatically choose another one.
      if (resume.isPrimary) {
        const nextResume =
          await tx.resume.findFirst({
            where: {
              userId,
            },

            orderBy: {
              createdAt: "desc",
            },
          });

        if (nextResume) {
          await tx.resume.update({
            where: {
              id: nextResume.id,
            },

            data: {
              isPrimary: true,
            },
          });
        }
      }
    }
  );

  // ==========================
  // DELETE PHYSICAL FILES
  // ==========================
  for (
    const filePath of
    filesToDelete
  ) {
    safeDeleteFile(
      filePath
    );
  }

  return resume;
};

module.exports = {
  createResume,
  getUserResumes,
  setPrimaryResume,
  updateResume,
  updateResumeTitle,
  getResumeHistory,
  deleteResume,
};