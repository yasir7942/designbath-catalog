import { revalidatePath } from 'next/cache';
import { NextResponse } from "next/server";

const STRAPI_API_URL = process.env.NEXT_PUBLIC_ADMIN_BASE_URL + "";
const VALID_TOKEN = process.env.ADMIN_TOKEN;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle OPTIONS request
export async function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders });
}

// ✅ Handle GET request
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token") || "No token provided";

        revalidatePath('/', 'layout');

        return new Response(JSON.stringify({ message: "GET request received", token }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    } catch (error) {
        console.error("Error handling GET request:", error);
        return new Response(JSON.stringify({ error: "Error handling GET request" }), {
            status: 500,
            headers: corsHeaders,
        });
    }
}

// ✅ Handle POST request
export async function POST(req) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token") || "No token provided";

        revalidatePath('/', 'layout');

        return new Response(JSON.stringify({ message: "POST request received", token }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    } catch (error) {
        console.error("Error handling POST request:", error);
        return new Response(JSON.stringify({ error: "Error handling POST request" }), {
            status: 500,
            headers: corsHeaders,
        });
    }
}
