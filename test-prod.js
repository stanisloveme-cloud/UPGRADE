const http = require('http');

async function testFetch(username, password) {
    try {
        console.log(`\nTrying ${username}:${password}...`);

        // Use dynamically imported fetch (since Node 18 has native fetch)
        const loginRes = await fetch("http://devupgrade.space4you.ru/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        console.log(`Login status: ${loginRes.status}`);
        const loginText = await loginRes.text();

        if (loginRes.status !== 200 && loginRes.status !== 201) {
            console.log(`Login failed text: ${loginText}`);
            return;
        }

        const token = JSON.parse(loginText).access_token;
        if (!token) {
            console.log("No access token found in response");
            return;
        }

        console.log("Login successful, fetching events...");

        const structRes = await fetch("http://devupgrade.space4you.ru/api/events/1/full-structure", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        console.log(`Events status: ${structRes.status}`);
        const text = await structRes.text();
        console.log(`Events response: ${text.substring(0, 500)}...`);

        console.log("Fetching halls to see if they exist...");
        const hallRes = await fetch("http://devupgrade.space4you.ru/api/halls", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log(`Halls status: ${hallRes.status}`);
        console.log(`Halls response: ${await hallRes.text()}`);

    } catch (e) {
        console.log('Error:', e);
    }
}

async function run() {
    await testFetch("admin", "admin123");
    await testFetch("admin", "Nhy67ujm");
    await testFetch("vladislav.shirobokov@gmail.com", "123456");
}

run();
