import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export type OrderRow = {
  name: string;
  category: string;
  amount: number;
  status: string;
  createdAt: string;
};

type ApiResponse<T> = { data: T };

export type OrdersPage = {
  items: OrderRow[];
  page: number;
  size: number;
  total: number;
};

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private url = 'http://localhost:9090/api/admin/orders';

  constructor(private http: HttpClient) {}

  getOrders(type: 'ALL' | 'HOTEL' | 'DESTINATION' | 'PACK', page = 0, size = 20): Observable<OrdersPage> {
    return this.http
      .get<ApiResponse<OrdersPage>>(`${this.url}?type=${type}&page=${page}&size=${size}`, {
        headers: this.authHeaders(),
      })
      .pipe(map((r) => r.data));
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) return new HttpHeaders();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
