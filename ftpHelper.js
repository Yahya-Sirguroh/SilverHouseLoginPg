const ftp = require("basic-ftp");

const FTP_CONFIG = {
    host: "192.185.129.252",
    port: 21,
    user: "vr@silverhouse.business",
    password: "avETbx54=w5(",
    secure: false
};

class FTPHelper {
    static async connect() {
        const client = new ftp.Client();
        await client.access(FTP_CONFIG);
        return client;
    }

    static async readFile(remotePath) {
        const client = await FTPHelper.connect();
        const tmp = "tmp_ftp_read.txt";

        try {
            // Download to a temporary local file
            await client.downloadTo(tmp, remotePath);

            // Read contents
            const content = require("fs").readFileSync(tmp, "utf8");

            // Delete temp file
            require("fs").unlinkSync(tmp);

            return content;

        } catch (err) {
            console.log("FTP READ ERROR:", err.message);
            return null;
        } finally {
            client.close();
        }
    }


    static async writeFile(remotePath, content) {
        const client = await FTPHelper.connect();
        const fs = require("fs");
        const tmp = "tmp_ftp_upload.txt";

        try {
            // Write text content to temporary file
            fs.writeFileSync(tmp, content, "utf8");

            // Ensure directory exists
            const dir = remotePath.split("/").slice(0, -1).join("/");
            if (dir) await client.ensureDir(dir);

            // Upload temp file
            await client.uploadFrom(tmp, remotePath);

            // Remove temp file
            fs.unlinkSync(tmp);

        } catch (err) {
            console.error("FTP WRITE ERROR:", err);
        } finally {
            client.close();
        }
    }

}

module.exports = FTPHelper;
