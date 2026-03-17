const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://upgrade:upgrade_pass@db:5432/upgrade_crm'
});

async function main() {
  console.log("Starting secure export...");
  
  // Export Speakers
  const resSpeakers = await pool.query(`SELECT json_agg(s) FROM (SELECT * FROM speakers) s;`);
  fs.writeFileSync('/tmp/speakers_clean.json', JSON.stringify(resSpeakers.rows[0].json_agg, null, 2));
  console.log("Speakers exported.");
  
  const eventQuery = `
WITH event_data AS (
  SELECT e.*,
    (
      SELECT json_agg(h)
      FROM (
        SELECT h.*,
          (
            SELECT json_agg(t)
            FROM (
              SELECT t.*,
                (
                  SELECT json_agg(s)
                  FROM (
                    SELECT s.*,
                      (
                        SELECT json_agg(ss)
                        FROM (
                          SELECT ss.*
                          FROM session_speakers ss
                          WHERE ss.session_id = s.id
                        ) ss
                      ) as speakers
                    FROM sessions s
                    WHERE s.track_id = t.id
                  ) s
                ) as sessions
              FROM tracks t
              WHERE t.hall_id = h.id
            ) t
          ) as tracks
        FROM halls h
        WHERE h.event_id = e.id
      ) h
    ) as halls
  FROM events e
  WHERE e.id = 76
) SELECT json_agg(event_data) as json_agg FROM event_data;
`;
  
  const resEvent = await pool.query(eventQuery);
  fs.writeFileSync('/tmp/event76_clean.json', JSON.stringify(resEvent.rows[0].json_agg, null, 2));
  console.log("Event 76 exported.");
  
  await pool.end();
}

main().catch(err => {
  console.error("Export failed:", err);
  process.exit(1);
});
