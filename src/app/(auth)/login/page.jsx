import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Loader from '@/components/common/Loader';

export const metadata = { title: 'Sign in' };

// useSearchParams needs a Suspense boundary during static rendering.
export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-100 opacity-70 blur-3xl" />
      <div className="relative w-full flex justify-center">
        <Suspense fallback={<Loader label="Loading" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
