require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./src/config/firebase");

const ingestionRoutes = require("./src/routes/ingestion.routes");
const logisticsRoutes = require("./src/routes/logistics.routes");
const volunteerRoutes = require("./src/routes/volunteer.routes");
const dispatchRoutes = require("./src/routes/dispatch.routes");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "SamarthAI Core Backend Running" });
});

app.use("/api/ingestion", ingestionRoutes);
app.use("/api/logistics", logisticsRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/dispatch", dispatchRoutes);

app.listen(PORT, () => {
  console.log("SamarthAI backend listening on port " + PORT);
});
