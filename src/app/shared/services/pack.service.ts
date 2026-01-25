import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PackDTO, PackUpsertPayload } from '../models/pack-dto';

type ApiResponse<T> = {
  ok?: boolean;
  status?: number;
  message?: string;
  data: T;
};

@Injectable({
  providedIn: 'root',
})
export class PackService {
private baseUrl = 'http://localhost:9090/api/packs';

  constructor(private http: HttpClient) {}

  getPacks(): Observable<PackDTO[]> {
    return this.http
      .get<ApiResponse<PackDTO[]>>(this.baseUrl, { headers: this.authHeaders() })
      .pipe(map(res => res.data ?? []));
  }

  getPackById(id: number): Observable<PackDTO> {
    return this.http
      .get<ApiResponse<PackDTO>>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() })
      .pipe(map(res => res.data as PackDTO));
  }

  createPack(payload: PackUpsertPayload): Observable<PackDTO> {
    return this.http
      .post<ApiResponse<PackDTO>>(this.baseUrl, payload, { headers: this.authHeaders() })
      .pipe(map(res => res.data as PackDTO));
  }

  updatePack(id: number, payload: PackUpsertPayload): Observable<PackDTO> {
    return this.http
      .put<ApiResponse<PackDTO>>(`${this.baseUrl}/${id}`, payload, { headers: this.authHeaders() })
      .pipe(map(res => res.data as PackDTO));
  }

  deletePack(id: number) {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) return new HttpHeaders();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
