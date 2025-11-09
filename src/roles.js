// List of all roles
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff"
};

// Utility to check permissions for a role
export function canAccessPage(role, page) {
  const permissions = {
    [ROLES.ADMIN]: ["dashboard", "reports", "machines", "workers", "takas", "quality", "settings"],
    [ROLES.MANAGER]: ["dashboard", "reports", "machines", "workers", "takas", "quality"],
    [ROLES.STAFF]: ["dashboard", "machines", "workers", "takas"]
  };
  return permissions[role] && permissions[role].includes(page);
}

// Assign a role to a user (to be used when registering)
export function getDefaultRole(email) {
  if (email.endsWith("@youradmincompany.com")) {
    return ROLES.ADMIN;
  }
  if (email.endsWith("@manager.com")) {
    return ROLES.MANAGER;
  }
  return ROLES.STAFF;
}
