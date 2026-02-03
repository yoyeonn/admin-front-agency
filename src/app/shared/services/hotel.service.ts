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

@Injectable({ providedIn: 'root' })
export class HotelService {
  private baseUrl = 'http://localhost:9090/api/hotels';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return new HttpHeaders();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getHotels(): Observable<HotelDTO[]> {
    return this.http
      .get<ApiResponse<HotelDTO[]>>(this.baseUrl)
      .pipe(map((res) => res.data ?? []));
  }

  getHotelById(id: number): Observable<HotelDTO> {
    return this.http
      .get<any>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data as HotelDTO));
  }

  createHotel(payload: any) {
    return this.http
      .post<any>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }

  updateHotel(id: number, payload: Partial<HotelDTO>) {
    return this.http
      .put<any>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((res) => res.data as HotelDTO));
  }

  deleteHotel(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  uploadHotelImages(id: number, files: File[]) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    return this.http
      .post<any>(`${this.baseUrl}/${id}/images`, formData)
      .pipe(map((res) => res.data as HotelDTO));
  }

  deleteHotelImage(id: number, index: number) {
  return this.http.delete<any>(`${this.baseUrl}/${id}/images/${index}`, {
    headers: this.authHeaders(),
  }).pipe(map(res => res.data as HotelDTO));
}

uploadRoomImage(hotelId: number, roomId: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return this.http
    .post<any>(`${this.baseUrl}/${hotelId}/rooms/${roomId}/image`, formData)
    .pipe(map((res) => res.data as HotelDTO));
}

deleteRoomImage(hotelId: number, roomId: number) {
  return this.http
    .delete<any>(`${this.baseUrl}/${hotelId}/rooms/${roomId}/image`)
    .pipe(map((res) => res.data as HotelDTO));
}

}
