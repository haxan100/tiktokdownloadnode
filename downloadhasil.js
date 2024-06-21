const tiktok = require('.'); // Pastikan modul ini benar
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Fungsi untuk mendownload file
const downloadFile = async (fileUrl, outputLocationPath) => {
    const writer = fs.createWriteStream(outputLocationPath);

    const response = await axios({
        url: fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl,
        method: 'GET',
        responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
            error = err;
            writer.close();
            reject(err);
        });
        writer.on('close', () => {
            if (!error) {
                resolve(true);
            }
        });
    });
};

// Fungsi utama untuk mendownload video dari daftar URL
const main = async () => {
    const downloadFolder = path.join(__dirname, 'videos');
    if (!fs.existsSync(downloadFolder)) {
        fs.mkdirSync(downloadFolder);
    }

    const urls = JSON.parse(fs.readFileSync('video_urls.json', 'utf8'));

    let counter = 1;

    for (const url of urls) {
        try {
            const result = await tiktok.dlpanda(url);
            console.log(result);

            // Mendownload video
            const videoUrl = result.video;
            const videoFilename = path.join(downloadFolder, `video${String(counter).padStart(2, '0')}.mp4`);
            console.log(`Downloading video from ${url}...`);
            await downloadFile(videoUrl, videoFilename);
            console.log(`Video downloaded successfully to ${videoFilename}`);
            counter++;
        } catch (e) {
            console.log(`Error downloading video from ${url}:`, e);
        }
    }
};

main();
