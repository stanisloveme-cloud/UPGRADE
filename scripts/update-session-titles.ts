import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
    console.log('🔄 Mapping and Updating Session Titles...');
    
    // Read the rich JSON that actually contains session titles
    const rawData = fs.readFileSync('data/urspring25_inertia_api.json', 'utf8');
    const parsed = JSON.parse(rawData);
    const program = parsed.props?.program;
    
    if (!program || !program.conferences) {
        throw new Error('Could not find conferences in JSON.');
    }
    
    let updateCount = 0;
    let notFoundCount = 0;

    for (const [dateStr, hallsObj] of Object.entries(program.conferences)) {
        const typedHallsObj = hallsObj as Record<string, any[]>;
        for (const [legacyHallId, conferencesArr] of Object.entries(typedHallsObj)) {
            for (const conf of conferencesArr) {
                const trackName = conf.title || "Untitled Track";
                const sessionsResp = conf.sessions || [];
                
                for (const sess of sessionsResp) {
                    const realTitle = sess.title || sess.name;
                    if (!realTitle) continue; // nothing to update
                    
                    const startTime = sess.time_start.substring(0, 5);
                    const endTime = sess.time_end.substring(0, 5);

                    // Find matching session in DB
                    // Because track names might be duplicated across halls, we match by:
                    // Track name + Track Hall name (or just track name if it's unique enough) + session start/end
                    const dbSessions = await prisma.session.findMany({
                        where: {
                            startTime,
                            endTime,
                            track: {
                                name: trackName
                            }
                        },
                        include: {
                            track: true
                        }
                    });
                    
                    if (dbSessions.length === 1) {
                        const dbSess = dbSessions[0];
                        await prisma.session.update({
                            where: { id: dbSess.id },
                            data: { name: realTitle }
                        });
                        console.log(`✅ Updated Session ${dbSess.id}: "${realTitle}"`);
                        updateCount++;
                    } else if (dbSessions.length > 1) {
                        console.log(`⚠️ Multiple matches for Track '${trackName}' at ${startTime}-${endTime}. Updating first...`);
                        await prisma.session.update({
                            where: { id: dbSessions[0].id },
                            data: { name: realTitle }
                        });
                        updateCount++;
                    } else {
                        console.log(`❌ Not found: Track '${trackName}' at ${startTime}-${endTime} (Target title: "${realTitle}")`);
                        notFoundCount++;
                    }
                }
            }
        }
    }
    
    console.log(`\n🎉 Title Update Complete!`);
    console.log(`➡️  Sessions Updated: ${updateCount}`);
    console.log(`➡️  Sessions Not Found: ${notFoundCount}`);
}

run()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
