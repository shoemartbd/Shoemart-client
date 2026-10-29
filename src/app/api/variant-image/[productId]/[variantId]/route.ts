import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string; variantId: string }> }
) {
  try {
    const { productId, variantId } = await params;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized – no access token" },
        { status: 401 }
      );
    }

    // Read the multipart/form-data that the client sent
    const formData = await req.formData();

    const backendRes = await fetch(
      `${BASE_API_URL}/products/${productId}/variants/${variantId}/image`,
      {
        method: "PATCH",
        headers: {
          // Forward auth cookies to the Express backend
          Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken ?? ""}`,
        },
        body: formData,
      }
    );

    const result = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, message: result.message || "Backend error" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("[API /variant-image] Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
