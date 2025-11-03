import { NextRequest, NextResponse } from "next/server";

/**
 * GET: Leitet zur Google OAuth Consent-Seite weiter
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Google OAuth credentials not configured" },
      { status: 500 }
    );
  }

  const scope = "https://www.googleapis.com/auth/photoslibrary.appendonly";
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", scope);
  authUrl.searchParams.append("access_type", "offline");
  authUrl.searchParams.append("prompt", "consent");

  return NextResponse.redirect(authUrl.toString());
}

