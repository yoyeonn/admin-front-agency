import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AdminAuthService } from '../services/admin-auth.service';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AdminAuthService);
  const token = auth.getToken();

  // Don’t attach token to auth endpoints
  const isAuthEndpoint =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/signup') ||
    req.url.includes('/api/auth/forgot-password') ||
    req.url.includes('/api/auth/reset-password');

  if (!token || isAuthEndpoint) return next(req);

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(cloned);
};
