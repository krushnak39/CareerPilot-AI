const prisma = require("../config/prisma");

const createActivity = async ({
  userId,
  type,
  title,
  description,
}) => {
  return await prisma.activity.create({
    data: {
      userId,
      type,
      title,
      description,
    },
  });
};

const getUserActivities = async (userId, limit = 10) => {
  return await prisma.activity.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
};

module.exports = {
  createActivity,
  getUserActivities,
};