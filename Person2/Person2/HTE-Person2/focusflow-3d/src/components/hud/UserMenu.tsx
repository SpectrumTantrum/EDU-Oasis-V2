'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  if (!email) return null;

  const truncated = email.length > 20 ? email.slice(0, 17) + '...' : email;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/60 font-mono">{truncated}</span>
      <form action="/auth/signout" method="post">
        <Button
          type="submit"
          variant="ghost"
          className="text-[10px] text-white/50 hover:text-white h-5 px-1.5 font-mono"
        >
          Sign Out
        </Button>
      </form>
    </div>
  );
}
