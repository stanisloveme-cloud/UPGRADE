const axios = require('axios');

async function checkEvent3() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post('http://localhost:3000/auth/login', { username: 'admin', password: 'admin123' });
        const token = loginRes.data.access_token;

        console.log('2. Fetching Event 3...');
        const res = await axios.get('http://localhost:3000/api/events/3/full-structure', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Status:', res.status);
        console.log('   Halls:', res.data.halls?.length);
    } catch (error) {
        console.log('Error:', error.message);
    }
}

checkEvent3();
