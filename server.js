const express = require("express");
const cors = require("cors");
const https = require("https");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "ae85be7603msh2f27442edbe6775p16abf4jsn30ec1af2b689";

function httpsGet(hostname, path, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request({ method: "GET", hostname, path, headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

app.get("/api/jobs", async (req, res) => {
  const query = req.query.q || "developer";

  try {
    // Try JSearch first
    const jsearch = await httpsGet(
      "jsearch.p.rapidapi.com",
      `/search?query=${encodeURIComponent(query + " India")}&page=1&num_b=12`,
      {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    );

    console.log("JSearch status:", jsearch.status);
    console.log("JSearch body:", JSON.stringify(jsearch.body).slice(0, 400));

    if (jsearch.status === 200 && jsearch.body.data && jsearch.body.data.length > 0) {
      const jobs = jsearch.body.data.map((j) => ({
        id: j.job_id,
        title: j.job_title || "Software Engineer",
        company: j.employer_name || "Company",
        location: j.job_city ? `${j.job_city}, India` : "India",
        salary: j.job_min_salary
          ? `₹${Math.round(j.job_min_salary / 100000)}–${Math.round(j.job_max_salary / 100000)} LPA`
          : null,
        type: j.job_employment_type ? j.job_employment_type.replace(/_/g, " ") : "Full-time",
        experience: j.job_required_experience?.required_experience_in_months
          ? `${Math.round(j.job_required_experience.required_experience_in_months / 12)}+ yrs`
          : null,
        skills: j.job_required_skills ? j.job_required_skills.slice(0, 5).join(", ") : null,
        description: j.job_description ? j.job_description.slice(0, 180) + "..." : null,
        applyUrl: j.job_apply_link || null,
      }));
      return res.json({ jobs, total: jobs.length, query, source: "jsearch" });
    }

    // JSearch failed — fallback to Naukri search links
    console.log("JSearch failed, using fallback");
    const fallbackJobs = generateFallbackJobs(query);
    return res.json({ jobs: fallbackJobs, total: fallbackJobs.length, query, source: "fallback" });

  } catch (err) {
    console.error("Error:", err.message);
    const fallbackJobs = generateFallbackJobs(query);
    res.json({ jobs: fallbackJobs, total: fallbackJobs.length, query, source: "fallback" });
  }
});

function generateFallbackJobs(query) {
  const companies = ["TCS", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra", "Accenture India", "Capgemini", "IBM India", "Cognizant", "Mphasis"];
  const locations = ["Bangalore", "Mumbai", "Chennai", "Hyderabad", "Pune", "Delhi NCR", "Kolkata", "Ahmedabad"];
  const salaries = ["3–6 LPA", "5–9 LPA", "8–14 LPA", "12–18 LPA", "15–25 LPA"];
  const types = ["Full-time", "Contract", "Remote", "Hybrid"];
  const experiences = ["0–1 yrs", "1–3 yrs", "3–5 yrs", "5+ yrs"];

  return companies.slice(0, 9).map((company, i) => ({
    id: `fallback-${i}`,
    title: `${query.charAt(0).toUpperCase() + query.slice(1)} ${["Engineer","Developer","Analyst","Specialist","Lead"][i % 5]}`,
    company,
    location: locations[i % locations.length],
    salary: salaries[i % salaries.length],
    type: types[i % types.length],
    experience: experiences[i % experiences.length],
    skills: ["Problem Solving", "Communication", "Teamwork", query].join(", "),
    description: `Exciting opportunity for a ${query} role at ${company}. Join our growing team in India.`,
    applyUrl: `https://www.naukri.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g,"-"))}-jobs-in-india?src=jobsearchDesk&title=${encodeURIComponent(query)}&company=${encodeURIComponent(company)}`
  }));
}

app.get("/", (req, res) => {
  res.json({ status: "Skills Matter Backend running ✅", time: new Date() });
});

app.listen(PORT, () => {
  console.log(`✅ Server on port ${PORT}`);
});
