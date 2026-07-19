import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp-up to 50 concurrent users
    { duration: '20s', target: 50 },  // Hold at 50 users
    { duration: '10s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1000ms
    http_req_failed: ['rate<0.05'],   // Error rate must be less than 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin1@example.com';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'admin12345';

export default function () {
  // 1. Get CSRF Token
  const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);
  check(csrfRes, { 'got csrf token': (r) => r.status === 200 });
  
  let csrfToken = '';
  try {
    csrfToken = csrfRes.json('csrfToken');
  } catch(e) {
    console.error('Failed to parse CSRF token', e);
  }

  // 2. Login
  const loginPayload = {
    csrfToken: csrfToken,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    redirect: 'false',
    json: 'true'
  };

  const loginRes = http.post(`${BASE_URL}/api/auth/callback/credentials`, loginPayload);
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  // Check if we got a session token cookie
  let cookies = loginRes.cookies;
  let sessionToken = cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token'];
  
  // If no token was found, we might still be able to hit the page if the cookie was set globally in k6, but let's be explicit
  
  sleep(1);

  // 3. Hit Admin Dashboard
  const adminRes = http.get(`${BASE_URL}/admin`);
  
  check(adminRes, {
    'admin dashboard loaded (200)': (r) => r.status === 200,
    'admin dashboard latency < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  sleep(1);
}
