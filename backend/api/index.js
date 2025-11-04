const { app } = require("../src/app");

// Export Express app for Vercel serverless functions
// @vercel/node will automatically handle this
module.exports = app;

