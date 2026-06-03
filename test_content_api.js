const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
  const baseUrl = 'http://localhost:5000';
  const secret = 'your-secret-key';
  
  const token = jwt.sign({ id: 1, email: 'admin@music.com', role: 'admin' }, secret, { expiresIn: '7d' });
  console.log('Signed local token:', token);

  const headers = {
    Authorization: `Bearer ${token}`
  };

  console.log('Updating hero content...');
  const updateRes1 = await axios.post(`${baseUrl}/api/admin/content`, {
    section: 'hero',
    content: {
      title: 'Welcome to YoungTunz12',
      imageUrl: 'https://example.com/banner.jpg',
      subtitle: 'Discover the best artists'
    }
  }, { headers });
  console.log('Hero update response status:', updateRes1.status);

  console.log('Updating about content...');
  const updateRes2 = await axios.post(`${baseUrl}/api/admin/content`, {
    section: 'about',
    content: {
      title: '',
      imageUrl: '',
      subtitle: ''
    }
  }, { headers });
  console.log('About update response status:', updateRes2.status);

  console.log('Updating features content...');
  const updateRes3 = await axios.post(`${baseUrl}/api/admin/content`, {
    section: 'features',
    content: {
      title: '',
      imageUrl: '',
      subtitle: ''
    }
  }, { headers });
  console.log('Features update response status:', updateRes3.status);

  console.log('Fetching content...');
  const getRes = await axios.get(`${baseUrl}/api/admin/content`, { headers });
  console.log('Get response:', JSON.stringify(getRes.data, null, 2));
}

runTest().catch(err => {
  console.error('Error running test:', err);
  if (err.response) {
    console.error('Response data:', err.response.data);
  }
});
