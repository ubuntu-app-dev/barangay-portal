/** True when no permission is required, or the user has it. */
export const can = (permissions: string[], permission?: string) => !permission || permissions.includes(permission);
