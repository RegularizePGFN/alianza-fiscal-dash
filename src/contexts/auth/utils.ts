
import { UserRole } from '@/lib/types';

// Admin email(s) - email addresses that should always have admin privileges
export const ADMIN_EMAILS = [
  'felipe.souza@socialcriativo.com',
  'gustavo.felipe@aliancafiscal.com',
  'vanessa@aliancafiscal.com',   
  'brenda@aliancafiscal.com'
];

// Map Supabase role to app role with admin check
export const mapUserRole = (role?: string, email?: string): UserRole => {
  console.log(`Mapping role: "${role}" for email: ${email}`);
  
  // First priority: If role is explicitly set in database, use it
  if (role) {
    const lowerRole = role.toLowerCase();
    
    // Check for admin role (case insensitive)
    if (lowerRole === 'admin' || lowerRole === 'administrador') {
      console.log("Role is explicitly admin, returning ADMIN");
      return UserRole.ADMIN;
    }
    
    // Check for salesperson role (case insensitive)
    if (lowerRole === 'vendedor' || lowerRole === 'salesperson') {
      console.log("Role is explicitly vendedor/salesperson, returning SALESPERSON");
      return UserRole.SALESPERSON;
    }
  }
  
  // Second priority: Check if email is in admin list (only if no explicit role is set)
  if (!role && email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    console.log("No role set but email is in admin list, returning ADMIN role");
    return UserRole.ADMIN;
  }
  
  // Default to SALESPERSON for any other role or no role
  console.log("No matching role found, returning SALESPERSON as default");
  return UserRole.SALESPERSON;
};
