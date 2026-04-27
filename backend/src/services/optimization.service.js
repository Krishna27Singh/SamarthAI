const { execFile } = require("child_process");
const { promisify } = require("util");
const path = require("path");

const execFileAsync = promisify(execFile);

function formatForCpp(hub, camps) {
  if (!hub || typeof hub !== "object") {
    throw new Error("Hub is required for optimization.");
  }

  if (!Array.isArray(camps)) {
    throw new Error("Camps must be an array for optimization.");
  }

  const hubString = [hub.id, hub.lat, hub.lng].join(",");
  const campStrings = camps.map((camp) => {
    if (!camp || typeof camp !== "object") {
      throw new Error("Each camp must be an object.");
    }

    return [camp.id, camp.lat, camp.lng, camp.urgency_score, camp.anomaly_score].join(",");
  });

  return [hubString, ...campStrings].join("|");
}

async function runOptimization(hub, camps) {
  try {
    const formattedInput = formatForCpp(hub, camps);
    const binaryName = process.platform === "win32" ? "optimizer.exe" : "optimizer";
    const binaryPath = path.resolve(__dirname, "..", "optimizer", binaryName);

    const { stdout } = await execFileAsync(binaryPath, [formattedInput]);
    return JSON.parse(stdout.trim());
  } catch (error) {
    throw new Error(`Route optimization failed: ${error.message}`);
  }
}

module.exports = {
  formatForCpp,
  runOptimization,
};