const https = require('https');

function fetchSchedules() {
  return new Promise((resolve, reject) => {
    https.get('https://system.livaagency.com/api/schedules', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function updateSchedule(schedule) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(schedule);
    const req = https.request({
      hostname: 'system.livaagency.com',
      port: 443,
      path: `/api/schedules/${schedule.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => resolve(responseData));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  const schedules = await fetchSchedules();
  let count = 0;
  for (const s of schedules) {
    if (s.id && s.id.startsWith('auto_gen_cb_')) {
      const parts = s.id.split('_');
      // id format: auto_gen_cb_[timestamp]_[date]_[sessionid]
      const expectedDate = parts[4]; 
      if (expectedDate && expectedDate.match(/^\d{4}-\d{2}-\d{2}$/) && s.date !== expectedDate) {
        console.log(`Fixing schedule ${s.id}: ${s.date} -> ${expectedDate}`);
        s.date = expectedDate;
        await updateSchedule(s);
        count++;
      }
    }
  }
  console.log(`Fixed ${count} schedules.`);
}
run();
