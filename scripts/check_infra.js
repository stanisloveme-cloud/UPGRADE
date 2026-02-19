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
    console.error("Failed to read .env");
    process.exit(1);
}

async function checkInfra() {
    const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NodeJS-Script'
    };

    const url = 'https://api.github.com/repos/stanisloveme-cloud/UPGRADE/actions/workflows/setup_infra.yml/runs?per_page=1';

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const run = data.workflow_runs[0];

        if (run) {
            console.log(`Status: ${run.status}`);
            console.log(`Conclusion: ${run.conclusion}`);
            console.log(`URL: ${run.html_url}`);
        }
    } catch (error) {
        console.error(error);
    }
}

checkInfra();
