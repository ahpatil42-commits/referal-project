const http = require('http');

function checkPage(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          statusCode: res.statusCode,
          bodySnippet: data.substring(0, 500)
        });
      });
    }).on('error', (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function runTests() {
  console.log("Waiting for server to be ready on port 3000...");
  let isReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      await new Promise(r => setTimeout(r, 1000));
      const res = await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000', resolve);
        req.on('error', reject);
      });
      isReady = true;
      break;
    } catch (e) {
      // ignore
    }
  }

  if (!isReady) {
    console.log("Server did not start in time.");
    return;
  }

  console.log("Server is ready. Testing endpoints...");
  
  const results = await Promise.all([
    checkPage('/'),
    checkPage('/pricing'),
    checkPage('/register'),
    checkPage('/api/health') // if exists
  ]);

  console.log("\n--- TEST RESULTS ---");
  for (const res of results) {
    if (res.error) {
      console.log(`${res.path}: ERROR - ${res.error}`);
    } else {
      console.log(`${res.path}: ${res.statusCode}`);
      if (res.statusCode >= 400) {
        console.log(`  Preview: ${res.bodySnippet}`);
      }
    }
  }
}

runTests();
