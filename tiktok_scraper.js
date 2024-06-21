const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Fungsi untuk mengambil semua URL video dari halaman TikTok
const getVideoUrls = async (userUrl) => {
    const browser = await puppeteer.launch({ headless: false }); // Set headless ke false untuk debug visual
    const page = await browser.newPage();

    await page.goto(userUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Tunggu elemen video untuk memastikan halaman telah dimuat
    await page.waitForSelector('a[href*="/video/"]', { timeout: 60000 });

    // Ambil semua URL video dari elemen <a> yang mengandung href dengan '/video/'
    const videoUrls = await page.evaluate(() => {
        const links = document.querySelectorAll('a[href*="/video/"]');
        const urls = Array.from(links).map(link => link.href);
        return Array.from(new Set(urls)); // Menggunakan Set untuk menghapus duplikasi
    });

    await browser.close();
    return videoUrls;
};

// Fungsi utama untuk mengambil URL video dan menyimpannya ke dalam file JSON
const main = async () => {
    const userUrl = 'https://www.tiktok.com/@funnycats0ftiktok';  // Ganti dengan URL profil TikTok yang diinginkan
    const outputFile = path.join(__dirname, 'video_urls.json');

    // Baca konten file JSON yang sudah ada
    let existingUrls = [];
    if (fs.existsSync(outputFile)) {
        const existingData = fs.readFileSync(outputFile, 'utf8');
        existingUrls = JSON.parse(existingData);
    }

    const newVideoUrls = await getVideoUrls(userUrl);
    console.log(`Found ${newVideoUrls.length} videos.`);

    // Gabungkan hasil baru dengan hasil lama dan hapus duplikasi
    const allVideoUrls = Array.from(new Set([...existingUrls, ...newVideoUrls]));

    // Simpan URL video ke dalam file JSON
    fs.writeFileSync(outputFile, JSON.stringify(allVideoUrls, null, 2));
    console.log(`Video URLs saved to ${outputFile}`);
};

main();
