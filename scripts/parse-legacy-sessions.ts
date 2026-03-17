import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('data/urspring25_inertia_api.json', 'utf8'));
const conferences = data.props.program.conferences;

let sessions = [];

for (const day of Object.keys(conferences)) {
    const halls = conferences[day];
    for (const hallId of Object.keys(halls)) {
        const tracks = halls[hallId];
        for (const track of tracks) {
            if (track.sessions) {
                for (const s of track.sessions) {
                    sessions.push({
                        id: s.id,
                        title: s.name,
                        time_start: s.time_start,
                        time_end: s.time_end,
                        day_string: day,
                        hall_id: hallId,
                        track_id: track.id
                    });
                }
            }
        }
    }
}

console.log(`Found ${sessions.length} sessions!`);
fs.writeFileSync('data/session_titles.json', JSON.stringify(sessions, null, 2));
