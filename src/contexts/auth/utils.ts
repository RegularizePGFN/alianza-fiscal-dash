
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
  
  // Check if email is in admin list
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    console.log("Email is in admin list, returning ADMIN role");
    return UserRole.ADMIN;
  }
  
  // Map database roles correctly
  if (role) {
    const lowerRole = role.toLowerCase();
    
    // Check for admin role (case insensitive)
    if (lowerRole === 'admin') {
      console.log("Role is explicitly admin, returning ADMIN");
      return UserRole.ADMIN;
    }
    
    // Map vendedor to SALESPERSON
    if (lowerRole === 'vendedor') {
      console.log("Role is vendedor, returning SALESPERSON");
      return UserRole.SALESPERSON;
    }
  }
  
  // Default to SALESPERSON for any other role or no role
  console.log("No matching role found, returning SALESPERSON as default");
  return UserRole.SALESPERSON;
};
