const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://upgrade:upgrade_pass@localhost:5433/upgrade_crm',
});

async function importSpeakers() {
  const speakersData = JSON.parse(fs.readFileSync('speakers.json', 'utf-8'));
  console.log(`Starting to import ${speakersData.length} speakers...`);
  let count = 0;
  
  for (const speaker of speakersData) {
    if (!speaker) continue;
    try {
      await pool.query(`
        INSERT INTO speakers (id, first_name, last_name, company, position, email, phone, telegram, photo_url, is_sponsor, bio, internal_comment, has_assistant, assistant_name, assistant_contact)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          company = EXCLUDED.company,
          position = EXCLUDED.position,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          telegram = EXCLUDED.telegram,
          photo_url = EXCLUDED.photo_url,
          is_sponsor = EXCLUDED.is_sponsor,
          bio = EXCLUDED.bio,
          internal_comment = EXCLUDED.internal_comment,
          has_assistant = EXCLUDED.has_assistant,
          assistant_name = EXCLUDED.assistant_name,
          assistant_contact = EXCLUDED.assistant_contact
      `, [
        speaker.id, speaker.first_name, speaker.last_name, speaker.company, speaker.position, speaker.email, 
        speaker.phone, speaker.telegram, speaker.photo_url, speaker.is_sponsor, speaker.bio, 
        speaker.internal_comment, speaker.has_assistant, speaker.assistant_name, speaker.assistant_contact
      ]);
      count++;
    } catch (e) {
      console.error(`Failed to import speaker ${speaker.id}:`, e.message);
    }
  }
  console.log(`Successfully imported ${count} speakers.`);
}

async function importEvent() {
  const rawData = fs.readFileSync('event76.json', 'utf-8');
  let event = JSON.parse(rawData);
  if (Array.isArray(event)) event = event[0];

  if (!event) {
    console.error("Event data is empty."); return;
  }
  console.log(`Importing event: ${event.name}`);

  try {
    await pool.query(`
      INSERT INTO events (id, name, description, start_date, end_date, status, memo_template, location, event_logo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        status = EXCLUDED.status,
        memo_template = EXCLUDED.memo_template,
        location = EXCLUDED.location,
        event_logo_url = EXCLUDED.event_logo_url
    `, [event.id, event.name, event.description, new Date(event.start_date), new Date(event.end_date), event.status, event.memo_template, event.location, event.event_logo_url]);

    if (event.halls) {
      for (const hall of event.halls) {
        await pool.query(`
          INSERT INTO halls (id, name, capacity, sort_order, event_id)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            capacity = EXCLUDED.capacity,
            sort_order = EXCLUDED.sort_order,
            event_id = EXCLUDED.event_id
        `, [hall.id, hall.name, hall.capacity, hall.sort_order, event.id]);

        if (hall.tracks) {
          for (const track of hall.tracks) {
            await pool.query(`
              INSERT INTO tracks (id, name, description, day, start_time, end_time, sort_order, material_type, ready_date, status, material_link, hall_id)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                day = EXCLUDED.day,
                start_time = EXCLUDED.start_time,
                end_time = EXCLUDED.end_time,
                sort_order = EXCLUDED.sort_order,
                material_type = EXCLUDED.material_type,
                ready_date = EXCLUDED.ready_date,
                status = EXCLUDED.status,
                material_link = EXCLUDED.material_link,
                hall_id = EXCLUDED.hall_id
            `, [track.id, track.name, track.description, new Date(track.day), track.start_time, track.end_time, track.sort_order, track.material_type, track.ready_date ? new Date(track.ready_date) : null, track.status, track.material_link, hall.id]);

            if (track.sessions) {
              for (const session of track.sessions) {
                await pool.query(`
                  INSERT INTO sessions (id, name, description, start_time, end_time, comments, clients, track_id)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                  ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    start_time = EXCLUDED.start_time,
                    end_time = EXCLUDED.end_time,
                    comments = EXCLUDED.comments,
                    clients = EXCLUDED.clients,
                    track_id = EXCLUDED.track_id
                `, [session.id, session.name, session.description, session.start_time, session.end_time, session.comments, session.clients, track.id]);

                if (session.speakers) {
                  for (const ss of session.speakers) {
                    await pool.query(`
                      INSERT INTO session_speakers (id, session_id, speaker_id, role, status, status_date, status_user_id, sort_order, needs_call, call_link, has_presentation, manager_comment, program_thesis, newsletter_quote, presence_status, notified_tg, notified_email, export_to_website, company_snapshot, position_snapshot, presentation_title, presentation_url)
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
                      ON CONFLICT (id) DO UPDATE SET
                        session_id = EXCLUDED.session_id,
                        speaker_id = EXCLUDED.speaker_id,
                        role = EXCLUDED.role,
                        status = EXCLUDED.status,
                        status_date = EXCLUDED.status_date,
                        status_user_id = EXCLUDED.status_user_id,
                        sort_order = EXCLUDED.sort_order,
                        needs_call = EXCLUDED.needs_call,
                        call_link = EXCLUDED.call_link,
                        has_presentation = EXCLUDED.has_presentation,
                        manager_comment = EXCLUDED.manager_comment,
                        program_thesis = EXCLUDED.program_thesis,
                        newsletter_quote = EXCLUDED.newsletter_quote,
                        presence_status = EXCLUDED.presence_status,
                        notified_tg = EXCLUDED.notified_tg,
                        notified_email = EXCLUDED.notified_email,
                        export_to_website = EXCLUDED.export_to_website,
                        company_snapshot = EXCLUDED.company_snapshot,
                        position_snapshot = EXCLUDED.position_snapshot,
                        presentation_title = EXCLUDED.presentation_title,
                        presentation_url = EXCLUDED.presentation_url
                    `, [ss.id, session.id, ss.speaker_id, ss.role, ss.status, ss.status_date ? new Date(ss.status_date) : null, ss.status_user_id, ss.sort_order, ss.needs_call, ss.call_link, ss.has_presentation, ss.manager_comment, ss.program_thesis, ss.newsletter_quote, ss.presence_status, ss.notified_tg, ss.notified_email, ss.export_to_website, ss.company_snapshot, ss.position_snapshot, ss.presentation_title, ss.presentation_url]);
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log("Successfully imported Event 76!");
  } catch (e) {
    console.error("Failed to import Event 76", e);
  }
}

async function main() {
  await pool.connect();
  await importSpeakers();
  await importEvent();
  await pool.end();
}

main().catch(console.error);
