import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import FormData from 'form-data';

async function uploadLogos() {
    const dir = path.join(process.cwd(), 'uploads', 'legacy_brands');
    if (!fs.existsSync(dir)) {
        console.error('Directory not found:', dir);
        return;
    }

    const files = fs.readdirSync(dir);
    console.log(`Found ${files.length} files to upload.`);

    let successCount = 0;
    let failCount = 0;

    // Use a small concurrency limit or just sequential to avoid overwhelming the server
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (!fs.statSync(filePath).isFile()) continue;

        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            const res = await axios.post(`https://devupgrade.space4you.ru/api/uploads/exact-logo/${encodeURIComponent(file)}`, formData, {
                headers: {
                    ...formData.getHeaders()
                },
                maxBodyLength: Infinity,
                timeout: 10000
            });
            console.log(`✅ Uploaded ${file} -> ${res.data.url}`);
            successCount++;
        } catch (error: any) {
            console.error(`❌ Failed to upload ${file}:`, error.message);
            failCount++;
        }
    }

    console.log(`\nUpload complete. Success: ${successCount}, Failed: ${failCount}`);
}

uploadLogos().catch(console.error);
