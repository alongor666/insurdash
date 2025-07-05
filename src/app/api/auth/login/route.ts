// src/app/api/auth/login/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // This route runs on the server, using environment variables set in Cloudflare.
    // This is secure and does not expose keys to the browser.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Securely authenticate against Supabase from the server-side.
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Forward the authentication error from Supabase to the client.
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }

    if (!data.session) {
        return NextResponse.json({ error: 'Authentication successful but no session was returned.' }, { status: 500 });
    }

    // On success, securely return the session data to the client.
    return NextResponse.json({ session: data.session });

  } catch (e) {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
