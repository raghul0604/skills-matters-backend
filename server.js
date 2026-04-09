const express = require("express");
const cors = require("cors");
const https = require("https");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "ae85be7603msh2f27442edbe6775p16abf4jsn30ec1af2b689";

function httpsGet(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error("Invalid JSON: " + data.slice(0, 200))); }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

app.get("/api/jobs", async (req, res) => {
  const query = req.query.q || "developer";

  try {
    const data = await httpsGet({
      method: "GET",
      hostname: "jsearch.p.rapidapi.com",
      path: `/search?query=${encodeURIComponent(query + " India")}&page=1&num_b=12&date_posted=month`,
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    });

    if (data.errors || !data.data) {
      console.error("API returned:", JSON.stringify(data).slice(0, 300));
      return res.status(500).json({ error: "API error", detail: data });
    }

    const jobs = (data.data || []).map((j) => ({
      id: j.job_id,
      title: j.job_title || "Software Engineer",
      company: j.employer_name || "Company",
      location: j.job_city
        ? `${j.job_city}, ${j.job_state || "India"}`
        : j.job_country || "India",
      salary: j.job_min_salary
        ? `₹${Math.round(j.job_min_salary / 100000)}–${Math.round(j.job_max_salary / 100000)} LPA`
        : null,
      type: j.job_employment_type
        ? j.job_employment_type.replace(/_/g, " ")
        : "Full-time",
      experience: j.job_required_experience?.required_experience_in_months
        ? `${Math.round(j.job_required_experience.required_experience_in_months / 12)}+ yrs`
        : null,
      skills: j.job_required_skills
        ? j.job_required_skills.slice(0, 5).join(", ")
        : null,
      description: j.job_description
        ? j.job_description.slice(0, 180) + "..."
        : null,
      applyUrl: j.job_apply_link || null,
    }));

    res.json({ jobs, total: jobs.length, query });

  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "Skills Matter Backend running ✅", time: new Date() });
});

app.listen(PORT, () => {
  console.log(`✅ Server on port ${PORT}`);
});
