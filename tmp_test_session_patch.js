const axios = require('axios');
(async () => {
    try {
        console.log('Sending PATCH to /api/sessions/42 to update startTime/endTime...');
        const res = await axios.patch('http://localhost:3000/api/sessions/42', {
            startTime: '10:05',
            endTime: '11:05',
            // ignoring optimistic concurrency if not provided
        });
        console.log('Success! New times:', res.data.startTime, res.data.endTime);
        const refetched = await axios.get('http://localhost:3000/api/sessions/42');
        console.log('Refetched times:', refetched.data.startTime, refetched.data.endTime);
    } catch(err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
})();
