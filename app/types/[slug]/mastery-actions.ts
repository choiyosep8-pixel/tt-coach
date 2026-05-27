'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function saveMastery(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const type_id = String(formData.get('type_id') ?? '');
  const slug = String(formData.get('slug') ?? '');
  const pct = Math.max(0, Math.min(100, Number(formData.get('mastery_percent') ?? 0)));
  const partnersRaw = String(formData.get('partners') ?? '');
  const partners = partnersRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);

  if (!type_id) return;
  await supabase
    .from('type_mastery')
    .upsert(
      {
        user_id: user.id,
        type_id,
        mastery_percent: pct,
        partners,
      },
      { onConflict: 'user_id,type_id' }
    );

  revalidatePath(`/types/${slug}`);
  revalidatePath('/types');
  revalidatePath('/');
}
