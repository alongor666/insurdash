
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Cookie is automatically set by the library
  return NextResponse.json({ ok: true });
}
