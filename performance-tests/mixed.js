import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '1m', target: 40 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.10'],
        http_req_duration: ['p(95)<1500'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';
const TOKEN = __ENV.TOKEN || '';

const TYPES = ['accident', 'delay', 'hazard', 'weather'];
const SEVERITIES = ['low', 'medium', 'high'];

export default function () {
    const headers = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
        },
    };

    const res1 = http.get(`${BASE_URL}/incidents?page=1&limit=10`);
    check(res1, {
        'GET incidents ok': (r) => r.status === 200,
    });

    const res2 = http.get(`${BASE_URL}/checkpoints`);
    check(res2, {
        'GET checkpoints ok': (r) => r.status === 200,
    });

    const type = TYPES[__ITER % TYPES.length];
    const severity = SEVERITIES[__ITER % SEVERITIES.length];
    const latitude = 32.30 + ((__VU * 5 + __ITER) % 100) * 0.002;
    const longitude = 35.30 + ((__VU * 7 + __ITER) % 100) * 0.002;

    const payload = JSON.stringify({
        type,
        severity,
        description: `mixed test ${type} ${__VU}-${__ITER}`,
        latitude,
        longitude,
        checkpoint_id: 2,
    });

    const res3 = http.post(`${BASE_URL}/incidents`, payload, headers);
    check(res3, {
        'POST incident ok': (r) => r.status === 200 || r.status === 201,
    });

    sleep(1);
}