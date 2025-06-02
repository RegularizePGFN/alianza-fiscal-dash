
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function parseUrlPath(pathname: string): string[] {
  console.log('Full pathname:', pathname);
  
  // Split the pathname and filter out empty segments
  const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
  console.log('All path segments:', pathSegments);
  
  // Find the index of 'admin-users' and get segments after it
  const adminUsersIndex = pathSegments.findIndex(segment => segment === 'admin-users');
  const routeSegments = adminUsersIndex >= 0 ? pathSegments.slice(adminUsersIndex + 1) : [];
  
  console.log('Route segments after admin-users:', routeSegments);
  return routeSegments;
}
