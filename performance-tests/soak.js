import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 20 },
        { duration: '10m', target: 20 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],
        http_req_duration: ['p(95)<1200'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

export default function () {
    const res = http.get(`${BASE_URL}/incidents?page=1&limit=10`);

    check(res, {
        'soak status is 200': (r) => r.status === 200,
    });

    sleep(1);
}