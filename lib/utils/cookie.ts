import { CookieOptions } from 'express';
import { envConfig } from './env';

export const SESSION_COOKIE_NAME = 'sid';

export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: envConfig.NODE_ENV === 'PROD',
  // The client (Cloudflare Pages) and this API (Render) are on entirely
  // unrelated domains — a genuinely cross-site relationship, not just
  // cross-subdomain. That needs SameSite=None (Strict/Lax cookies are
  // never attached to cross-site XHR/fetch, which is all axios's
  // `withCredentials` ever does) plus Secure, which browsers require
  // together. It also means this cookie must NEVER set an explicit
  // `domain`: a previous version set `domain` to the CLIENT's host
  // (derived from CORS_ORIGIN) so this cookie would work across shared
  // subdomains of one parent domain — but a Set-Cookie whose Domain
  // doesn't match (or isn't a superdomain of) the responding server's own
  // host is invalid and gets silently dropped by the browser entirely.
  // Omitting `domain` scopes the cookie to this API's own host, which is
  // correct here since the client never reads it directly — only axios's
  // credentialed requests back to this same API host ever need it.
  sameSite: envConfig.NODE_ENV === 'PROD' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 (Express res.cookie는 밀리초 단위)
  path: '/',
};

export const clearSessionCookieOptions: CookieOptions = {
  ...sessionCookieOptions,
  maxAge: undefined,
};
