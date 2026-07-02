const express = require("express");
const path = require("path");

const PORT = process.env.PORT;
if (!PORT) {
  console.error("Missing PORT environment variable. Set PORT before running the server.");
  process.exit(1);
}

const app = express();
const buildDir = path.join(__dirname, "..", "frontend", "build");

app.use(express.static(buildDir));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(buildDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
