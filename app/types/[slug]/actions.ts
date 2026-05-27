'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function addStrategy(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const slug = String(formData.get('slug') ?? '');
  const payload = {
    user_id: user.id,
    type_id: String(formData.get('type_id') ?? ''),
    kind: String(formData.get('kind') ?? 'strategy'),
    title: String(formData.get('title') ?? '').trim(),
    body: String(formData.get('body') ?? '').trim() || null,
    source_url: String(formData.get('source_url') ?? '').trim() || null,
  };
  if (!payload.title || !payload.type_id) return;

  await supabase.from('counter_strategies').insert(payload);
  revalidatePath(`/types/${slug}`);
}

export async function deleteStrategy(formData: FormData) {
  const supabase = await createClient();
  const slug = String(formData.get('slug') ?? '');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await supabase.from('counter_strategies').delete().eq('id', id);
  revalidatePath(`/types/${slug}`);
}
