import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

// One canonical dashboard route: /admin always forwards to /admin/dashboard.
export default function AdminIndexPage() {
  redirect(ROUTES.DASHBOARD);
}
