const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const JOB_DATA = {
  developer: [
    { title: "Frontend Developer", company: "TCS", location: "Bangalore", salary: "6–12 LPA", type: "Full-time", experience: "1–3 yrs", skills: "React, HTML, CSS, JavaScript", description: "Build modern web applications using React and related technologies." },
    { title: "Backend Developer", company: "Infosys", location: "Hyderabad", salary: "7–14 LPA", type: "Full-time", experience: "2–4 yrs", skills: "Node.js, Express, MongoDB, REST API", description: "Develop scalable backend services and APIs for enterprise clients." },
    { title: "Full Stack Developer", company: "Wipro", location: "Chennai", salary: "8–16 LPA", type: "Full-time", experience: "2–5 yrs", skills: "React, Node.js, MySQL, AWS", description: "Work on end-to-end web development for global clients." },
    { title: "Java Developer", company: "HCL Technologies", location: "Pune", salary: "7–13 LPA", type: "Full-time", experience: "2–4 yrs", skills: "Java, Spring Boot, Microservices, SQL", description: "Design and develop Java-based enterprise applications." },
    { title: "Python Developer", company: "Tech Mahindra", location: "Mumbai", salary: "6–12 LPA", type: "Full-time", experience: "1–3 yrs", skills: "Python, Django, REST API, PostgreSQL", description: "Build Python-based web services and automation tools." },
    { title: "React Developer", company: "Accenture", location: "Bangalore", salary: "8–15 LPA", type: "Hybrid", experience: "2–4 yrs", skills: "React, Redux, TypeScript, REST API", description: "Develop high-performance React applications for top clients." },
    { title: "Angular Developer", company: "Capgemini", location: "Delhi NCR", salary: "7–13 LPA", type: "Full-time", experience: "2–5 yrs", skills: "Angular, TypeScript, HTML, CSS", description: "Create dynamic web apps using Angular framework." },
    { title: "Software Developer", company: "IBM India", location: "Kolkata", salary: "9–17 LPA", type: "Full-time", experience: "3–5 yrs", skills: "Java, Cloud, Agile, Microservices", description: "Develop cloud-native software solutions for IBM clients." },
    { title: "Web Developer", company: "Cognizant", location: "Chennai", salary: "5–10 LPA", type: "Full-time", experience: "0–2 yrs", skills: "HTML, CSS, JavaScript, Bootstrap", description: "Build and maintain responsive web applications." },
  ],
  designer: [
    { title: "UI/UX Designer", company: "Flipkart", location: "Bangalore", salary: "8–15 LPA", type: "Full-time", experience: "2–4 yrs", skills: "Figma, Adobe XD, Prototyping, Wireframing", description: "Design user-centered interfaces for India's top e-commerce platform." },
    { title: "Graphic Designer", company: "Swiggy", location: "Bangalore", salary: "5–9 LPA", type: "Full-time", experience: "1–3 yrs", skills: "Illustrator, Photoshop, Canva, Branding", description: "Create visual content for digital and print media." },
    { title: "Product Designer", company: "Razorpay", location: "Bangalore", salary: "12–20 LPA", type: "Full-time", experience: "3–5 yrs", skills: "Figma, Design Systems, User Research", description: "Own product design for fintech products used by millions." },
    { title: "Motion Designer", company: "Zomato", location: "Delhi NCR", salary: "7–13 LPA", type: "Hybrid", experience: "2–4 yrs", skills: "After Effects, Lottie, Figma, Animation", description: "Create stunning motion graphics and animated content." },
    { title: "UI Designer", company: "Paytm", location: "Noida", salary: "6–11 LPA", type: "Full-time", experience: "1–3 yrs", skills: "Figma, Sketch, HTML, CSS", description: "Design clean and intuitive UI for mobile and web apps." },
  ],
  data: [
    { title: "Data Scientist", company: "Amazon India", location: "Bangalore", salary: "18–30 LPA", type: "Full-time", experience: "3–5 yrs", skills: "Python, ML, TensorFlow, SQL, Statistics", description: "Build ML models to solve complex business problems at scale." },
    { title: "Data Analyst", company: "Microsoft India", location: "Hyderabad", salary: "10–18 LPA", type: "Full-time", experience: "2–4 yrs", skills: "SQL, Python, Power BI, Excel, Statistics", description: "Analyze large datasets to drive product and business decisions." },
    { title: "Data Engineer", company: "Google India", location: "Bangalore", salary: "20–35 LPA", type: "Full-time", experience: "3–6 yrs", skills: "Spark, Hadoop, Python, BigQuery, Airflow", description: "Build and maintain data pipelines for Google's products." },
    { title: "ML Engineer", company: "Flipkart", location: "Bangalore", salary: "15–28 LPA", type: "Full-time", experience: "3–5 yrs", skills: "Python, PyTorch, MLOps, Kubernetes", description: "Deploy machine learning models to production at scale." },
    { title: "Business Analyst", company: "Deloitte India", location: "Mumbai", salary: "8–14 LPA", type: "Full-time", experience: "2–4 yrs", skills: "SQL, Excel, Tableau, Requirements Gathering", description: "Bridge the gap between business needs and technical solutions." },
  ],
  marketing: [
    { title: "Digital Marketing Manager", company: "Nykaa", location: "Mumbai", salary: "8–14 LPA", type: "Full-time", experience: "3–5 yrs", skills: "SEO, SEM, Google Ads, Meta Ads, Analytics", description: "Lead digital marketing campaigns for India's top beauty brand." },
    { title: "Content Marketing Specialist", company: "Byju's", location: "Bangalore", salary: "5–9 LPA", type: "Full-time", experience: "1–3 yrs", skills: "Content Writing, SEO, WordPress, Social Media", description: "Create engaging content to drive user acquisition and retention." },
    { title: "Social Media Manager", company: "Meesho", location: "Bangalore", salary: "6–11 LPA", type: "Hybrid", experience: "2–4 yrs", skills: "Instagram, Facebook, Content Creation, Analytics", description: "Manage and grow social media presence across platforms." },
    { title: "SEO Specialist", company: "MakeMyTrip", location: "Delhi NCR", salary: "5–10 LPA", type: "Full-time", experience: "1–3 yrs", skills: "SEO, Ahrefs, Google Search Console, Content", description: "Optimize website ranking and organic traffic growth." },
  ],
  finance: [
    { title: "Financial Analyst", company: "HDFC Bank", location: "Mumbai", salary: "8–14 LPA", type: "Full-time", experience: "2–4 yrs", skills: "Excel, Financial Modeling, SQL, Tableau", description: "Analyze financial data and support investment decisions." },
    { title: "Chartered Accountant", company: "KPMG India", location: "Mumbai", salary: "10–18 LPA", type: "Full-time", experience: "2–5 yrs", skills: "CA, Taxation, Audit, Tally, GST", description: "Handle auditing, taxation, and financial reporting for clients." },
    { title: "Investment Banker", company: "Goldman Sachs India", location: "Bangalore", salary: "20–40 LPA", type: "Full-time", experience: "3–6 yrs", skills: "Financial Modeling, Valuation, M&A, Excel", description: "Support M&A transactions and capital markets deals." },
    { title: "Risk Analyst", company: "ICICI Bank", location: "Mumbai", salary: "7–13 LPA", type: "Full-time", experience: "2–4 yrs", skills: "Risk Management, SQL, Python, Statistics", description: "Identify and mitigate financial risks for the bank." },
  ],
  hr: [
    { title: "HR Manager", company: "Infosys", location: "Bangalore", salary: "8–14 LPA", type: "Full-time", experience: "3–5 yrs", skills: "Recruitment, HRMS, Employee Relations, Payroll", description: "Manage end-to-end HR operations for a large team." },
    { title: "Talent Acquisition Specialist", company: "TCS", location: "Chennai", salary: "5–9 LPA", type: "Full-time", experience: "1–3 yrs", skills: "Recruitment, LinkedIn, ATS, Interviewing", description: "Source and hire top talent for various tech roles." },
    { title: "HR Business Partner", company: "Wipro", location: "Hyderabad", salary: "9–16 LPA", type: "Full-time", experience: "4–6 yrs", skills: "HR Strategy, Compensation, Performance Management", description: "Partner with business leaders to drive HR initiatives." },
  ],
};

function getJobs(query) {
  const q = query.toLowerCase();
  let matched = [];

  for (const [key, jobs] of Object.entries(JOB_DATA)) {
    if (q.includes(key) || jobs.some(j =>
      j.title.toLowerCase().includes(q) ||
      j.skills.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q)
    )) {
      matched = matched.concat(jobs);
    }
  }

  if (matched.length === 0) {
    // Generic fallback
    const companies = ["TCS", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra", "Accenture", "Capgemini", "IBM India", "Cognizant"];
    const locations = ["Bangalore", "Mumbai", "Chennai", "Hyderabad", "Pune", "Delhi NCR"];
    matched = companies.map((company, i) => ({
      title: `${query.charAt(0).toUpperCase() + query.slice(1)} ${["Engineer","Specialist","Analyst","Lead","Consultant"][i % 5]}`,
      company,
      location: locations[i % locations.length],
      salary: ["4–8 LPA", "6–12 LPA", "8–15 LPA", "10–18 LPA", "12–20 LPA"][i % 5],
      type: ["Full-time", "Full-time", "Hybrid", "Full-time", "Remote"][i % 5],
      experience: ["0–1 yrs", "1–3 yrs", "2–4 yrs", "3–5 yrs", "5+ yrs"][i % 5],
      skills: `${query}, Problem Solving, Communication, Teamwork`,
      description: `Exciting ${query} opportunity at ${company}. Join our growing India team.`,
    }));
  }

  return matched.slice(0, 12).map((j, i) => ({
    ...j,
    id: `job-${i}`,
    applyUrl: `https://www.naukri.com/${encodeURIComponent((j.title).toLowerCase().replace(/\s+/g,"-"))}-jobs?title=${encodeURIComponent(j.title)}&company=${encodeURIComponent(j.company)}`
  }));
}

app.get("/api/jobs", (req, res) => {
  const query = req.query.q || "developer";
  const jobs = getJobs(query);
  res.json({ jobs, total: jobs.length, query });
});

app.get("/", (req, res) => {
  res.json({ status: "Skills Matter Backend running ✅", time: new Date() });
});

app.listen(PORT, () => {
  console.log(`✅ Server on port ${PORT}`);
});
