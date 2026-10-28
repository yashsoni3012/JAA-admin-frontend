import ComingSoon from '@/components/website/ComingSoon';

export const metadata = { title: 'Coming Soon' };

// Public homepage: no auth, no backend calls.
export default function HomePage() {
  return <ComingSoon />;
}
