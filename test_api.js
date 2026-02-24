const http = require('http');

async function login(username, password) {
    return new Promise((resolve) => {
        const data = JSON.stringify({ username, password });
        const req = http.request(
            'http://localhost:3000/api/auth/login',
            { method: 'POST', headers: { 'Content-Type': 'application/json' } },
            (res) => {
                let body = '';
                res.on('data', d => body += d);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(body).access_token);
                    } else {
                        resolve(null);
                    }
                });
            }
        );
        req.write(data);
        req.end();
    });
}

async function fetchSchedule(token) {
    return new Promise((resolve) => {
        const req = http.request(
            'http://localhost:3000/api/events/1/full-structure',
            { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } },
            (res) => {
                let body = '';
                res.on('data', d => body += d);
                res.on('end', () => resolve({ status: res.statusCode, body }));
            }
        );
        req.end();
    });
}

async function main() {
    const users = [
        { u: 'admin', p: 'admin123' },
        { u: 'vladislav.shirobokov@gmail.com', p: '123456' },
        { u: 'admin', p: 'Nhy67ujm' }
    ];
    for (const { u, p } of users) {
        const token = await login(u, p);
        if (token) {
            console.log('Logged in as', u);
            const res = await fetchSchedule(token);
            console.log('HTTP', res.status);
            console.log(res.body.substring(0, 1000));
            return;
        }
    }
    console.log('All login attempts failed');
}

main();
