/** Shared between client (form validation) and server (`password.ts`) —
 * kept dependency-free so client components can import it without pulling
 * in `node:crypto`. */
export const PASSWORD_MIN_LENGTH = 8;
