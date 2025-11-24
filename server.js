// // server.js
// const express = require("express");
// const bodyParser = require("body-parser");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// const PORT = 3000;

// // Middleware
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// // Logs folder
// const logsDir = path.join(__dirname, "logs");
// if (!fs.existsSync(logsDir)) {
//   fs.mkdirSync(logsDir);
// }

// // Sample users (no DB)
// const USERS = {
//   admin: "silver123",
//   yahya: "silverhouse"
// };

// // Generate today's CSV path
// function getLogFilePath() {
//   const today = new Date().toISOString().slice(0, 10);
//   return path.join(logsDir, `login_log_${today}.csv`);
// }

// // Append login entry to CSV
// function appendToCSV(username, location, device) {
//   const filePath = getLogFilePath();
//   const timestamp = new Date().toLocaleString();
//   const line = `"${timestamp}","${username}","${location}","${device}"\n`;

//   if (!fs.existsSync(filePath)) {
//     const headers = `"Timestamp","Username","Location","Device"\n`;
//     fs.writeFileSync(filePath, headers);
//   }

//   fs.appendFileSync(filePath, line);
//   return filePath;
// }

// // Login route
// app.post("/login", (req, res) => {
//   const { username, password, location, device } = req.body;

//   if (!username || !password)
//     return res.json({ success: false, message: "Missing credentials." });

//   const validPass = USERS[username];
//   if (!validPass || password !== validPass)
//     return res.json({ success: false, message: "Invalid username or password." });

//   const savedPath = appendToCSV(username, location, device);
//   console.log(`✅ Login recorded for ${username} → ${savedPath}`);

//   res.json({ success: true, message: "Login successful", filePath: savedPath });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 SilverHouse Login running at http://localhost:${PORT}`);
// });
// 2nd
// const express = require("express");
// const bodyParser = require("body-parser");
// const fs = require("fs");
// const path = require("path");
// const { machineIdSync } = require("node-machine-id");

// const app = express();
// const PORT = 3000;

// // Middleware
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// // Logs folder
// const logsDir = path.join(__dirname, "logs");
// if (!fs.existsSync(logsDir)) {
//   fs.mkdirSync(logsDir);
// }

// // Sample users (no DB)
// const USERS = {
//   admin: "silver123",
//   yahya: "silverhouse",
// };

// // Generate today's CSV path
// function getLogFilePath() {
//   const today = new Date().toISOString().slice(0, 10);
//   return path.join(logsDir, `login_log_${today}.csv`);
// }

// // Append login entry to CSV (with machine ID)
// function appendToCSV(username, location) {
//   const filePath = getLogFilePath();
//   const timestamp = new Date().toLocaleString();
//   const machineId = machineIdSync(); // Get machine ID

//   const line = `"${timestamp}","${username}","${location}","${machineId}"\n`;

//   if (!fs.existsSync(filePath)) {
//     const headers = `"Timestamp","Username","Location","Machine ID"\n`;
//     fs.writeFileSync(filePath, headers);
//   }

//   fs.appendFileSync(filePath, line);
//   return filePath;
// }

// // Login route
// app.post("/login", (req, res) => {
//   const { username, password, location } = req.body;

//   if (!username || !password)
//     return res.json({ success: false, message: "Missing credentials." });

//   const validPass = USERS[username];
//   if (!validPass || password !== validPass)
//     return res.json({ success: false, message: "Invalid username or password." });

//   const savedPath = appendToCSV(username, location);
//   console.log(`✅ Login recorded for ${username} → ${savedPath}`);

//   res.json({ success: true, message: "Login successful", filePath: savedPath });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 SilverHouse Login running at http://localhost:${PORT}`);
// });

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");
const ftp = require("basic-ftp")

// -----------------------------------------------------
// MACHINE ID FILE (SUPPORTS MULTIPLE IDs)
// -----------------------------------------------------
const MACHINE_ID_FILE = "D:\\Freelance\\csv-viewer\\machine-ids.txt";

function getLocalMachineIdsFromFile() {
  try {
    if (fs.existsSync(MACHINE_ID_FILE)) {
      const content = fs.readFileSync(MACHINE_ID_FILE, "utf8");

      // Return array of cleaned machine IDs
      return content
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
    return null;
  } catch (err) {
    console.error("❌ Error reading machine_id.txt:", err);
    return null;
  }
}

// -----------------------------------------------------
// SERVER MACHINE UUID (Just for Logging)
// -----------------------------------------------------
function getServerMachineUUID() {
  const platform = os.platform();

  try {
    if (platform === "win32") {
      return execSync("wmic csproduct get uuid").toString().split("\n")[1].trim();
    }

    if (platform === "darwin") {
      return execSync("ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID")
        .toString()
        .split('"')[3];
    }

    if (platform === "linux") {
      try {
        return execSync("cat /etc/machine-id").toString().trim();
      } catch (_) {}

      try {
        return execSync("settings get secure android_id").toString().trim();
      } catch (_) {}

      return "UNKNOWN_LINUX_OR_ANDROID_UUID";
    }

    return "UNKNOWN_PLATFORM";
  } catch {
    return "UUID_ERROR";
  }
}

console.log("Server Machine UUID:", getServerMachineUUID());

// -----------------------------------------------------
// EXPRESS SETUP
// -----------------------------------------------------
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "docs")));

// -----------------------------------------------------
// LOG DIRECTORY
// -----------------------------------------------------
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// -----------------------------------------------------
// USER DATABASE
// -----------------------------------------------------
const USERS = {
  admin: {
    password: "admin123"
  },
  yahya: {
    password: "silverhouse"
  }
};

// -----------------------------------------------------
// CSV LOGGING
// -----------------------------------------------------
function getLogFilePath() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return path.join(logsDir, `login_log_${year}-${month}.csv`);
}

function appendToCSV(username, location, clientMachineId) {
  const filePath = getLogFilePath();
  const timestamp = new Date().toLocaleString();
  const serverMachineId = getServerMachineUUID();

  const line = `"${timestamp}","${username}","${location}","${clientMachineId}","${serverMachineId}"\n`;

  if (!fs.existsSync(filePath)) {
    const headers = `"Timestamp","Username","Location","Client Machine ID","Server Machine ID"\n`;
    fs.writeFileSync(filePath, headers);
  }

  fs.appendFileSync(filePath, line);
}

// -----------------------------------------------------
// LOGIN API
// -----------------------------------------------------
app.post("/login", (req, res) => {
  const { username, password, location, machineId } = req.body;

  const user = USERS[username];

  if (!user) {
    return res.json({ success: false, message: "Invalid username or password." });
  }

  if (password !== user.password) {
    return res.json({ success: false, message: "Invalid username or password." });
  }

  // -----------------------------------------------------
  // MACHINE ID VALIDATION (MULTIPLE IDs)
  // -----------------------------------------------------
  const localMachineIds = getLocalMachineIdsFromFile();

  if (!localMachineIds || localMachineIds.length === 0) {
    return res.json({
      success: false,
      message: "File not found."
    });
  }

  console.log("Accepted Machine IDs:", localMachineIds);

  if (!localMachineIds.includes(machineId)) {
    return res.json({
      success: false,
      message: "Device not registered",
      type: "error"
    });
  }

  // -----------------------------------------------------
  // LOG SUCCESSFUL LOGIN
  // -----------------------------------------------------
  appendToCSV(username, location, machineId);

  res.json({ success: true, message: "Login successful" });
});

// -----------------------------------------------------
// START SERVER
// -----------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 SilverHouse Login running at http://10.182.197.75:${PORT}`);
});
