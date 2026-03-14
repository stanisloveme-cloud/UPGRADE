const axios = require('axios');

async function checkEvents() {
    try {
        const res = await axios.get('http://localhost:3000/api/events');
        console.dir(res.data, { depth: null });
    } catch(err) {
        console.error(err.message);
    }
}
checkEvents();
