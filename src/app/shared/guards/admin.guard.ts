import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    router.navigateByUrl('/signin');
    return false;
  }

  if (role !== 'ROLE_ADMIN') {
    auth.logout();
    router.navigateByUrl('/signin');
    return false;
  }

  return true;
};
