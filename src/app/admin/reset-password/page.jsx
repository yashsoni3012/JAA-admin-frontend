import { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import Loader from '@/components/common/Loader';

export const metadata = {
  title: 'Set New Password | JAA Admin',
  description: 'Set a new password for your JAA Admin account.',
};

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#F8FAFC] px-4 py-10 select-none">
      {/* 3D Left background artwork: login-bg-left.png */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 z-0 w-[240px] sm:w-[280px] md:w-[320px] lg:w-[360px] max-w-[35vw]"
      >
        <img
          src="/uploads/login-bg-left.png"
          alt=""
          className="w-full h-auto object-contain"
        />
      </div>

      {/* 3D Right background artwork: login-bg-right.png */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 right-0 z-0 w-[230px] sm:w-[270px] md:w-[310px] lg:w-[350px] max-w-[35vw]"
      >
        <img
          src="/uploads/login-bg-right.png"
          alt=""
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Main Content: Logo + Card */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <Suspense fallback={<Loader label="Loading" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
