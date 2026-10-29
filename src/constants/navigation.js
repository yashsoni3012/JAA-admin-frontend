import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Siren,
  UsersRound,
  Image,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

// Sidebar items, in the same order as the reference design.
export const SIDEBAR_NAV = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Members', href: ROUTES.MEMBERS, icon: Users },
  { label: 'Events', href: ROUTES.EVENTS, icon: CalendarDays },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Leads', href: '/admin/leads', icon: TrendingUp },
  { label: 'Complaints', href: ROUTES.COMPLAINTS, icon: AlertCircle },
  // { label: 'SOS', href: '/admin/sos', icon: Siren },
  { label: 'Committee', href: '/admin/committee', icon: UsersRound },
  { label: 'Posts', href: '/admin/posts', icon: Image },
];
