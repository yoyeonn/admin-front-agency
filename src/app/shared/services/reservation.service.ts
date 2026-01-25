import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ReservationDTO } from '../models/reservation-dto';

type ApiResponse<T> = {
  ok?: boolean;
  status?: number;
  message?: string;
  data: T;
};

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private adminBaseUrl = 'http://localhost:9090/api/admin/reservations';

  private userBaseUrl = 'http://localhost:9090/api/reservations';

  constructor(private http: HttpClient) {}

  getAllAdmin(): Observable<ReservationDTO[]> {
    return this.http
      .get<ApiResponse<ReservationDTO[]>>(`${this.adminBaseUrl}/hotels`, {
        headers: this.authHeaders(),
      })
      .pipe(map(res => res.data ?? []));
  }

  getByIdAdmin(id: number): Observable<ReservationDTO> {
    return this.http
      .get<ApiResponse<ReservationDTO>>(`${this.adminBaseUrl}/hotels/${id}`, {
        headers: this.authHeaders(),
      })
      .pipe(map(res => res.data as ReservationDTO));
  }

  downloadInvoicePdf(id: number): Observable<Blob> {
    return this.http.get(`${this.userBaseUrl}/${id}/invoice.pdf`, {
      headers: this.authHeaders(),
      responseType: 'blob',
    });
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) return new HttpHeaders();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  } 

  getInvoiceJson(id: number) {
  return this.http.get<any>(`${this.userBaseUrl}/${id}/invoice`, { headers: this.authHeaders() });
  }
  

}
