import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function ForgetPasswordRootRedirect() {
  redirect(ROUTES.FORGET_PASSWORD);
}
