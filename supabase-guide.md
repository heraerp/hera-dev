# Supabase Usage Guide for Next.js (Universal Client Setup)

This project uses Supabase in both client and server contexts. Follow these patterns for consistent, secure, and optimal usage.

---

## ✅ Client-Side Usage (Client Components)

### Use the browser Supabase client:
Located in `lib/supabase.ts`

```ts
// lib/supabase.ts
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
How to use it:
ts
Copy
Edit
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase.from('table_name').insert([{ ... }]);
Use in useEffect, handleSubmit, or any React client code

Does not manage cookies or auth automatically in SSR

✅ Server-Side Usage (Server Components or API Routes)
Use the server-aware Supabase client:
Located in lib/supabase/server.ts

ts
Copy
Edit
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors in Server Components
          }
        },
      },
    }
  );
}
Example usage in server route:
ts
Copy
Edit
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const body = await req.json()

  const { error } = await supabase.from('clients').insert([body])

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
❗ Key Rules
Always use the supabase instance from lib/supabase.ts in components with use client

Always use createClient() from lib/supabase/server.ts in API routes or server components

Never call createClient() inside client components

Keep Supabase URL and anon key in .env:

env
Copy
Edit
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
