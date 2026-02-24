const http = require('http');

http.get('http://devupgrade.space4you.ru/api/events/1/full-structure', (res) => {
    let data = '';
    res.on('data', (d) => data += d);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Event 1 Full Structure:');
            console.log('ID:', json.id);
            console.log('Name:', json.name);
            console.log('Halls count:', json.halls ? json.halls.length : 0);
            if (json.halls && json.halls.length > 0) {
                console.log('First Hall ID:', json.halls[0].id, 'eventId:', json.halls[0].eventId);
            }
        } catch (e) {
            console.log('Not JSON structure:', data.substring(0, 100));
        }
    });
}).on('error', console.error);

http.get('http://devupgrade.space4you.ru/api/halls', (res) => {
    let data = '';
    res.on('data', (d) => data += d);
    res.on('end', () => {
        try {
            const halls = JSON.parse(data);
            console.log('Total Halls in DB:', halls.length);
            const ev1Halls = halls.filter(h => h.eventId === 1 || h.eventId === "1");
            console.log('Halls with eventId=1:', ev1Halls.length);
        } catch (e) {
            console.log('Not JSON halls:', data.substring(0, 100));
        }
    });
}).on('error', console.error);
