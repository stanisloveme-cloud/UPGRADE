
const fs = require('fs');

// Read .env manually
let token = '';
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('GITHUB_TOKEN=')) {
      token = line.split('=')[1].trim();
      break;
    }
  }
} catch (e) {
  console.error("Failed to read .env:", e.message);
  process.exit(1);
}

async function triggerSwapSetup() {
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'NodeJS-Script'
  };

  const url = 'https://api.github.com/repos/stanisloveme-cloud/UPGRADE/actions/workflows/setup_infra.yml/dispatches';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ ref: 'main' })
    });

    if (response.status === 204) {
      console.log("Successfully triggered 'Setup Infrastructure' workflow.");
    } else {
      console.error(`Failed to trigger workflow: ${response.status} ${response.statusText}`);
      console.error(await response.text());
    }
  } catch (error) {
    console.error("Error triggering workflow:", error);
  }
}

triggerSwapSetup();
