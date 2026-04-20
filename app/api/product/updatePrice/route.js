import { NextResponse } from "next/server";

export const runtime = "nodejs";

const STRAPI_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const API_TOKEN = process.env.API_TOKEN || "";

export async function POST(req) {
    try {
        if (!STRAPI_BASE) {
            return NextResponse.json(
                { ok: false, error: "Missing NEXT_PUBLIC_API_BASE_URL in environment." },
                { status: 500 }
            );
        }

        if (!API_TOKEN) {
            return NextResponse.json(
                { ok: false, error: "Missing API_TOKEN in environment." },
                { status: 500 }
            );
        }

        const body = await req.json();

        const documentId = String(body?.documentId || "").trim();
        const hasPrice = body?.price !== undefined;
        const hasStock = body?.stock !== undefined;

        if (!documentId) {
            return NextResponse.json(
                { ok: false, error: "documentId is required." },
                { status: 400 }
            );
        }

        if (!hasPrice && !hasStock) {
            return NextResponse.json(
                { ok: false, error: "Either price or stock is required." },
                { status: 400 }
            );
        }

        const updateData = {};

        if (hasPrice) {
            const numericPrice = Number(body.price);

            if (body.price === null || body.price === "" || Number.isNaN(numericPrice)) {
                return NextResponse.json(
                    { ok: false, error: "Valid price is required." },
                    { status: 400 }
                );
            }

            updateData.price = String(numericPrice);
        }

        if (hasStock) {
            const numericStock = Number(body.stock);

            if (body.stock === null || body.stock === "" || Number.isNaN(numericStock)) {
                return NextResponse.json(
                    { ok: false, error: "Valid stock is required." },
                    { status: 400 }
                );
            }

            updateData.stock = numericStock;
        }

        const res = await fetch(`${STRAPI_BASE}products/${documentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_TOKEN}`,
            },
            body: JSON.stringify({
                data: updateData,
            }),
            cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                {
                    ok: false,
                    error:
                        data?.error?.message ||
                        data?.message ||
                        "Failed to update product.",
                    raw: data,
                },
                { status: res.status }
            );
        }

        const updatedProduct = data?.data || null;

        return NextResponse.json({
            ok: true,
            updatedAt: updatedProduct?.updatedAt || null,
            product: updatedProduct,
        });
    } catch (error) {
        console.error("update product route error:", error);

        return NextResponse.json(
            {
                ok: false,
                error: error?.message || "Unexpected server error.",
            },
            { status: 500 }
        );
    }
}