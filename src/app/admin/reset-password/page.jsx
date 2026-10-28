import { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import Loader from '@/components/common/Loader';

export const metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your JAA Admin account.',
};

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EEF1FF] p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<Loader label="Loading reset form..." />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
