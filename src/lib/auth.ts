import { cookies } from "next/headers";

/**
 * Holt den Google Access Token aus den Cookies
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("google_access_token")?.value || null;
}

/**
 * Holt den Google Refresh Token aus den Cookies
 */
export async function getGoogleRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("google_refresh_token")?.value || null;
}

/**
 * Refresht den Access Token wenn nötig
 */
export async function refreshGoogleAccessToken(): Promise<string | null> {
  const refreshToken = await getGoogleRefreshToken();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.APP_URL}/api/auth/google/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    return null;
  }
}

/**
 * Prüft ob der User Google OAuth autorisiert hat
 */
export async function isGoogleAuthorized(): Promise<boolean> {
  const accessToken = await getGoogleAccessToken();
  return !!accessToken;
}

