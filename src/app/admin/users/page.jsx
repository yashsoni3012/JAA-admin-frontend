import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

// The reference design manages people under "Members", so /admin/users forwards there.
export default function UsersRedirectPage() {
  redirect(ROUTES.MEMBERS);
}
