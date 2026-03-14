import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const speakersData = require('./spring_speakers_photos.json');
const UPLOADS_DIR = path.join(__dirname, '../uploads'); // Assuming we run from tmp

async function downloadPhoto(url: string, filepath: string): Promise<boolean> {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                console.error(`Failed to download ${url}: ${res.statusCode}`);
                resolve(false);
                return;
            }
            const fileStream = fs.createWriteStream(filepath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(true);
            });
        }).on('error', (err) => {
            console.error(`Error downloading ${url}:`, err);
            resolve(false);
        });
    });
}

async function run() {
    console.log(`Processing ${speakersData.length} speaker photos from Yandex Cloud...`);
    
    // Ensure uploads dir exists
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const item of speakersData) {
        const { name, photoUrl } = item;
        
        // Split name (assuming "FirstName LastName" or "LastName FirstName")
        const nameParts = name.trim().split(/\s+/);
        if (nameParts.length < 2) continue;
        
        // Try to find the speaker in the DB
        // We will do a generic OR search since sometimes names are inverted
        const speaker = await prisma.speaker.findFirst({
            where: {
                OR: [
                    { firstName: nameParts[0], lastName: nameParts[1] },
                    { firstName: nameParts[1], lastName: nameParts[0] },
                ]
            }
        });

        if (!speaker) {
            console.log(`Speaker not found in DB: ${name}`);
            notFoundCount++;
            continue;
        }

        console.log(`Found speaker: ${speaker.firstName} ${speaker.lastName}. Downloading photo...`);
        
        // Generate a filename
        const ext = photoUrl.split('.').pop() || 'webp';
        const filename = `speaker-${speaker.id}-${uuidv4()}.${ext}`;
        const filepath = path.join(UPLOADS_DIR, filename);
        
        const success = await downloadPhoto(photoUrl, filepath);
        
        if (success) {
            // Update the DB record with the new URL
            await prisma.speaker.update({
                where: { id: speaker.id },
                data: { photoUrl: `/api/uploads/${filename}` }
            });
            console.log(`✅ Updated photo for ${name}`);
            updatedCount++;
        }
    }

    console.log(`\nMigration complete! Updated ${updatedCount} speakers. ${notFoundCount} not found.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
