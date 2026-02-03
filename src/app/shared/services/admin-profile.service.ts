import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export type AdminProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
  country?: string;
  cityState?: string;
  postalCode?: string;
  imageUrl?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminProfileService {
  private baseUrl = 'http://localhost:9090/api/admin/profile';

  private profileSubject = new BehaviorSubject<AdminProfile | null>(null);
  profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  private setProfile(p: AdminProfile) {
    this.profileSubject.next(p);

    localStorage.setItem('name', p.name);
    localStorage.setItem('email', p.email);
    if (p.imageUrl) localStorage.setItem('imageUrl', p.imageUrl);
  }

  getMyProfile(): Observable<AdminProfile> {
  return this.http.get<AdminProfile>(this.baseUrl).pipe(
    tap((p) => {
      const s = this.storage();
      s.setItem('name', p.name);
      s.setItem('email', p.email);
      s.setItem('imageUrl', p.imageUrl ?? '');
    })
  );
}


  updateMyProfile(data: {
    name: string;
    country?: string;
    cityState?: string;
    postalCode?: string;
  }): Observable<AdminProfile> {
    return this.http.put<AdminProfile>(this.baseUrl, data).pipe(
      tap((p) => {
  localStorage.setItem('name', p.name);
  localStorage.setItem('email', p.email);
  localStorage.setItem('imageUrl', p.imageUrl ?? '');
})
    );
  }

  uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post<AdminProfile>(this.baseUrl + '/image', formData).pipe(
    tap((p) => {
      localStorage.setItem('imageUrl', p.imageUrl ?? '');
    })
  );
}

private storage(): Storage {
  return localStorage.getItem('token') ? localStorage : sessionStorage;
}

}
