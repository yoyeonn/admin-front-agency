import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DestinationDTO } from '../models/destination-dto';

type ApiResponse<T> = {
  ok?: boolean;
  status?: number;
  message?: string;
  data: T;
};
@Injectable({
  providedIn: 'root',
})
export class DestinationService {
  private baseUrl = 'http://localhost:9090/api/destinations';

  constructor(private http: HttpClient) {}

  getDestinations(): Observable<DestinationDTO[]> {
    return this.http
      .get<ApiResponse<DestinationDTO[]>>(this.baseUrl, { headers: this.authHeaders() })
      .pipe(map((res) => res.data ?? []));
  }

  getDestinationById(id: number): Observable<DestinationDTO> {
    return this.http
      .get<ApiResponse<DestinationDTO>>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() })
      .pipe(map((res) => res.data as DestinationDTO));
  }

  createDestination(payload: Partial<DestinationDTO>) {
    return this.http
      .post<ApiResponse<DestinationDTO>>(this.baseUrl, payload, { headers: this.authHeaders() })
      .pipe(map((res) => res.data));
  }

  updateDestination(id: number, payload: Partial<DestinationDTO>) {
    return this.http
      .put<ApiResponse<DestinationDTO>>(`${this.baseUrl}/${id}`, payload, { headers: this.authHeaders() })
      .pipe(map((res) => res.data));
  }

  deleteDestination(id: number) {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`, {
      headers: this.authHeaders(),
    });
  }

  // Search endpoint (optional usage)
  search(q?: string, maxPrice?: number, checkIn?: string, checkOut?: string) {
    const params: any = {};
    if (q) params.q = q;
    if (maxPrice != null) params.maxPrice = maxPrice;
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;

    return this.http
      .get<ApiResponse<DestinationDTO[]>>(`${this.baseUrl}/search`, {
        headers: this.authHeaders(),
        params,
      })
      .pipe(map((res) => res.data ?? []));
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) return new HttpHeaders();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
