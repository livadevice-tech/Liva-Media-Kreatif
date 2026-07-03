export type AuthRole = "master" | "admin" | "host" | "brand";

export interface AuthSession {
  role: AuthRole;
  subjectId: string;
  expiresAt: number;
  accessTabs?: string[];
}
