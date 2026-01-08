import { NextRequest, NextResponse } from "next/server";
import { getCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 3) {
      return NextResponse.json(
        { error: "Password must be at least 3 characters" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true, username });
    const cookieOptions = getCookieOptions();

    response.cookies.set("username", username, cookieOptions);
    response.cookies.set("role", "user", cookieOptions);

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
