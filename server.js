const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "skillsmatter_secret_key_2024";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "ae85be7603msh2f27442edbe6775p16abf4jsn30ec1af2b689";

// ── MONGODB CONNECT ──
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// ── USER SCHEMA ──
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  profile:   {
    phone:   String,
    city:    String,
    degree:  String,
    branch:  String,
    college: String,
    year:    String,
    arrears: String,
    cgpa:    String,
    exp:     String,
    jobType: String,
    bio:     String,
    resume:  String,
    skills:  [String]
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// ── AUTH MIDDLEWARE ──
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ─────────────────────────────────────────
// ── POST /api/auth/signup ──
// ─────────────────────────────────────────
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password required" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ error: "Email already registered. Please login." });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = jwt.sign({ userId: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Signup failed. Try again." });
  }
});

// ─────────────────────────────────────────
// ── POST /api/auth/login ──
// ─────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "No account found. Please sign up." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Incorrect password. Try again." });

    const token = jwt.sign({ userId: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

    res.json({
      message: "Login successful!",
      token,
      user: { id: user._id, name: user.name, email: user.email, profile: user.profile }
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed. Try again." });
  }
});

// ─────────────────────────────────────────
// ── GET /api/auth/profile ──
// ─────────────────────────────────────────
app.get("/api/auth/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch profile" });
  }
});

// ─────────────────────────────────────────
// ── PUT /api/auth/profile ──
// ─────────────────────────────────────────
app.put("/api/auth/profile", authMiddleware, async (req, res) => {
  try {
    const { name, profile } = req.body;
    const update = {};
    if (name) update.name = name;
    if (profile) update.profile = profile;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: update },
      { new: true, select: "-password" }
    );

    res.json({ message: "Profile updated!", user });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ error: "Could not update profile" });
  }
});

// ─────────────────────────────────────────
// ── GET /api/jobs ──
// ─────────────────────────────────────────
app.get("/api/jobs", async (req, res) => {
  const query = req.query.q || "developer";
  try {
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query + " India")}&page=1&num_b=12&date_posted=month`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const rawJobs = data.data || [];
    const jobs = rawJobs.map((job) => ({
      id: job.job_id,
      title: job.job_title || "Software Engineer",
      company: job.employer_name || "Company",
      location: job.job_city ? `${job.job_city}, ${job.job_state || "India"}` : job.job_country || "India",
      salary: job.job_min_salary
        ? `₹${Math.round(job.job_min_salary / 100000)}–${Math.round(job.job_max_salary / 100000)} LPA`
        : job.job_salary_period ? job.job_salary_currency + " " + job.job_salary_period : null,
      type: job.job_employment_type ? job.job_employment_type.replace("_", " ") : "Full-time",
      experience: job.job_required_experience?.required_experience_in_months
        ? `${Math.round(job.job_required_experience.required_experience_in_months / 12)}+ yrs` : null,
      skills: job.job_required_skills ? job.job_required_skills.slice(0, 5).join(", ") : null,
      description: job.job_description ? job.job_description.slice(0, 180) + "..." : null,
      applyUrl: job.job_apply_link || null,
      postedAt: job.job_posted_at_datetime_utc || null,
      logo: job.employer_logo || null,
    }));
    res.json({ jobs, total: jobs.length, query });
  } catch (err) {
    console.error("Job fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch jobs", message: err.message });
  }
});

// ── Health check ──
app.get("/", (req, res) => {
  res.json({ status: "Skills Matter Backend is running ✅", time: new Date() });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});