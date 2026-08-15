export const isAdmin = (user) => ['admin', 'superadmin'].includes(user?.role);

export const isSuperAdmin = (user) => user?.role === 'superadmin';