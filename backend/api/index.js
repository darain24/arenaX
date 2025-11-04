// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    // Lazy load app to ensure Prisma is initialized correctly
    const { app } = require("../src/app");
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

