
import { UserRole } from '@/lib/types';

// Admin email(s) - email addresses that should always have admin privileges
export const ADMIN_EMAILS = ['felipe.souza@socialcriativo.com'];

// Map Supabase role to app role with admin check
export const mapUserRole = (role?: string, email?: string): UserRole => {
  console.log(`Mapping role: "${role}" for email: ${email}`);
  
  // Check if email is in admin list
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    console.log("Email is in admin list, returning ADMIN role");
    return UserRole.ADMIN;
  }
  
  // Otherwise check role as before - fixing the case sensitivity issue
  // and ensuring 'gestor' is properly mapped to MANAGER
  if (role) {
    const lowerRole = role.toLowerCase();
    console.log(`Lowercase role: ${lowerRole}`);
    
    switch (lowerRole) {
      case 'admin':
        console.log("Mapped to ADMIN");
        return UserRole.ADMIN;
      case 'gestor':
        console.log("Mapped to MANAGER");
        return UserRole.MANAGER;
      case 'manager': // Adding this case to handle if someone uses English term
        console.log("Mapped to MANAGER");
        return UserRole.MANAGER;
      default:
        console.log("Default mapped to SALESPERSON");
        return UserRole.SALESPERSON;
    }
  }
  
  console.log("No role provided, returning SALESPERSON as default");
  return UserRole.SALESPERSON;
};
