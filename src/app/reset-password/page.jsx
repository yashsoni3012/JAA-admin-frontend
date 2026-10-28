import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function ResetPasswordRootRedirect({ searchParams }) {
  const token = searchParams?.token || '';
  const email = searchParams?.email || '';

  const queryParts = [];
  if (token) queryParts.push(`token=${encodeURIComponent(token)}`);
  if (email) queryParts.push(`email=${encodeURIComponent(email)}`);

  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  redirect(`${ROUTES.RESET_PASSWORD}${query}`);
}
