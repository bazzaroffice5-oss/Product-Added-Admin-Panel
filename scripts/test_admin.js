const http = require('http');

const PORT = 3001;

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: body,
          json: () => {
            try {
              return JSON.parse(body);
            } catch {
              return null;
            }
          },
        });
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('STANDALONE ADMIN PANEL E2E TEST SUITE (PORT ' + PORT + ')');
  console.log('====================================================\n');

  let testsPassed = 0;
  let testsTotal = 0;

  function assert(condition, testName) {
    testsTotal++;
    if (condition) {
      testsPassed++;
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}`);
    }
  }

  const TEST_PASSWORD = process.env.ADMIN_PASSWORD_SALES4 || process.env.ADMIN_PASSWORD || 'OfficeBazzar@2026!';

  // 1. Unauthenticated Protection
  console.log('--- Test 1: Unauthorized Route Protection ---');
  const unauthApi = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/products',
    method: 'GET',
  });
  assert(unauthApi.statusCode === 401, 'Protected /api/products blocks unauthenticated with 401');

  const unauthPage = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/dashboard',
    method: 'GET',
  });
  assert(
    unauthPage.statusCode === 307 || unauthPage.statusCode === 302 || unauthPage.headers.location?.includes('/login'),
    'Unauthenticated /dashboard redirects to /login'
  );

  // 2. Login Page
  console.log('\n--- Test 2: Login Page Stability ---');
  const loginRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/login',
    method: 'GET',
  });
  assert(loginRes.statusCode === 200, 'Login page loads with 200 OK');

  // 3. Strict Email Allowlist
  console.log('\n--- Test 3: Strict 2-Email Allowlist ---');
  const disallowedRes = await request(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({
      email: 'unauthorized@example.com',
      password: TEST_PASSWORD,
    })
  );
  assert(disallowedRes.statusCode === 401, 'Disallowed email is rejected with 401');

  // Login as sales4@officebazzar.com
  const loginRes1 = await request(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({
      email: 'sales4@officebazzar.com',
      password: TEST_PASSWORD,
    })
  );
  assert(loginRes1.statusCode === 200, 'Authorized email sales4@officebazzar.com logs in successfully');

  const cookieHeader = loginRes1.headers['set-cookie'];
  const sessionCookie = cookieHeader ? cookieHeader[0].split(';')[0] : '';
  assert(sessionCookie.startsWith('ob_admin_session='), 'Admin session cookie issued');

  // Verify /api/auth/me
  const meRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Cookie: sessionCookie },
  });
  const meJson = meRes.json();
  assert(meJson?.authenticated === true && meJson?.user?.email === 'sales4@officebazzar.com', 'Session verification confirms sales4 identity');

  // Login as marketing@officebazzar.com
  const loginRes2 = await request(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({
      email: 'marketing@officebazzar.com',
      password: TEST_PASSWORD,
    })
  );
  assert(loginRes2.statusCode === 200, 'Authorized email marketing@officebazzar.com logs in successfully');

  // 4. Product Creation
  console.log('\n--- Test 4: Product Creation & Editing ---');
  const testSku = 'TEST-STANDALONE-' + Math.floor(10000 + Math.random() * 90000);
  const createRes = await request(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
    },
    JSON.stringify({
      name: 'Standalone Admin Test Product',
      sku: testSku,
      images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=800'],
      packSize: 'Box of 100',
      categoryId: 'office-supplies-stationery',
      brandId: 'officebazzar',
      description: 'Created through standalone admin panel.',
      isActive: true,
    })
  );
  const createJson = createRes.json();
  assert(createRes.statusCode === 200 && createJson?.success === true, 'Product created successfully');
  const createdId = createJson?.product?.id;

  // 5. Toggle Publish Status
  if (createdId) {
    const toggleRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/products/' + createdId,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
      },
      JSON.stringify({ isActive: false })
    );
    assert(toggleRes.statusCode === 200, 'Product unpublished to draft successfully');

    // 6. Delete Product
    const delRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/products/' + createdId,
      method: 'DELETE',
      headers: { Cookie: sessionCookie },
    });
    assert(delRes.statusCode === 200, 'Product deleted successfully');
  }

  // 7. Logout
  console.log('\n--- Test 5: Logout ---');
  const logoutRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/logout',
    method: 'POST',
    headers: { Cookie: sessionCookie },
  });
  assert(logoutRes.statusCode === 200, 'Logout succeeds with 200 OK');

  console.log('\n====================================================');
  console.log(`STANDALONE ADMIN RESULTS: ${testsPassed} / ${testsTotal} PASSED`);
  console.log('====================================================\n');
}

runTests().catch(console.error);
