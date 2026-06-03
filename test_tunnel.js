const axios = require('axios');

async function test() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBtdXNpYy5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Nzk2ODY2NzcsImV4cCI6MTc4MDI5MTQ3N30.8XVOiutXJj5nheBCMiUashMoYhzQFgAASFIOdA4z9w8";
  const headers = { Authorization: `Bearer ${token}` };

  const urls = [
    'http://localhost:5000',
    'https://nrzzqsnw-3000.inc1.devtunnels.ms'
  ];

  for (const url of urls) {
    console.log(`\nTesting ${url}...`);
    try {
      const getRes = await axios.get(`${url}/api/admin/artists`, { headers });
      console.log(`GET artists status: ${getRes.status}`);

      // Try PUT to artist 3
      const putRes = await axios.put(`${url}/api/admin/artists/3`, {
        label: 'test_label',
        artistLabelName: 'test_artist_label',
        bio: 'test_bio'
      }, { headers });
      console.log(`PUT artist 3 status: ${putRes.status}`);
      console.log(`PUT response:`, JSON.stringify(putRes.data));
    } catch (err) {
      console.error(`Error for ${url}:`, err.message);
      if (err.response) {
        console.error(`Response status: ${err.response.status}`);
        console.error(`Response data:`, err.response.data);
      }
    }
  }
}

test();
