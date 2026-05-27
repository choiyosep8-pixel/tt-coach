import { redirect } from 'next/navigation';

export default async function CalendarRedirect({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const params = new URLSearchParams({ v: 'month' });
  if (m) params.set('m', m);
  redirect(`/sessions?${params.toString()}`);
}
