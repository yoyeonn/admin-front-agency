import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/signin']);
    return false;
  }

  if (auth.role() !== 'ROLE_ADMIN') {
    router.navigate(['/signin']);
    return false;
  }

  return true;
};

