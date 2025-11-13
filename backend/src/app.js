const express = require("express");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();
const app = express();

// Optimize Prisma Client for serverless environments
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || JWT_SECRET + "-refresh";
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // Refresh tokens expire in 30 days
const ACCESS_TOKEN_EXPIRY = "7d"; // Access tokens expire in 7 days

// CORS configuration - support multiple origins for dev and production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "https://arena-x-mdxr.vercel.app",
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Helper function to generate refresh token (JWT-based)
function generateRefreshToken(userId) {
  return jwt.sign({ userId, type: "refresh" }, REFRESH_TOKEN_SECRET, { 
    expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` 
  });
}

app.get("/", (req, res) => res.send("Welcome to Sports Website API!"));

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (err) {
    return res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: err.message,
    });
  }
});

// Auth: Signup
app.post("/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email and password are required" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true, email: true, username: true },
    });
    if (existing) {
      return res.status(409).json({ error: "User with email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    return res.status(201).json({ user });
  } catch (err) {
    console.error("/auth/signup error:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
    return res.status(500).json({ 
      error: "Internal server error",
      message: process.env.VERCEL_ENV === "development" ? err.message : undefined,
    });
  }
});

// Auth: Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate access token (7 days)
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    
    // Generate refresh token
    const refreshToken = generateRefreshToken(user.id);

    return res.json({
      user: { id: user.id, username: user.username, email: user.email },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("/auth/login error:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      meta: err.meta,
      stack: err.stack,
    });
    // Always include error message in development
    const isDev = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "development" || !process.env.NODE_ENV;
    return res.status(500).json({ 
      error: "Internal server error",
      message: isDev ? err.message : undefined,
      code: err.code,
      ...(isDev && { stack: err.stack }),
    });
  }
});

// Auth: Refresh Token
app.post("/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken is required" });
    }

    // Verify the refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      
      // Verify it's a refresh token
      if (payload.type !== "refresh") {
        throw new Error("Invalid token type");
      }
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    // Generate new access token
    const accessToken = jwt.sign({ userId: payload.userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

    return res.json({
      accessToken,
    });
  } catch (err) {
    console.error("/auth/refresh error:", err);
    const isDev = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "development" || !process.env.NODE_ENV;
    return res.status(500).json({ 
      error: "Internal server error",
      message: isDev ? err.message : undefined,
    });
  }
});

// Logout: client should discard tokens
app.post("/auth/logout", (_req, res) => {
  return res.json({ success: true });
});

// Auth middleware
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const [, token] = auth.split(" ");
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    // If token is expired, provide more specific error
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Example protected route
app.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, username: true, email: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({ user });
});

module.exports = { app, prisma };
