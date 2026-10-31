/**
 * k6 load-test script for OneTownCity API
 * 
 * Run with: k6 run load-tests/api.js
 * Install k6: https://k6.io/docs/getting-started/installation/
 *
 * Stages:
 *   0→20 VUs over 1m   — ramp up
 *   20 VUs for 3m       — steady load
 *   20→0 VUs over 30s   — ramp down
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// ── Custom metrics ─────────────────────────────────────────────────────────────
const errorRate = new Rate("errors");
const apiDuration = new Trend("api_duration", true);

// ── Options ────────────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: "1m",  target: 20  },  // ramp-up
    { duration: "3m",  target: 20  },  // steady state
    { duration: "30s", target: 0   },  // ramp-down
  ],
  thresholds: {
    http_req_failed:    ["rate<0.01"],   // <1% errors
    http_req_duration:  ["p(95)<500"],   // 95th pct < 500ms
    api_duration:       ["p(99)<1000"],  // 99th pct < 1s
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

// ── Scenarios ──────────────────────────────────────────────────────────────────
export default function () {
  // Health check
  {
    const res = http.get(`${BASE_URL}/health`);
    const ok = check(res, {
      "health status 200": (r) => r.status === 200,
      "health body ok":    (r) => r.json("status") === "ok",
    });
    errorRate.add(!ok);
    apiDuration.add(res.timings.duration);
  }

  sleep(0.5);

  // Ping API
  {
    const res = http.get(`${BASE_URL}/api/v1/ping`, {
      headers: { "Content-Type": "application/json" },
    });
    const ok = check(res, {
      "ping status 200": (r) => r.status === 200,
    });
    errorRate.add(!ok);
    apiDuration.add(res.timings.duration);
  }

  sleep(1);
}

// ── Setup / Teardown ───────────────────────────────────────────────────────────
export function setup() {
  console.log(`Load testing against: ${BASE_URL}`);
  // Optionally: create test users, get auth tokens, etc.
}

export function teardown(data) {
  console.log("Load test complete.");
}
