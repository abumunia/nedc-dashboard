// netlify/functions/load-data.js
// Returns the latest saved dashboard JSON to all visitors

import { getStore } from "@netlify/blobs";

const BLOB_KEY = "dashboard-data";

export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const store = getStore("nedc-dashboard");
    const stored = await store.get(BLOB_KEY, { type: "json" });

    if (!stored) {
      // No data uploaded yet — return 404 so client uses built-in demo data
      return new Response(
        JSON.stringify({ error: "No data uploaded yet", useDemo: true }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            // Short cache so visitors get fresh data quickly after admin update
            "Cache-Control": "public, max-age=30",
          },
        }
      );
    }

    return new Response(JSON.stringify(stored), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        // Cache 30 seconds — fresh enough, reduces function calls
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("load-data error:", err);
    return new Response(
      JSON.stringify({ error: "Server error", useDemo: true }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};

export const config = {
  path: "/api/load-data",
};
