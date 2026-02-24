// test-api.js
const axios = require('axios');

async function run() {
    try {
        console.log("Checking API halls...");
        const resHalls = await axios.get('http://localhost:3000/api/halls');
        console.log(resHalls.data);

        console.log("Checking API event 1 full structure...");
        const resEv = await axios.get('http://localhost:3000/api/events/1/full-structure');
        console.log(resEv.data);
    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) {
            console.error("Data:", e.response.data);
        }
    }
}
run();
