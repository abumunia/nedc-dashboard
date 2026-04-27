// netlify/functions/save-data.js
// Saves parsed dashboard JSON to Netlify Blobs (persistent storage)
// Called by admin after uploading Excel file

import { getStore } from "@netlify/blobs";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "nedc2026";
const BLOB_KEY = "dashboard-data";

export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Verify admin password
    if (body.adminPassword !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Validate data has required fields
    if (!body.data || !body.data.saidi || !body.data.period) {
      return new Response(
        JSON.stringify({ error: "Invalid data format — missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Store to Netlify Blobs
    const store = getStore("nedc-dashboard");
    await store.setJSON(BLOB_KEY, {
      data: body.data,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin",
      period: body.data.period,
      fileName: body.data.fileName || "unknown",
    });

    return new Response(
      JSON.stringify({
        success: true,
        period: body.data.period,
        updatedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("save-data error:", err);
    return new Response(
      JSON.stringify({ error: "Server error: " + err.message }),
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
  path: "/api/save-data",
};
