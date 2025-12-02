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

// Simple in-memory cache for teams data (cache for 1 hour)
const teamsCache = {
  data: null,
  timestamp: null,
  TTL: 60 * 60 * 1000, // 1 hour in milliseconds
};

function getCachedTeams() {
  if (teamsCache.data && teamsCache.timestamp) {
    const now = Date.now();
    if (now - teamsCache.timestamp < teamsCache.TTL) {
      console.log("Returning cached teams data");
      return teamsCache.data;
    }
  }
  return null;
}

function setCachedTeams(data) {
  teamsCache.data = data;
  teamsCache.timestamp = Date.now();
}

// Simple in-memory cache for players data (cache for 1 hour)
const playersCache = {
  data: null,
  timestamp: null,
  TTL: 60 * 60 * 1000, // 1 hour in milliseconds
};

function getCachedPlayers() {
  if (playersCache.data && playersCache.timestamp) {
    const now = Date.now();
    if (now - playersCache.timestamp < playersCache.TTL) {
      console.log("Returning cached players data");
      return playersCache.data;
    }
  }
  return null;
}

function setCachedPlayers(data) {
  playersCache.data = data;
  playersCache.timestamp = Date.now();
}

// Simple in-memory cache for matches data (cache for 30 minutes)
const matchesCache = {
  data: null,
  timestamp: null,
  TTL: 30 * 60 * 1000, // 30 minutes in milliseconds
};

function getCachedMatches() {
  if (matchesCache.data && matchesCache.timestamp) {
    const now = Date.now();
    if (now - matchesCache.timestamp < matchesCache.TTL) {
      console.log("Returning cached matches data");
      return matchesCache.data;
    }
  }
  return null;
}

function setCachedMatches(data) {
  matchesCache.data = data;
  matchesCache.timestamp = Date.now();
}

// Fallback teams data when API is unavailable
function getFallbackTeams() {
  return [
    // Premier League teams
    { id: 33, name: "Manchester United", shortName: "MUN", areaName: "England", venue: "Old Trafford", founded: 1878, crest: "https://media.api-sports.io/football/teams/33.png", leagueId: "39", leagueName: "Premier League" },
    { id: 50, name: "Manchester City", shortName: "MCI", areaName: "England", venue: "Etihad Stadium", founded: 1880, crest: "https://media.api-sports.io/football/teams/50.png", leagueId: "39", leagueName: "Premier League" },
    { id: 42, name: "Arsenal", shortName: "ARS", areaName: "England", venue: "Emirates Stadium", founded: 1886, crest: "https://media.api-sports.io/football/teams/42.png", leagueId: "39", leagueName: "Premier League" },
    { id: 49, name: "Chelsea", shortName: "CHE", areaName: "England", venue: "Stamford Bridge", founded: 1905, crest: "https://media.api-sports.io/football/teams/49.png", leagueId: "39", leagueName: "Premier League" },
    { id: 40, name: "Liverpool", shortName: "LIV", areaName: "England", venue: "Anfield", founded: 1892, crest: "https://media.api-sports.io/football/teams/40.png", leagueId: "39", leagueName: "Premier League" },
    { id: 47, name: "Tottenham", shortName: "TOT", areaName: "England", venue: "Tottenham Hotspur Stadium", founded: 1882, crest: "https://media.api-sports.io/football/teams/47.png", leagueId: "39", leagueName: "Premier League" },
    { id: 66, name: "Newcastle United", shortName: "NEW", areaName: "England", venue: "St. James' Park", founded: 1892, crest: "https://media.api-sports.io/football/teams/66.png", leagueId: "39", leagueName: "Premier League" },
    { id: 46, name: "Brighton", shortName: "BHA", areaName: "England", venue: "American Express Community Stadium", founded: 1901, crest: "https://media.api-sports.io/football/teams/46.png", leagueId: "39", leagueName: "Premier League" },
    { id: 48, name: "West Ham", shortName: "WHU", areaName: "England", venue: "London Stadium", founded: 1895, crest: "https://media.api-sports.io/football/teams/48.png", leagueId: "39", leagueName: "Premier League" },
    { id: 51, name: "Aston Villa", shortName: "AVL", areaName: "England", venue: "Villa Park", founded: 1874, crest: "https://media.api-sports.io/football/teams/51.png", leagueId: "39", leagueName: "Premier League" },
    // La Liga teams
    { id: 541, name: "Real Madrid", shortName: "RMA", areaName: "Spain", venue: "Santiago Bernabéu", founded: 1902, crest: "https://media.api-sports.io/football/teams/541.png", leagueId: "140", leagueName: "La Liga" },
    { id: 529, name: "Barcelona", shortName: "BAR", areaName: "Spain", venue: "Camp Nou", founded: 1899, crest: "https://media.api-sports.io/football/teams/529.png", leagueId: "140", leagueName: "La Liga" },
    { id: 530, name: "Atletico Madrid", shortName: "ATM", areaName: "Spain", venue: "Wanda Metropolitano", founded: 1903, crest: "https://media.api-sports.io/football/teams/530.png", leagueId: "140", leagueName: "La Liga" },
    { id: 543, name: "Sevilla", shortName: "SEV", areaName: "Spain", venue: "Ramón Sánchez-Pizjuán", founded: 1890, crest: "https://media.api-sports.io/football/teams/543.png", leagueId: "140", leagueName: "La Liga" },
    { id: 548, name: "Valencia", shortName: "VAL", areaName: "Spain", venue: "Mestalla", founded: 1919, crest: "https://media.api-sports.io/football/teams/548.png", leagueId: "140", leagueName: "La Liga" },
    { id: 531, name: "Athletic Club", shortName: "ATH", areaName: "Spain", venue: "San Mamés", founded: 1898, crest: "https://media.api-sports.io/football/teams/531.png", leagueId: "140", leagueName: "La Liga" },
    { id: 536, name: "Real Sociedad", shortName: "RSO", areaName: "Spain", venue: "Reale Arena", founded: 1909, crest: "https://media.api-sports.io/football/teams/536.png", leagueId: "140", leagueName: "La Liga" },
    { id: 538, name: "Villarreal", shortName: "VIL", areaName: "Spain", venue: "Estadio de la Cerámica", founded: 1923, crest: "https://media.api-sports.io/football/teams/538.png", leagueId: "140", leagueName: "La Liga" },
    { id: 547, name: "Real Betis", shortName: "BET", areaName: "Spain", venue: "Benito Villamarín", founded: 1907, crest: "https://media.api-sports.io/football/teams/547.png", leagueId: "140", leagueName: "La Liga" },
    { id: 550, name: "Getafe", shortName: "GET", areaName: "Spain", venue: "Coliseum Alfonso Pérez", founded: 1983, crest: "https://media.api-sports.io/football/teams/550.png", leagueId: "140", leagueName: "La Liga" },
  ];
}

// CORS configuration - support multiple origins for dev and production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "https://arena-x-mdxr.vercel.app",
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const isProduction = process.env.NODE_ENV === "production";

      // In development, allow any http origin from your LAN (e.g. http://10.x.x.x:3000)
      if (
        !isProduction &&
        /^http:\/\/[\d.]+:\d+$/i.test(origin) // any http://<ip>:<port>
      ) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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
    const { username, fullName, email, password } = req.body;

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
      data: { username, fullName, email, password: hashedPassword },
      select: { id: true, username: true, fullName: true, email: true, createdAt: true },
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
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
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

// Auth: Forgot Password - Check if email exists
app.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return res.json({ 
        success: true, 
        message: "If an account with that email exists, instructions have been sent." 
      });
    }

    // User exists - return success
    return res.json({ 
      success: true, 
      exists: true,
      message: "Email found. Please change your password via the profile page." 
    });
  } catch (err) {
    console.error("/auth/forgot-password error:", err);
    return res.status(500).json({ error: "Internal server error" });
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

// Auth: GitHub OAuth - Get authorization URL
app.get("/auth/github", (req, res) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
  
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: "GitHub OAuth not configured" });
  }

  const redirectUri = `${FRONTEND_URL}/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
  
  res.json({ url: githubAuthUrl });
});

// Auth: GitHub OAuth - Callback handler
app.post("/auth/github/callback", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return res.status(500).json({ error: "GitHub OAuth not configured" });
    }

    // Exchange code for access token
    let tokenResponse;
    try {
      tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${FRONTEND_URL}/auth/github/callback`,
        }),
      });
    } catch (fetchError) {
      console.error("GitHub token fetch error:", fetchError);
      return res.status(500).json({ error: "Failed to connect to GitHub", details: fetchError.message });
    }

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("GitHub token response error:", tokenResponse.status, errorText);
      return res.status(500).json({ error: "Failed to get access token from GitHub", details: errorText });
    }

    const tokenData = await tokenResponse.json().catch((parseError) => {
      console.error("GitHub token JSON parse error:", parseError);
      return { error: "Failed to parse response" };
    });

    if (tokenData.error) {
      return res.status(401).json({ error: tokenData.error_description || tokenData.error || "Failed to get access token" });
    }

    if (!tokenData.access_token) {
      console.error("GitHub token response missing access_token:", tokenData);
      return res.status(500).json({ error: "No access token received from GitHub" });
    }

    const accessToken = tokenData.access_token;

    // Get user information from GitHub
    let userResponse;
    try {
      userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
    } catch (fetchError) {
      console.error("GitHub user fetch error:", fetchError);
      return res.status(500).json({ error: "Failed to connect to GitHub API", details: fetchError.message });
    }

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("GitHub user response error:", userResponse.status, errorText);
      return res.status(500).json({ error: "Failed to get user information from GitHub", details: errorText });
    }

    const githubUser = await userResponse.json().catch((parseError) => {
      console.error("GitHub user JSON parse error:", parseError);
      return null;
    });

    if (!githubUser || !githubUser.id || !githubUser.login) {
      console.error("Invalid GitHub user data:", githubUser);
      return res.status(401).json({ error: "Failed to get user information from GitHub" });
    }

    // Get user email (may require additional API call)
    let email = githubUser?.email;
    if (!email) {
      try {
        const emailResponse = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        if (emailResponse.ok) {
          const emails = await emailResponse.json().catch(() => []);
          const primaryEmail = emails.find((e) => e.primary) || emails[0];
          email = primaryEmail?.email;
        }
      } catch (emailError) {
        console.error("GitHub email fetch error:", emailError);
      }
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required from GitHub" });
    }

    const githubId = githubUser.id.toString();
    const username = githubUser.login;
    const name = githubUser.name || username;
    const avatarUrl = githubUser.avatar_url || null;

    // Check if user exists by GitHub ID or email
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ githubId }, { email }],
      },
    });

    if (dbUser) {
      // Update existing user with GitHub ID and avatar if not set
      const updateData = {};
      if (!dbUser.githubId && githubId) {
        updateData.githubId = githubId;
      }
      if (!dbUser.avatarUrl && avatarUrl) {
        updateData.avatarUrl = avatarUrl;
      }
      if (Object.keys(updateData).length > 0) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: updateData,
        });
      }
    } else {
      // Create new user
      // Ensure username is unique
      let uniqueUsername = username;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
        uniqueUsername = username + counter;
        counter++;
      }

      dbUser = await prisma.user.create({
        data: {
          username: uniqueUsername,
          email,
          fullName: name,
          githubId,
          avatarUrl,
          password: null, // No password for GitHub OAuth users
        },
      });
    }

    // Generate access token (7 days)
    const jwtAccessToken = jwt.sign({ userId: dbUser.id }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    // Generate refresh token
    const refreshToken = generateRefreshToken(dbUser.id);

    return res.json({
      user: { 
        id: dbUser.id, 
        username: dbUser.username, 
        email: dbUser.email,
        fullName: dbUser.fullName,
        avatarUrl: dbUser.avatarUrl,
      },
      accessToken: jwtAccessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("/auth/github/callback error:", err);
    console.error("Error stack:", err.stack);
    const isDev =
      process.env.NODE_ENV === "development" ||
      process.env.VERCEL_ENV === "development" ||
      !process.env.NODE_ENV;
    return res.status(500).json({
      error: "Internal server error",
      message: isDev ? err.message : undefined,
      stack: isDev ? err.stack : undefined,
    });
  }
});

// Auth: Google OAuth - Get authorization URL
app.get("/auth/google", (req, res) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
  
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: "Google OAuth not configured" });
  }

  const redirectUri = `${FRONTEND_URL}/auth/google/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid email profile`;
  
  res.json({ url: googleAuthUrl });
});

// Auth: Google OAuth - Callback handler
app.post("/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: "Google OAuth not configured" });
    }

    // Exchange code for access token
    let tokenResponse;
    try {
      tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          redirect_uri: `${FRONTEND_URL}/auth/google/callback`,
          grant_type: "authorization_code",
        }),
      });
    } catch (fetchError) {
      console.error("Google token fetch error:", fetchError);
      return res.status(500).json({ error: "Failed to connect to Google", details: fetchError.message });
    }

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Google token response error:", tokenResponse.status, errorText);
      return res.status(500).json({ error: "Failed to get access token from Google", details: errorText });
    }

    const tokenData = await tokenResponse.json().catch((parseError) => {
      console.error("Google token JSON parse error:", parseError);
      return { error: "Failed to parse response" };
    });

    if (tokenData.error) {
      return res.status(401).json({ error: tokenData.error_description || tokenData.error || "Failed to get access token" });
    }

    if (!tokenData.access_token) {
      console.error("Google token response missing access_token:", tokenData);
      return res.status(500).json({ error: "No access token received from Google" });
    }

    const accessToken = tokenData.access_token;

    // Get user information from Google
    let userResponse;
    try {
      userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (fetchError) {
      console.error("Google user fetch error:", fetchError);
      return res.status(500).json({ error: "Failed to connect to Google API", details: fetchError.message });
    }

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("Google user response error:", userResponse.status, errorText);
      return res.status(500).json({ error: "Failed to get user information from Google", details: errorText });
    }

    const googleUser = await userResponse.json().catch((parseError) => {
      console.error("Google user JSON parse error:", parseError);
      return null;
    });

    if (!googleUser || !googleUser.sub || !googleUser.email) {
      console.error("Invalid Google user data:", googleUser);
      return res.status(401).json({ error: "Failed to get user information from Google" });
    }

    const googleId = googleUser.sub;
    const email = googleUser.email;
    const name = googleUser.name || googleUser.given_name || email.split("@")[0];
    const username = name.toLowerCase().replace(/\s+/g, "");
    const avatarUrl = googleUser.picture || null;

    // Check if user exists by Google ID or email
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
    });

    if (dbUser) {
      // Update existing user with Google ID and avatar if not set
      const updateData = {};
      if (!dbUser.googleId && googleId) {
        updateData.googleId = googleId;
      }
      if (!dbUser.avatarUrl && avatarUrl) {
        updateData.avatarUrl = avatarUrl;
      }
      if (Object.keys(updateData).length > 0) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: updateData,
        });
      }
    } else {
      // Create new user
      // Ensure username is unique
      let uniqueUsername = username;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
        uniqueUsername = username + counter;
        counter++;
      }

      dbUser = await prisma.user.create({
        data: {
          username: uniqueUsername,
          email,
          fullName: name,
          googleId,
          avatarUrl,
          password: null, // No password for Google OAuth users
        },
      });
    }

    // Generate access token (7 days)
    const jwtAccessToken = jwt.sign({ userId: dbUser.id }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    // Generate refresh token
    const refreshToken = generateRefreshToken(dbUser.id);

    return res.json({
      user: { 
        id: dbUser.id, 
        username: dbUser.username, 
        email: dbUser.email,
        fullName: dbUser.fullName,
        avatarUrl: dbUser.avatarUrl,
      },
      accessToken: jwtAccessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("/auth/google/callback error:", err);
    console.error("Error stack:", err.stack);
    const isDev =
      process.env.NODE_ENV === "development" ||
      process.env.VERCEL_ENV === "development" ||
      !process.env.NODE_ENV;
    return res.status(500).json({
      error: "Internal server error",
      message: isDev ? err.message : undefined,
      stack: isDev ? err.stack : undefined,
    });
  }
});

// Get current user info
app.get("/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        githubId: true,
        googleId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("/auth/me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile
app.put("/auth/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { username, fullName, email, password } = req.body;

    // Get current user to check if they have a password (OAuth users)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true, githubId: true, googleId: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build update data
    const updateData = {};
    
    if (username !== undefined) {
      // Check if username is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: "Username already taken" });
      }
      updateData.username = username;
    }

    if (fullName !== undefined) {
      updateData.fullName = fullName;
    }

    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: "Email already taken" });
      }
      updateData.email = email;
    }

    if (password !== undefined && password !== "") {
      // OAuth users (GitHub/Google) can set a password if they don't have one
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        githubId: true,
        googleId: true,
      },
    });

    return res.json({ user: updatedUser });
  } catch (err) {
    console.error("/auth/profile error:", err);
    return res.status(500).json({ error: "Internal server error" });
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

// Helper function to get team logo from teams cache
function getTeamLogo(teamName, teamsData) {
  if (!teamsData || !Array.isArray(teamsData)) return null;
  
  // Try exact match first
  const exactMatch = teamsData.find(
    (t) => t.name && t.name.toLowerCase() === teamName.toLowerCase()
  );
  if (exactMatch && exactMatch.crest) return exactMatch.crest;
  
  // Try partial match (e.g., "Arsenal" matches "Arsenal FC")
  const partialMatch = teamsData.find(
    (t) => t.name && (
      t.name.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(t.name.toLowerCase())
    )
  );
  if (partialMatch && partialMatch.crest) return partialMatch.crest;
  
  return null;
}

// SportsDB-based football endpoints (matches, teams, players)
app.get("/api/football/matches", async (req, res) => {
  try {
    const sport = req.query.sport || "football";
    const SPORTSDB_API_KEY = process.env.SPORTSDB_API_KEY;
    const SPORTSDB_BASE_URL =
      process.env.SPORTSDB_BASE_URL || "https://www.thesportsdb.com/api/v1/json";
    const leagueIdsEnv =
      process.env.SPORTSDB_LEAGUE_IDS || process.env.FOOTBALL_LEAGUE_IDS || "4328";
    const LEAGUE_IDS = leagueIdsEnv.split(",").map((id) => id.trim()).filter(Boolean);
    
    // Only fetch football data if sport is football
    if (sport !== "football") {
      return res.json({ matches: [] });
    }
    
    // Check cache first
    const cachedMatches = getCachedMatches();
    if (cachedMatches) {
      return res.json({ matches: cachedMatches });
    }
    
    // Get teams data for logos (from cache if available)
    let teamsData = getCachedTeams();
    if (!teamsData) {
      // Try to fetch teams if not cached
      try {
        const API_SPORTS_KEY = process.env.API_SPORTS_KEY || process.env.RAPIDAPI_KEY;
        if (API_SPORTS_KEY) {
          const API_SPORTS_BASE_URL = "https://api-football-v1.p.rapidapi.com/v3";
          const leagueIds = process.env.API_SPORTS_LEAGUE_IDS || "39,140";
          const LEAGUE_IDS_FOR_TEAMS = leagueIds.split(",").map((id) => id.trim()).filter(Boolean);
          const currentYear = new Date().getFullYear();
          
          const teamsResults = await Promise.all(
            LEAGUE_IDS_FOR_TEAMS.map(async (leagueId) => {
              try {
                const url = `${API_SPORTS_BASE_URL}/teams?league=${leagueId}&season=${currentYear}`;
                const resp = await fetch(url, {
                  method: 'GET',
                  headers: {
                    'X-RapidAPI-Key': API_SPORTS_KEY,
                    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
                  },
                });
                if (resp.ok) {
                  const data = await resp.json().catch(() => null);
                  if (data && data.response) {
                    return data.response.map((item) => ({
                      name: item.team?.name,
                      crest: item.team?.logo || null,
                    })).filter(t => t.name);
                  }
                }
              } catch (err) {
                console.error(`Error fetching teams for logos:`, err.message);
              }
              return [];
            })
          );
          teamsData = teamsResults.flat();
        }
      } catch (err) {
        console.error("Error fetching teams for logos:", err);
      }
    }
    
    if (!SPORTSDB_API_KEY) {
      // Return mock data if API key is not configured
      const mockMatches = [
        {
          id: 1,
          homeTeam: {
            name: "Arsenal",
            crest: getTeamLogo("Arsenal", teamsData) || "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
          },
          awayTeam: {
            name: "Chelsea",
            crest: getTeamLogo("Chelsea", teamsData) || "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
          },
          utcDate: new Date(Date.now() + 86400000).toISOString(),
          competition: { name: "Premier League" },
          venue: "Emirates Stadium",
        },
        {
          id: 2,
          homeTeam: {
            name: "Manchester United",
            crest: getTeamLogo("Manchester United", teamsData) || "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
          },
          awayTeam: {
            name: "Liverpool",
            crest: getTeamLogo("Liverpool", teamsData) || "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
          },
          utcDate: new Date(Date.now() + 172800000).toISOString(),
          competition: { name: "Premier League" },
          venue: "Old Trafford",
        },
      ];
      setCachedMatches(mockMatches);
      return res.json({ matches: mockMatches });
    }
    
    try {
      // Fetch upcoming events for all configured leagues in parallel
      const leagueResults = await Promise.all(
        LEAGUE_IDS.map(async (leagueId) => {
          try {
            const url = `${SPORTSDB_BASE_URL}/${SPORTSDB_API_KEY}/eventsnextleague.php?id=${encodeURIComponent(
              leagueId
            )}`;
            const response = await fetch(url);
            if (!response.ok) {
              console.error(
                `SportsDB events error for league ${leagueId}:`,
                response.status
              );
              return [];
            }
            const data = await response.json().catch(() => null);
            const events = data?.events || [];
            return events.map((e) => {
              const dateStr = e.dateEvent || e.dateEventLocal;
              const timeStr = e.strTime || "00:00:00";
              const utcDate = dateStr
                ? new Date(`${dateStr}T${timeStr}Z`).toISOString()
                : new Date().toISOString();
              
              // Get team logos from teams data
              const homeTeamLogo = getTeamLogo(e.strHomeTeam, teamsData);
              const awayTeamLogo = getTeamLogo(e.strAwayTeam, teamsData);
              
              return {
                id: e.idEvent,
                homeTeam: { 
                  name: e.strHomeTeam,
                  crest: homeTeamLogo,
                },
                awayTeam: { 
                  name: e.strAwayTeam,
                  crest: awayTeamLogo,
                },
                utcDate,
                competition: { name: e.strLeague },
                venue: e.strVenue || e.strStadium || null,
              };
            });
          } catch (err) {
            console.error(
              `SportsDB events fetch failed for league ${leagueId}:`,
              err
            );
            return [];
          }
        })
      );

      const allMatches = leagueResults
        .flat()
        .filter((m) => m && m.utcDate)
        .sort(
          (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
        );

      // Cache the results
      setCachedMatches(allMatches);
      return res.json({ matches: allMatches });
    } catch (apiError) {
      console.error("SportsDB matches error:", apiError);
      // Return mock data on error
      const fallbackMatches = [
        {
          id: 1,
          homeTeam: { 
            name: "Arsenal", 
            crest: getTeamLogo("Arsenal", teamsData) || null,
          },
          awayTeam: { 
            name: "Chelsea", 
            crest: getTeamLogo("Chelsea", teamsData) || null,
          },
          utcDate: new Date(Date.now() + 86400000).toISOString(),
          competition: { name: "Premier League" },
          venue: "Emirates Stadium",
        },
        {
          id: 2,
          homeTeam: { 
            name: "Manchester United", 
            crest: getTeamLogo("Manchester United", teamsData) || null,
          },
          awayTeam: { 
            name: "Liverpool", 
            crest: getTeamLogo("Liverpool", teamsData) || null,
          },
          utcDate: new Date(Date.now() + 172800000).toISOString(),
          competition: { name: "Premier League" },
          venue: "Old Trafford",
        },
      ];
      setCachedMatches(fallbackMatches);
      return res.json({ matches: fallbackMatches });
    }
  } catch (err) {
    console.error("/api/football/matches error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get teams from SportsDB for configured leagues
app.get("/api/football/teams", async (req, res) => {
  try {
    const sport = req.query.sport || "football";
    
    if (sport !== "football") {
      return res.json({ teams: [] });
    }

    // Check cache first
    const cachedData = getCachedTeams();
    if (cachedData) {
      return res.json({ teams: cachedData });
    }

    // Use API-SPORTS (api-sports.io) via RapidAPI
    // Free tier: 100 requests/day, no credit card required
    const API_SPORTS_KEY = process.env.API_SPORTS_KEY || process.env.RAPIDAPI_KEY;
    const API_SPORTS_BASE_URL = "https://api-football-v1.p.rapidapi.com/v3";
    
    // League IDs: 39 = Premier League, 140 = La Liga
    const leagueIds = process.env.API_SPORTS_LEAGUE_IDS || "39,140";
    const LEAGUE_IDS = leagueIds.split(",").map((id) => id.trim()).filter(Boolean);
    
    // League name mapping
    const leagueNames = {
      "39": "Premier League",
      "140": "La Liga",
    };

    if (!API_SPORTS_KEY) {
      console.warn("API_SPORTS_KEY not found. Using fallback data.");
      // Simple static fallback if API key is missing
      const fallbackTeams = getFallbackTeams();
      setCachedTeams(fallbackTeams);
      return res.json({ teams: fallbackTeams });
    }

    // Fetch teams from API-SPORTS for each league
    const leagueTeamsResults = await Promise.all(
      LEAGUE_IDS.map(async (leagueId) => {
        try {
          const leagueName = leagueNames[leagueId] || `League ${leagueId}`;
          
          // API-SPORTS endpoint: GET /teams?league={leagueId}&season={year}
          const currentYear = new Date().getFullYear();
          const url = `${API_SPORTS_BASE_URL}/teams?league=${leagueId}&season=${currentYear}`;
          
          console.log(`Fetching teams for ${leagueName} (league ${leagueId}) from API-SPORTS: ${url}`);
          
          const resp = await fetch(url, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': API_SPORTS_KEY,
              'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
            },
          });
          
          if (!resp.ok) {
            if (resp.status === 429) {
              console.warn(`API-SPORTS rate limit exceeded for league ${leagueId}. Using fallback data.`);
              // Return empty array - we'll use fallback data below
              return [];
            }
            console.error(`API-SPORTS teams failed for league ${leagueId}: ${resp.status} ${resp.statusText}`);
            return [];
          }
          
          const data = await resp.json().catch(() => null);
          if (!data || !data.response) {
            console.warn(`No response data from API-SPORTS for league ${leagueId}`);
            return [];
          }
          
          const teams = Array.isArray(data.response) ? data.response : [];
          console.log(`Found ${teams.length} teams for ${leagueName} (league ${leagueId})`);
          
          // Map API-SPORTS format to our format
          return teams.map((item) => {
            const team = item.team || {};
            const venue = item.venue || {};
            
            return {
              id: team.id,
              name: team.name,
              shortName: team.code || null,
              tla: team.code || null,
              areaName: team.country || null,
              venue: venue.name || null,
              founded: team.founded || null,
              // API-SPORTS provides logo URL
              crest: team.logo || null,
              leagueId: String(leagueId),
              leagueName: leagueName,
            };
          });
        } catch (err) {
          console.error(`Error fetching teams from API-SPORTS for league ${leagueId}:`, err.message);
          if (err.cause) {
            console.error(`Error cause:`, err.cause);
          }
          return [];
        }
      })
    );

    const allTeams = leagueTeamsResults.flat();
    
    // If we got no teams (rate limited or API error), return fallback data
    if (allTeams.length === 0) {
      console.warn("No teams fetched from API-SPORTS. Returning fallback Premier League and La Liga teams.");
      const fallbackTeams = getFallbackTeams();
      setCachedTeams(fallbackTeams);
      return res.json({ teams: fallbackTeams });
    }
    
    // Cache the successful response
    setCachedTeams(allTeams);
    return res.json({ teams: allTeams });
  } catch (err) {
    console.error("/api/football/teams error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Helper: fetch player image from TheSportsDB (or compatible API) by name/team
async function getPlayerImageFromSportsDB(playerName, teamName) {
  try {
    const SPORTSDB_API_KEY = process.env.SPORTSDB_API_KEY;
    const SPORTSDB_BASE_URL =
      process.env.SPORTSDB_BASE_URL || "https://www.thesportsdb.com/api/v1/json";

    if (!SPORTSDB_API_KEY) {
      // Not configured – skip gracefully
      return null;
    }

    const searchUrl = `${SPORTSDB_BASE_URL}/${SPORTSDB_API_KEY}/searchplayers.php?p=${encodeURIComponent(
      playerName
    )}`;

    const resp = await fetch(searchUrl);
    if (!resp.ok) {
      console.error("SportsDB player search error:", resp.status);
      return null;
    }

    const data = await resp.json().catch(() => null);
    const players = data?.player || [];
    if (!players.length) return null;

    // Try to match by team name if available
    const lowerTeam = teamName ? teamName.toLowerCase() : null;
    let best = players[0];
    if (lowerTeam) {
      const byTeam = players.find(
        (p) => p.strTeam && p.strTeam.toLowerCase() === lowerTeam
      );
      if (byTeam) best = byTeam;
    }

    // TheSportsDB commonly exposes these image fields
    return best.strCutout || best.strThumb || best.strRender || null;
  } catch (err) {
    console.error("getPlayerImageFromSportsDB error:", err.message || err);
    return null;
  }
}

// Top players derived from SportsDB player search
app.get("/api/football/players", async (req, res) => {
  try {
    const sport = req.query.sport || "football";
    
    if (sport !== "football") {
      return res.json({ scorers: [] });
    }

    // Check cache first
    const cachedData = getCachedPlayers();
    if (cachedData) {
      return res.json({ scorers: cachedData });
    }

    const SPORTSDB_API_KEY = process.env.SPORTSDB_API_KEY;
    const SPORTSDB_BASE_URL =
      process.env.SPORTSDB_BASE_URL || "https://www.thesportsdb.com/api/v1/json";
    
    if (!SPORTSDB_API_KEY) {
      console.warn("SPORTSDB_API_KEY not found. Using fallback data.");
      // Return static mock data if SportsDB is not configured
      const fallbackPlayers = [
        {
          player: {
            name: "Erling Haaland",
            nationality: "Norway",
            imageUrl:
              "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=800&q=80",
          },
          team: {
            name: "Manchester City",
            crest: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
          },
          goals: 25,
        },
        {
          player: {
            name: "Mohamed Salah",
            nationality: "Egypt",
            imageUrl:
              "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
          },
          team: {
            name: "Liverpool",
            crest: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
          },
          goals: 20,
        },
        {
          player: {
            name: "Harry Kane",
            nationality: "England",
            imageUrl:
              "https://images.unsplash.com/photo-1518091043644-c1f4c3c61217?auto=format&fit=crop&w=800&q=80",
          },
          team: {
            name: "Bayern Munich",
            crest: "https://upload.wikimedia.org/wikipedia/en/1/1f/FC_Bayern_München_logo_%282017%29.svg",
          },
          goals: 18,
        },
        {
          player: {
            name: "Kylian Mbappé",
            nationality: "France",
            imageUrl:
              "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
          },
          team: {
            name: "Paris Saint-Germain",
            crest: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
          },
          goals: 22,
        },
      ];
      setCachedPlayers(fallbackPlayers);
      return res.json({ scorers: fallbackPlayers });
    }
    
    try {
      // For now, choose a curated list of popular players and search them via SportsDB
      const starPlayersEnv =
        process.env.SPORTSDB_STAR_PLAYERS ||
        "Erling Haaland,Mohamed Salah,Harry Kane,Kylian Mbappe,Vinicius Junior,Kevin De Bruyne,Robert Lewandowski,Karim Benzema,Luka Modric,Virgil van Dijk";
      const names = starPlayersEnv
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);

      const playerResults = await Promise.all(
        names.map(async (name) => {
          try {
            const url = `${SPORTSDB_BASE_URL}/${SPORTSDB_API_KEY}/searchplayers.php?p=${encodeURIComponent(
              name
            )}`;
            console.log(`Fetching player image for: ${name}`);
            const resp = await fetch(url);
            if (!resp.ok) {
              console.error(`SportsDB player search error for ${name}:`, resp.status);
              return null;
            }
            const data = await resp.json().catch(() => null);
            const players = data?.player || [];
            if (!players.length) {
              console.warn(`No players found for: ${name}`);
              return null;
            }
            
            // Get the first player (most likely match)
            const p = players[0];
            
            // Prioritize cutout images (best for player cards), then thumb, then other images
            const imageUrl = p.strCutout || p.strThumb || p.strRender || p.strFanart1 || p.strBanner || null;
            
            if (imageUrl) {
              console.log(`Found image for ${name}: ${imageUrl.substring(0, 50)}...`);
            } else {
              console.warn(`No image found for ${name}`);
            }

            return {
              player: {
                id: p.idPlayer,
                name: p.strPlayer,
                nationality: p.strNationality,
                position: p.strPosition,
                imageUrl: imageUrl,
              },
              team: {
                name: p.strTeam,
              },
              goals: p.intGoals ? Number(p.intGoals) : Math.floor(Math.random() * 30) + 10,
              assists: p.intAssists ? Number(p.intAssists) : Math.floor(Math.random() * 20) + 5,
              mvps: Math.floor(Math.random() * 25) + 10,
              matches: Math.floor(Math.random() * 50) + 120,
              winRate: Math.floor(Math.random() * 15) + 80,
              rating: (8.5 + Math.random() * 1.0).toFixed(1),
            };
          } catch (err) {
            console.error(`SportsDB player fetch failed for ${name}:`, err.message);
            return null;
          }
        })
      );

      const scorers = playerResults.filter(Boolean);
      console.log(`Successfully fetched ${scorers.length} players with images`);
      
      // Cache the successful response
      setCachedPlayers(scorers);
      return res.json({ scorers });
    } catch (apiError) {
      console.error("SportsDB players error:", apiError);
      // Return mock data on error and cache it
      const fallbackPlayers = [
        {
          player: {
            name: "Erling Haaland",
            nationality: "Norway",
            imageUrl: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=800&q=80",
          },
          team: {
            name: "Manchester City",
            crest: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
          },
          goals: 25,
        },
        {
          player: {
            name: "Mohamed Salah",
            nationality: "Egypt",
            imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
          },
          team: {
            name: "Liverpool",
            crest: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
          },
          goals: 20,
        },
        {
          player: {
            name: "Harry Kane",
            nationality: "England",
            imageUrl: "https://images.unsplash.com/photo-1518091043644-c1f4c3c61217?auto=format&fit=crop&w=800&q=80",
          },
          team: {
            name: "Bayern Munich",
            crest: "https://upload.wikimedia.org/wikipedia/en/1/1f/FC_Bayern_München_logo_%282017%29.svg",
          },
          goals: 18,
        },
        {
          player: {
            name: "Kylian Mbappé",
            nationality: "France",
            imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
          },
          team: {
            name: "Paris Saint-Germain",
            crest: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
          },
          goals: 22,
        },
      ];
      // Cache fallback data so we don't keep trying on every request
      setCachedPlayers(fallbackPlayers);
      return res.json({ scorers: fallbackPlayers });
    }
  } catch (err) {
    console.error("/api/football/players error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/football/news", async (req, res) => {
  try {
    const sport = req.query.sport || "football";
    
    // Only return football news if sport is football
    if (sport !== "football") {
      return res.json({ articles: [] });
    }

    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    const NEWS_API_URL =
      process.env.NEWS_API_URL ||
      "https://newsapi.org/v2/top-headlines?category=sports&language=en&q=football";

    // If a news API key is configured, try to fetch real football news with images
    if (NEWS_API_KEY) {
      try {
        const urlWithKey =
          NEWS_API_URL +
          (NEWS_API_URL.includes("?") ? "&" : "?") +
          `apiKey=${encodeURIComponent(NEWS_API_KEY)}`;

        const resp = await fetch(urlWithKey);
        if (!resp.ok) {
          console.error("News API error:", resp.status);
          throw new Error(`News API error: ${resp.status}`);
        }

        const data = await resp.json().catch(() => null);
        const rawArticles = data?.articles || [];

        const mapped = rawArticles
          .filter((a) => a.urlToImage) // only keep articles with images
          .slice(0, 6) // show first 6
          .map((a) => ({
            title: a.title || "Football News",
            description:
              a.description ||
              a.content ||
              "Latest updates from the world of football.",
            category: "Highlights",
            publishedAt: a.publishedAt || new Date().toISOString(),
            imageUrl: a.urlToImage,
          }));

        if (mapped.length) {
          return res.json({ articles: mapped });
        }
      } catch (newsErr) {
        console.error("/api/football/news external API error:", newsErr);
        // Fall through to mock data
      }
    }

    // Fallback: static mock news with curated images
    return res.json({
      articles: [
        {
          title: "Premier League Title Race Heats Up",
          description:
            "The race for the Premier League title intensifies as top teams battle for supremacy.",
          category: "Highlights",
          publishedAt: new Date().toISOString(),
          imageUrl:
            "https://images.unsplash.com/photo-1518091043644-c1f4c3c61217?auto=format&fit=crop&w=1000&q=80",
        },
        {
          title: "Champions League Quarterfinals Preview",
          description:
            "A look ahead at the exciting Champions League quarterfinal matchups.",
          category: "Insights",
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          imageUrl:
            "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80",
        },
        {
          title: "Top Scorer Race Update",
          description:
            "Latest updates on the race for the Golden Boot in European leagues.",
          category: "Highlights",
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          imageUrl:
            "https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&w=1000&q=80",
        },
        {
          title: "Transfer Window Rumors",
          description:
            "Latest transfer rumors and potential moves in the football world.",
          category: "Interviews",
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          imageUrl:
            "https://images.unsplash.com/photo-1519838257510-089d2a2a62c0?auto=format&fit=crop&w=1000&q=80",
        },
        {
          title: "Injury Updates from Top Clubs",
          description:
            "Latest injury news and recovery updates from major football clubs.",
          category: "Insights",
          publishedAt: new Date(Date.now() - 345600000).toISOString(),
          imageUrl:
            "https://images.unsplash.com/photo-1549921296-3ccee00b8665?auto=format&fit=crop&w=1000&q=80",
        },
        {
          title: "Youth Academy Success Stories",
          description:
            "Rising stars making their mark from youth academies around the world.",
          category: "Highlights",
          publishedAt: new Date(Date.now() - 432000000).toISOString(),
          imageUrl:
            "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1000&q=80",
        },
      ],
    });
  } catch (err) {
    console.error("/api/football/news error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = { app, prisma };
