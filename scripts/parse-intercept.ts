import * as fs from 'fs';
import * as path from 'path';

function run() {
    const dataPath = path.resolve(__dirname, '../data/intercepted_session_api.json');
    if (!fs.existsSync(dataPath)) {
         console.log('No intercepted data found.');
         return;
    }
    const arr = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`Analyzing ${arr.length} intercepted requests...`);
    
    arr.forEach((req: any, i: number) => {
        console.log(`\n[${i}] URL: ${req.url}`);
        if(req.data) {
            const d = req.data;
            console.log('   Keys:', Object.keys(d));
            if(d.props) console.log('   Props keys:', Object.keys(d.props));
            
            let hasSpeakers = false;
            let speakersLen = 0;
            if (d.speakers) { hasSpeakers = true; speakersLen = d.speakers.length; }
            if (d.props && d.props.speakers) { hasSpeakers = true; speakersLen = d.props.speakers.length; }
            if (d.users) { hasSpeakers = true; speakersLen = d.users.length; }
            if (d.props && d.props.users) { hasSpeakers = true; speakersLen = d.props.users.length; }
            
            if(hasSpeakers) {
                 console.log(`   🔥 HAS SPEAKERS/USERS array! Length: ${speakersLen}`);
                 if (d.props && d.props.speakers && d.props.speakers.length > 0) {
                     console.log('   Sample speaker:', d.props.speakers[0].first_name, d.props.speakers[0].last_name);
                 }
            }
        }
    });
}

run();
