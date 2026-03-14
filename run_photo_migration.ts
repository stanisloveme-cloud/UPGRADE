import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { v4 as uuidv4 } from 'uuid';

const speakersData = require('./tmp/spring_speakers_photos.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

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

async function bootstrap() {
    console.log('Bootstrapping Nest...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);
    
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

    let updatedCount = 0;
    
    // Get ALL speakers from DB to do loose matching in memory
    const allSpeakers = await prisma.speaker.findMany();

    for (const item of speakersData) {
        const { name, photoUrl } = item;
        const nameParts = name.toLowerCase().trim().split(/\s+/);
        if (nameParts.length < 2) continue;
        
        // Loose memory match to bypass Prisma strict string bugs
        const speaker = allSpeakers.find(s => 
            (s.firstName.toLowerCase().includes(nameParts[0]) && s.lastName.toLowerCase().includes(nameParts[nameParts.length-1])) ||
            (s.firstName.toLowerCase().includes(nameParts[nameParts.length-1]) && s.lastName.toLowerCase().includes(nameParts[0]))
        );

        if (!speaker) {
            console.log(`Speaker not found in DB: ${name}`);
            continue;
        }

        console.log(`Found speaker: ${speaker.firstName} ${speaker.lastName}.`);
        
        const ext = photoUrl.split('.').pop() || 'webp';
        const filename = `speaker-${speaker.id}-${uuidv4()}.${ext}`;
        const filepath = path.join(UPLOADS_DIR, filename);
        
        const success = await downloadPhoto(photoUrl, filepath);
        
        if (success) {
            try {
                // Ensure speaker actually exists inside the PG instance
                const validSpeaker = await prisma.speaker.findUnique({ where: { id: speaker.id } });
                if (validSpeaker) {
                    await prisma.speaker.update({
                        where: { id: speaker.id },
                        data: { photoUrl: `/api/uploads/${filename}` }
                    });
                    console.log(`✅ Updated photo for ${speaker.firstName} ${speaker.lastName}`);
                    updatedCount++;
                } else {
                    console.error(`❌ DB out of sync for ${speaker.id}`);
                }
            } catch (err) {
                 console.error(`❌ Prisma error for ${speaker.firstName}:`, err);
            }
        }
    }

    console.log(`\nMigration complete! Updated ${updatedCount} speakers.`);
    await app.close();
}

bootstrap().catch(console.error);
