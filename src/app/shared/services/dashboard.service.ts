import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';

type ApiResponse<T> = { data: T };

export type RecentOrder = {
  name: string;
  category: 'Hotel' | 'Destination' | 'Pack' | string;
  amount: number;
  status: string;
  createdAt: string;
};

export type DashboardData = {
  customers: number;
  orders: number;

  monthlySales: { label: string; value: number }[];

  target: number;
  revenueThisMonth: number;
  todayRevenue: number; // ✅

  targetPercent: number;

  statistics: { label: string; value: number }[];
  recentOrders: RecentOrder[];
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private url = 'http://localhost:9090/api/admin/dashboard';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http
      .get<ApiResponse<DashboardData>>(this.url, {
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
