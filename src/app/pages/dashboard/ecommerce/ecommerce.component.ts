import { Component, Input, OnInit } from '@angular/core';
import { EcommerceMetricsComponent } from '../../../shared/components/ecommerce/ecommerce-metrics/ecommerce-metrics.component';
import { MonthlySalesChartComponent } from '../../../shared/components/ecommerce/monthly-sales-chart/monthly-sales-chart.component';
import { MonthlyTargetComponent } from '../../../shared/components/ecommerce/monthly-target/monthly-target.component';
import { StatisticsChartComponent } from '../../../shared/components/ecommerce/statics-chart/statics-chart.component';
// import { DemographicCardComponent } from '../../../shared/components/ecommerce/demographic-card/demographic-card.component';
import { RecentOrdersComponent } from '../../../shared/components/ecommerce/recent-orders/recent-orders.component';
import { DashboardData, DashboardService } from '../../../shared/services/dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ecommerce',
  imports: [
    EcommerceMetricsComponent,
    MonthlySalesChartComponent,
    MonthlyTargetComponent,
    StatisticsChartComponent,
    // DemographicCardComponent,
    RecentOrdersComponent,
    CommonModule,
  ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit {
  @Input() data!: DashboardData;
  loading = false;
  error: string | null = null;


  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (d) => {
        this.data = d;
        this.loading = false;

        // Example:
        // this.monthlySalesValues = d.monthlySales.map(x => x.value);
        // this.monthlySalesLabels = d.monthlySales.map(x => x.label);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to load dashboard';
      }
    });
  }
}
