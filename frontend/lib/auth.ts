export interface User {
  username: string;
  role: "owner" | "user";
}

const OWNER_USERNAME = "admin";
const OWNER_PASSWORD = "admin";

export function verifyCredentials(username: string, password: string): boolean {
  if (username === OWNER_USERNAME && password === OWNER_PASSWORD) {
    return true;
  }
  return false;
}

export function getSessionFromRequest(request: {
  cookies: { get: (name: string) => { value: string } | undefined };
}): User | null {
  const username = request.cookies.get("username")?.value;
  const role = request.cookies.get("role")?.value as
    | "owner"
    | "user"
    | undefined;

  if (username && role) {
    return { username, role };
  }
  return null;
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  };
}
