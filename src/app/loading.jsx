import Loader from '@/components/common/Loader';

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface">
      <Loader label="Loading" />
    </main>
  );
}
