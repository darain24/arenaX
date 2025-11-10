// Vercel serverless function handler
let appInstance = null;

module.exports = async (req, res) => {
  try {
    // Lazy load app to ensure Prisma is initialized correctly
    if (!appInstance) {
      const { app } = require("../src/app");
      appInstance = app;
    }
    return appInstance(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: process.env.VERCEL_ENV === "development" ? error.stack : undefined,
    });
  }
};

