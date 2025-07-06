
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/ssr';

export const createServerClient = () =>
  createServerComponentClient({ cookies });
