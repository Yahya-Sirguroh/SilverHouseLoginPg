const ftp = require("basic-ftp")

async function uploadFile() {
    const client = new ftp.Client()
    client.ftp.verbose = true

    try {
        await client.access({
            host: "192.168.43.82",
            port: 21,
            user: "ASUS",
            password: "ynotdc@123",
            secure: false
        })

        console.log("Connected to FTP")

        // FIXED Local file path
        const localFilePath = "D:/Freelance/SilverHouseLoginPg/logs/login_log_2025-11.csv"

        // FTP folder path
        const remotePath = "/Logs/login_log_2025-11.csv"

        await client.ensureDir("/Logs")

        await client.uploadFrom(localFilePath, remotePath)

        console.log("File uploaded successfully!")
    }
    catch (err) {
        console.error("FTP Upload Error:", err)
    }

    client.close()
}

uploadFile()
