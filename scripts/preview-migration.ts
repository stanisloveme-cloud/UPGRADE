import * as fs from 'fs';

// Helper to sanitize text
const cleanString = (str: any) => {
    if (!str) return null;
    return str.toString().replace(/\s+/g, ' ').trim();
};

async function generatePreview() {
    console.log('🔄 Parsing Legacy Data for Preview...');
    
    // Read the raw JSON
    const rawData = fs.readFileSync('tmp/legacy_event_16.json', 'utf8');
    const legacyJson = JSON.parse(rawData);
    
    // We navigate to the program section
    const program = legacyJson.props?.program || {};
    const conferences = program.conferences || {};
    
    // Let's create an output structure that mimics our targeted Database structure
    // This will help the QA process
    const previewData = {
        event: {
            name: "New Retail Forum 2025 (Migrated)",
        },
        tracks: [] as any[],
        sessions: [] as any[],
        speakers: [] as any[] // Unique speakers
    };

    const speakersMap = new Map();

    for (const [dayString, halls] of Object.entries(conferences)) {
        for (const [hallId, tracks] of Object.entries(halls as any)) {
            for (const track of (tracks as any[])) {
                
                // Track creation
                const trackData = {
                    legacy_hall_id: hallId,
                    day: dayString,
                    name: cleanString(track.title),
                    time_start: track.minStart,
                    time_end: track.maxEnd,
                    sessions_count: (track.sessions || []).length
                };
                previewData.tracks.push(trackData);

                // Session creation
                for (const session of (track.sessions || [])) {
                    
                    let sessionName = null;
                    let sessionDesc = null;
                    let questions = [];

                    // The logic we discovered: titles are in the 'themes' array
                    if (session.themes && session.themes.length > 0) {
                        sessionName = cleanString(session.themes[0].title);
                        sessionDesc = cleanString(session.themes[0].description);
                        if (session.themes[0].questions) {
                            questions = session.themes[0].questions.map((q: any) => ({
                                order: q.sort_order || 0,
                                title: cleanString(q.title)
                            }));
                        }
                    } else {
                        // Fallback context
                        sessionName = `[No Theme] ${trackData.name}`;
                    }

                    const sessionPreview = {
                        track_name: trackData.name, // To link visually
                        time_start: session.time_start,
                        time_end: session.time_end,
                        name: sessionName,
                        description: sessionDesc,
                        speakers_count: (session.speakers || []).length,
                        questions_count: questions.length,
                        _questions_preview: questions
                    };
                    previewData.sessions.push(sessionPreview);

                    // Process Speakers
                    for (const sp of (session.speakers || [])) {
                        const person = sp.speaker_person;
                        if (!person) continue;

                        // Basic status mapping heuristic
                        const statusMap: Record<number, string> = {
                            1: 'confirmed', 2: 'pre_confirmed', 3: 'contact', 4: 'to_contact', 5: 'declined', 6: 'review'
                        };

                        const speakerRole = sp.speaker_role_id === 1 ? 'moderator' : 'speaker';
                        
                        previewData.sessions[previewData.sessions.length - 1]['_speakers_preview'] = 
                            previewData.sessions[previewData.sessions.length - 1]['_speakers_preview'] || [];
                        
                        previewData.sessions[previewData.sessions.length - 1]['_speakers_preview'].push({
                            name: `${cleanString(person.name)} ${cleanString(person.surname)}`,
                            role: speakerRole,
                            presentation_title: cleanString(sp.theme),
                            status: statusMap[sp.speaker_status_id] || `unknown(${sp.speaker_status_id})`,
                            status_date: sp.contact_date,
                            needs_call: sp.is_zoom,
                        });

                        if (!speakersMap.has(person.id)) {
                            speakersMap.set(person.id, {
                                legacy_id: person.id,
                                name: `${cleanString(person.name)} ${cleanString(person.surname)}`,
                                company: cleanString(person.company),
                                position: cleanString(person.job_title),
                                email: cleanString(person.email)
                            });
                        }
                    }
                }
            }
        }
    }

    previewData.speakers = Array.from(speakersMap.values());

    // Write output to tmp dir for user review
    fs.writeFileSync('tmp/migration_preview.json', JSON.stringify(previewData, null, 2));

    console.log(`✅ Preview generated!`);
    console.log(`📊 Stats:`);
    console.log(`  - Tracks: ${previewData.tracks.length}`);
    console.log(`  - Sessions: ${previewData.sessions.length}`);
    console.log(`  - Unique Speakers: ${previewData.speakers.length}`);
    console.log(`\nReview the data in: tmp/migration_preview.json`);
}

generatePreview().catch(console.error);
