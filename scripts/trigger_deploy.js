const fs = require('fs');

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
    process.exit(1);
}

async function triggerDeploy() {
    const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NodeJS-Script'
    };

    const url = 'https://api.github.com/repos/stanisloveme-cloud/UPGRADE/actions/workflows/deploy.yml/dispatches';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ ref: 'main' })
        });

        if (response.status === 204) {
            console.log("Deployment triggered successfully.");
        } else {
            console.error(`Failed: ${response.status} ${await response.text()}`);
        }
    } catch (error) {
        console.error(error);
    }
}

triggerDeploy();
