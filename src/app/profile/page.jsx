import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function ProfileRedirectPage() {
  redirect(ROUTES.PROFILE);
}

