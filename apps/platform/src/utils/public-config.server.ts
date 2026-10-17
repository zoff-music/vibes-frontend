export interface PublicContactEmails {
  contact: string;
  privacy: string;
  security: string;
}

export function getPublicContactEmails(): PublicContactEmails {
  return {
    contact: process.env.CONTACT_EMAIL?.trim() ?? '',
    privacy: process.env.PRIVACY_EMAIL?.trim() ?? '',
    security: process.env.SECURITY_EMAIL?.trim() ?? '',
  };
}

export function getSecurityPolicyExpires(): string {
  return process.env.SECURITY_POLICY_EXPIRES?.trim() ?? '';
}
