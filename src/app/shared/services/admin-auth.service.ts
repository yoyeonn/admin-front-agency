import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { AdminProfileService } from './admin-profile.service';

export type LoginResponse = {
  token: string;
  name: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_CLIENT' | string;
};

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private baseUrl = 'http://localhost:9090/api/auth';

  constructor(private http: HttpClient, private profile: AdminProfileService) {}

  login(email: string, password: string, remember: boolean): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
    tap((res) => {
      const storage = remember ? localStorage : sessionStorage;

      storage.setItem('token', res.token);
      storage.setItem('role', res.role);
      storage.setItem('name', res.name);
      storage.setItem('email', res.email);

      const other = remember ? sessionStorage : localStorage;
      other.clear(); // or remove specific keys
    }),
    // ✅ now fetch profile (includes imageUrl) so header updates immediately
    switchMap((res) =>
      this.profile.getMyProfile().pipe(
        // return original login response back
        switchMap(() => [res])
      )
    )
  );
}


  logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('name');
  localStorage.removeItem('email');
  localStorage.removeItem('imageUrl');

  sessionStorage.removeItem('token');
  sessionStorage.removeItem('role');
  sessionStorage.removeItem('name');
  sessionStorage.removeItem('email');
  sessionStorage.removeItem('imageUrl');
}

  isLoggedIn(): boolean {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

getToken(): string | null {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

  role(): string | null {
  return localStorage.getItem('role') || sessionStorage.getItem('role');
}

  forgotPassword(email: string) {
  return this.http.post(
    'http://localhost:9090/api/auth/forgot-password',
    { email },
    { responseType: 'text' } // ✅
  );
}

resetPassword(token: string, newPassword: string) {
  return this.http.post(
    'http://localhost:9090/api/auth/reset-password',
    { token, newPassword },
    { responseType: 'text' } // ✅ treat backend response as plain text
  );
}

}
