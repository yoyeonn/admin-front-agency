import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type LoginResponse = {
  token: string;
  name: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_CLIENT' | string;
};

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private baseUrl = 'http://localhost:9090/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.role);
          localStorage.setItem('name', res.name);
          localStorage.setItem('email', res.email);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  role(): string | null {
    return localStorage.getItem('role');
  }
}
