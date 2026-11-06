import { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Skeleton } from '@/components/common/Skeleton';
import Footer from '@/components/common/Footer';

export const metadata = {
  title: 'Set New Password | JAA Admin',
  description: 'Set a new password for your JAA Admin account.',
};

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#F8FAFC] px-4 py-6 select-none">
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

      {/* Top spacer */}
      <div className="h-2" aria-hidden="true" />

      {/* Main Content: Logo + Card */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center my-auto">
        <Suspense
          fallback={
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card space-y-4">
              <Skeleton className="h-6 w-36 mx-auto rounded-lg" />
              <Skeleton className="h-10 w-full rounded-2xl" />
              <Skeleton className="h-10 w-full rounded-2xl" />
              <Skeleton className="h-11 w-full rounded-full" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>

      {/* Footer */}
      <Footer className="relative z-10 pt-4" />
    </div>
  );
}
