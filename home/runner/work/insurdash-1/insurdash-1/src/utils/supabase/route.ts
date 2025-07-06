
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/ssr';

export const createRouteClient = () => 
    createRouteHandlerClient({ cookies });
