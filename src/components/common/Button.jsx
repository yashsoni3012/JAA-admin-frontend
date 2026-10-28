// import { cn } from '@/lib/utils';

// // Variants match the reference: outlined pills for row actions, gradient for primary.
// const VARIANTS = {
//   primary:
//     'bg-gradient-to-b from-[#2832A4] to-[#4F5DEC] text-white border-transparent shadow-lg shadow-blue-200 hover:opacity-90',
//   outline: 'border-[#2832A4] text-[#2832A4] bg-white hover:bg-blue-50',
//   success: 'border-emerald-400 text-emerald-500 bg-white hover:bg-emerald-50',
//   danger: 'border-red-400 text-red-500 bg-white hover:bg-red-50',
//   ghost: 'border-transparent text-slate-600 hover:bg-slate-100',
// };

// export default function Button({
//   variant = 'outline',
//   type = 'button',
//   loading = false,
//   disabled = false,
//   className,
//   children,
//   ...props
// }) {
//   return (
//     <button
//       type={type}
//       disabled={disabled || loading}
//       className={cn(
//         'inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition',
//         'disabled:cursor-not-allowed disabled:opacity-60',
//         VARIANTS[variant],
//         className
//       )}
//       {...props}
//     >
//       {loading && (
//         <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//       )}
//       {children}
//     </button>
//   );
// }

import { cn } from '@/lib/utils';

// Variants match the reference: outlined pills for row actions, gradient for primary.
const VARIANTS = {
  primary:
    'bg-gradient-to-b from-[#2832A4] to-[#4F5DEC] text-white border-transparent shadow-lg shadow-blue-200 hover:opacity-90',
  outline: 'border-[#2832A4] text-[#2832A4] bg-white hover:bg-blue-50',
  success: 'border-emerald-400 text-emerald-500 bg-white hover:bg-emerald-50',
  danger: 'border-red-400 text-red-500 bg-white hover:bg-red-50',
  ghost: 'border-transparent text-slate-600 hover:bg-slate-100',
};

export default function Button({
  variant = 'outline',
  type = 'button',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        // Medium sizing: px-6 py-2.5, 15px text, and gap-2.5
        'inline-flex items-center justify-center gap-2.5 rounded-full border px-6 py-2.5 text-[15px] font-semibold transition',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}