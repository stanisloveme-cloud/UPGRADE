
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

if (!token) {
    console.error("GITHUB_TOKEN not found in .env");
    process.exit(1);
}

async function checkDeploy() {
    const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NodeJS-Script'
    };

    const url = 'https://api.github.com/repos/stanisloveme-cloud/UPGRADE/actions/workflows/deploy.yml/runs?per_page=1';

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}\n${await response.text()}`);
        }

        const data = await response.json();
        if (data.workflow_runs && data.workflow_runs.length > 0) {
            const run = data.workflow_runs[0];
            console.log(`\n=== LATEST DEPLOYMENT STATUS ===`);
            console.log(`ID: ${run.id}`);
            console.log(`Name: ${run.name}`);
            console.log(`Status: ${run.status}`);
            console.log(`Conclusion: ${run.conclusion}`);
            console.log(`Created At: ${run.created_at}`);
            console.log(`Updated At: ${run.updated_at}`);
            console.log(`URL: ${run.html_url}`);

            // Also get jobs for details if failed
            if (run.conclusion === 'failure') {
                console.log('\n--- Failed Jobs ---');
                const jobsUrl = run.jobs_url;
                const jobsRes = await fetch(jobsUrl, { headers });
                if (jobsRes.ok) {
                    const jobsData = await jobsRes.json();
                    jobsData.jobs.forEach(job => {
                        if (job.conclusion === 'failure') {
                            console.log(`Job: ${job.name} (Step: ${job.steps.find(s => s.conclusion === 'failure')?.name || 'Unknown'})`);
                        }
                    });
                }
            }
        } else {
            console.log("No workflow runs found.");
        }
    } catch (error) {
        console.error("Error checking deployment:", error);
    }
}

checkDeploy();
