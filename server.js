const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");
const FTPHelper = require("./ftpHelper");   // <-- NEW

// -----------------------------------------------------
// LOAD MACHINE IDs FROM FTP (INSTEAD OF LOCAL FILE)
// -----------------------------------------------------
async function getLocalMachineIdsFromFile() {
    try {
        const content = await FTPHelper.readFile("/MachineIds.txt");

        if (!content) return null;

        return content
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

    } catch (err) {
        console.error("❌ Error reading MachineIds.txt:", err);
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
            return execSync(
                "ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID"
            )
                .toString()
                .split('"')[3];
        }
        if (platform === "linux") {
            try {
                return execSync("cat /etc/machine-id").toString().trim();
            } catch (_) {}

            return "UNKNOWN_LINUX";
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
// USER DATABASE
// -----------------------------------------------------
const USERS = {
    admin: { password: "admin123" },
    yahya: { password: "silverhouse" }
};

// -----------------------------------------------------
// CSV LOGGING (NOW USING FTP)
// -----------------------------------------------------
function getLogFilePath() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `/Logs/login_log_${year}-${month}.csv`;   // <-- FTP PATH
}

async function appendToCSV(username, location, clientMachineId) {
    const filePath = getLogFilePath();
    const timestamp = new Date().toLocaleString();
    const serverMachineId = getServerMachineUUID();

    const newLine = `"${timestamp}","${username}","${location}","${clientMachineId}","${serverMachineId}"\n`;

    // Read old CSV from FTP
    let oldCSV = await FTPHelper.readFile(filePath);

    // Add header if file does not exist
    if (!oldCSV) {
        oldCSV = `"Timestamp","Username","Location","Client Machine ID","Server Machine ID"\n`;
    }

    // Append new line
    const updatedCSV = oldCSV + newLine;

    // Upload back to FTP
    await FTPHelper.writeFile(filePath, updatedCSV);
}

// -----------------------------------------------------
// LOGIN API
// -----------------------------------------------------
app.post("/login", async (req, res) => {
    const { username, password, location, machineId } = req.body;

    const user = USERS[username];

    if (!user) {
        return res.json({ success: false, message: "Invalid username or password." });
    }

    if (password !== user.password) {
        return res.json({ success: false, message: "Invalid username or password." });
    }

    // -----------------------------------------------------
    // MACHINE ID VALIDATION FROM FTP
    // -----------------------------------------------------
    const machineIds = await getLocalMachineIdsFromFile();

    if (!machineIds || machineIds.length === 0) {
        return res.json({
            success: false,
            message: "MachineIds.txt not found on FTP"
        });
    }

    console.log("Accepted Machine IDs:", machineIds);

    if (!machineIds.includes(machineId)) {
    return res.json({
        success: false,
        message: `Device not registered.\nMachineID: ${machineId}`,
        type: "error"
    });
}


    // -----------------------------------------------------
    // LOG SUCCESSFUL LOGIN TO FTP
    // -----------------------------------------------------
    await appendToCSV(username, location, machineId);

    res.json({ success: true, message: "Login successful" });
});

// -----------------------------------------------------
// START SERVER
// -----------------------------------------------------
app.listen(PORT, () => {
    console.log(`🚀 SilverHouse Login running at http://localhost:${PORT}`);
});
