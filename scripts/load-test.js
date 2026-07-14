import http from 'k6/http';
import { check, sleep } from 'k6';

// Simulate 1000 concurrent students taking an exam
export const options = {
  stages: [
    { duration: '30s', target: 500 },  // Ramp-up to 500 users over 30s
    { duration: '1m', target: 1000 },  // Ramp-up to 1000 users and hold for 1m
    { duration: '30s', target: 0 },    // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

export default function () {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
  
  // 1. User hits the storefront
  let res = http.get(`${BASE_URL}/store`);
  check(res, { 'storefront status is 200': (r) => r.status === 200 });
  sleep(1);

  // 2. Mock API hit (autosave) - requires auth but we check rate limiting/latency
  const payload = JSON.stringify({
    questionProgressId: 'mock-id',
    selectedOptionId: 'mock-option',
    isCorrect: true,
    timeTakenSec: 45
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      // 'Cookie': 'next-auth.session-token=mock-token' // In real test, provide auth token
    },
  };

  res = http.post(`${BASE_URL}/api/test-sessions/mock-session/autosave`, payload, params);
  
  // We expect 401 or 429 if no auth/rate limited, but we just check latency here
  check(res, { 
    'autosave latency < 200ms': (r) => r.timings.duration < 200 
  });
  
  sleep(1);
}
