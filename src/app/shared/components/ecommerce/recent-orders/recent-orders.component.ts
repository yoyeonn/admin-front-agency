import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { DashboardData } from '../../../services/dashboard.service';
import { OrdersService, OrderRow } from '../../../services/orders.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recent-orders',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './recent-orders.component.html',
})
export class RecentOrdersComponent implements OnChanges {
  @Input() data: DashboardData | null = null;

  loading = false;
  error: string | null = null;

  type: 'ALL' | 'HOTEL' | 'DESTINATION' | 'PACK' = 'ALL';
  rows: OrderRow[] = [];

  constructor(private ordersService: OrdersService, private router: Router) {}

  ngOnChanges(): void {
    // start with dashboard data if present
    this.rows = (this.data?.recentOrders ?? []) as any;
  }

  onSeeAll() {
    // Option A: route to a page you create:
    // this.router.navigate(['/orders']);
    // Option B: simplest: open all in same component:
    this.load(0, 20);
  }

  onFilterChange(t: 'ALL' | 'HOTEL' | 'DESTINATION' | 'PACK') {
    this.type = t;
    this.load(0, 5); // keep it "recent"
  }

  load(page = 0, size = 5) {
    this.loading = true;
    this.error = null;

    this.ordersService.getOrders(this.type, page, size).subscribe({
      next: (res) => {
        this.rows = res.items;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to load orders';
      },
    });
  }

  moneyTND(v?: number) {
    const n = Number(v ?? 0);
    if (Number.isNaN(n)) return '0.00 TND';
    return `${n.toFixed(2)} TND`;
  }

  getBadgeColor(status: string): 'success' | 'warning' | 'error' {
    const s = (status ?? '').toLowerCase();
    if (s.includes('confirm') || s.includes('paid') || s.includes('done')) return 'success';
    if (s.includes('pending') || s.includes('wait')) return 'warning';
    return 'error';
  }
}
