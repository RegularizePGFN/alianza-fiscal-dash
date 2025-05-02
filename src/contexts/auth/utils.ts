import { UserRole } from '@/lib/types';

// Admin email(s) - email addresses that should always have admin privileges
export const ADMIN_EMAILS = ['felipe.souza@socialcriativo.com'];

// Map Supabase role to app role with admin check
export const mapUserRole = (role?: string, email?: string): UserRole => {
  // Check if email is in admin list
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    return UserRole.ADMIN;
  }
  
  // Otherwise check role as before
  switch (role?.toLowerCase()) {
    case 'admin':
      return UserRole.ADMIN;
    case 'gestor':
      return UserRole.MANAGER;
    default:
      return UserRole.SALESPERSON;
  }
};
