import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function ForgotPasswordRootRedirect() {
  redirect(ROUTES.FORGET_PASSWORD);
}
