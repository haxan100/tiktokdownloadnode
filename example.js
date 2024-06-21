const tiktok = require('.')
const url = 'https://www.tiktok.com/@fzhptraulia/video/7375979001522785541'
const path = require('path');
const fs = require('fs');
const axios = require('axios');
     
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
 
 const main = async () => {
     try {
         const result = await tiktok.dlpanda(url);
         console.log(result);
 
         // Folder untuk menyimpan video
         const downloadFolder = path.join(__dirname, 'videos');
         if (!fs.existsSync(downloadFolder)) {
             fs.mkdirSync(downloadFolder);
         }
 
         // Mendownload video
         const videoUrl = result.video;
         const videoFilename = path.join(downloadFolder, 'video.mp4');
         console.log('Downloading video...');
         await downloadFile(videoUrl, videoFilename);
         console.log(`Video downloaded successfully to ${videoFilename}`);
 
     } catch (e) {
         console.log(e);
     }
 };
 
 main();