const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ── JSEARCH API (RapidAPI) ──
// Free tier: 200 requests/month
// Sign up at: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "ae85be7603msh2f27442edbe6775p16abf4jsn30ec1af2b689";

// ── GET /api/jobs?q=keyword ──
app.get("/api/jobs", async (req, res) => {
  const query = req.query.q || "developer";

  try {
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
      query + " India"
    )}&page=1&num_b=12&date_posted=month`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const rawJobs = data.data || [];

    // Format jobs to match your frontend's expected structure
    const jobs = rawJobs.map((job) => ({
      id: job.job_id,
      title: job.job_title || "Software Engineer",
      company: job.employer_name || "Company",
      location: job.job_city
        ? `${job.job_city}, ${job.job_state || "India"}`
        : job.job_country || "India",
      salary: job.job_min_salary
        ? `₹${Math.round(job.job_min_salary / 100000)}–${Math.round(
            job.job_max_salary / 100000
          )} LPA`
        : job.job_salary_period
        ? job.job_salary_currency + " " + job.job_salary_period
        : null,
      type: job.job_employment_type
        ? job.job_employment_type.replace("_", " ")
        : "Full-time",
      experience: job.job_required_experience
        ? job.job_required_experience.required_experience_in_months
          ? `${Math.round(
              job.job_required_experience.required_experience_in_months / 12
            )}+ yrs`
          : null
        : null,
      skills: job.job_required_skills
        ? job.job_required_skills.slice(0, 5).join(", ")
        : null,
      description: job.job_description
        ? job.job_description.slice(0, 180) + "..."
        : null,
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
