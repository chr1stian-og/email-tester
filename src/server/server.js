const express = require("express");
const app = express();
const path = require("path");
const routes = require("./connection.js");

//for frontend
app.use(express.static("frontend/"));

// app.use(routes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend on port ${PORT}.`);
});
