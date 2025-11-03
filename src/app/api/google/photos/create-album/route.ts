import { NextRequest, NextResponse } from "next/server";
import { createGooglePhotosAlbum } from "@/lib/photos";

export async function POST(req: NextRequest) {
  try {
    const { title, accessToken } = await req.json();

    if (!title || !accessToken) {
      return NextResponse.json(
        { error: "Title and access token are required" },
        { status: 400 }
      );
    }

    const album = await createGooglePhotosAlbum(title, accessToken);

    return NextResponse.json(album);
  } catch (error) {
    console.error("Create album error:", error);
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    );
  }
}

