import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 15 },
        { duration: '1m', target: 30 },
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
    const type = TYPES[__ITER % TYPES.length];
    const severity = SEVERITIES[__ITER % SEVERITIES.length];

    const latitude = 32.10 + ((__VU * 7 + __ITER) % 120) * 0.002;
    const longitude = 35.10 + ((__VU * 11 + __ITER) % 120) * 0.002;

    const payload = JSON.stringify({
        type,
        severity,
        description: `k6 generated ${type} ${__VU}-${__ITER}`,
        latitude,
        longitude,
        checkpoint_id: 2,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
        },
    };

    const res = http.post(`${BASE_URL}/incidents`, payload, params);

    check(res, {
        'write-heavy status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    });

    sleep(1);
}