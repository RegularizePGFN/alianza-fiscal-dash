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
  if (role) {
    const lowerRole = role.toLowerCase();
    console.log(`Lowercase role: ${lowerRole}`);
    
    // Only return ADMIN if the role is explicitly 'admin'
    if (lowerRole === 'admin') {
      console.log("Mapped to ADMIN");
      return UserRole.ADMIN;
    }
  }
  
  // Default to SALESPERSON for any other role or no role
  console.log("Returning SALESPERSON as default role");
  return UserRole.SALESPERSON;
};
