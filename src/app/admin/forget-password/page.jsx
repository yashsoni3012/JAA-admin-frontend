import ForgetPasswordForm from '@/components/auth/ForgetPasswordForm';
import { SITE } from '@/config/site';

export const metadata = {
  title: 'Forgot Password',
  description: 'Reset your JAA Admin account password.',
};

export default function ForgetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EEF1FF] p-4 sm:p-6 lg:p-8">
      <ForgetPasswordForm />
    </main>
  );
}
