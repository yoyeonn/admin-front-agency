import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { HotelDTO } from '../models/hotel-dto';

type ApiResponse<T> = {
  ok?: boolean;
  status?: number;
  message?: string;
  data: T;
};

@Injectable({ 
  providedIn: 'root' 
})
export class HotelService {
  private baseUrl = 'http://localhost:9090/api/hotels';

  constructor(private http: HttpClient) {}

  getHotels(): Observable<HotelDTO[]> {
    return this.http.get<ApiResponse<HotelDTO[]>>(this.baseUrl, {
      headers: this.authHeaders(),
    }).pipe(
      map(res => res.data ?? [])
    );
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) return new HttpHeaders();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getHotelById(id: number): Observable< HotelDTO> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, {
      headers: this.authHeaders(),
    }).pipe(
      map(res => res.data as HotelDTO)
    );
  }

  updateHotel(id: number, payload: Partial<HotelDTO>) {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload, {
      headers: this.authHeaders(),
    }).pipe(
      map(res => res.data as HotelDTO)
    );
  }

  deleteHotel(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, {
      headers: this.authHeaders(),
    });
  }

  createHotel(payload: any) {
    return this.http.post<any>(this.baseUrl, payload, { headers: this.authHeaders() })
      .pipe(map(res => res.data));
  }

}
