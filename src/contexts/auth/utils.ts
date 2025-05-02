
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
  
  // If explicitly set to admin role, return admin
  if (role) {
    const lowerRole = role.toLowerCase();
    
    // Check for admin role (case insensitive)
    if (lowerRole === 'admin') {
      console.log("Role is explicitly admin, returning ADMIN");
      return UserRole.ADMIN;
    }
    
    // Check for vendedor (salesperson) role variants
    if (lowerRole === 'vendedor' || lowerRole.includes('vend') || lowerRole === 'salesperson') {
      console.log("Role is salesperson variant, returning SALESPERSON");
      return UserRole.SALESPERSON;
    }
  }
  
  // Default to SALESPERSON for any other role or no role
  console.log("No matching role found, returning SALESPERSON as default");
  return UserRole.SALESPERSON;
};
