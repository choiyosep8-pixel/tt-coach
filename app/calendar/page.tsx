import { redirect } from 'next/navigation';

export default async function CalendarRedirect({
  searchParams,
}: {
  searchParams: Promise<{ m?: string; d?: string }>;
}) {
  const { m, d } = await searchParams;
  const params = new URLSearchParams({ v: 'calendar' });
  if (m) params.set('m', m);
  if (d) params.set('d', d);
  redirect(`/sessions?${params.toString()}`);
}
