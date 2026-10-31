import { SITE } from '@/config/site';
import { cn } from '@/lib/utils';

export default function Logo({ compact = false, className }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative overflow-hidden flex items-center justify-center transition-all duration-300',
          compact ? 'h-10 w-10' : 'h-[52px] md:h-[60px] w-[191px]'
        )}
      >
        <img
          src="/uploads/jaa-logo-1793261989412.png"
          alt={SITE.name || 'Jewellers Association Ahmedabad'}
          className={cn(
            'max-w-none transition-all duration-300',
            compact
              ? 'h-10 w-10 object-contain'
              : 'w-[191px] h-[161px] object-contain'
          )}
        />
      </div>
      <span className="sr-only">{SITE.name}</span>
    </div>
  );
}
