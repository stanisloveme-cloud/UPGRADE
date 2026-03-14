const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://upgrade:upgrade_pass@localhost:5433/upgrade_crm'
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT name, logo_url, logo_file_url FROM sponsors ORDER BY id DESC LIMIT 5');
  console.log(res.rows);
  await client.end();
}

run().catch(console.error);
