import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  ApexChart,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { DashboardData } from '../../../services/dashboard.service';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-monthly-target',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, DropdownComponent, DropdownItemComponent],
  templateUrl: './monthly-target.component.html',
})
export class MonthlyTargetComponent implements OnChanges {
  @Input() data: DashboardData | null = null;

  public series: ApexNonAxisChartSeries = [0];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'radialBar',
    height: 330,
    sparkline: { enabled: true },
  };

  public plotOptions: ApexPlotOptions = {
    radialBar: {
      startAngle: -85,
      endAngle: 85,
      hollow: { size: '80%' },
      track: { background: '#E4E7EC', strokeWidth: '100%', margin: 5 },
      dataLabels: {
        name: { show: false },
        value: {
          fontSize: '36px',
          fontWeight: '600',
          offsetY: -40,
          color: '#1D2939',
          formatter: (val: number) => `${val}%`,
        },
      },
    },
  };

  public fill: ApexFill = { type: 'solid', colors: ['#465FFF'] };
  public stroke: ApexStroke = { lineCap: 'round' };
  public labels: string[] = ['Progress'];
  public colors: string[] = ['#465FFF'];

  isOpen = false;
  toggleDropdown() { this.isOpen = !this.isOpen; }
  closeDropdown() { this.isOpen = false; }

  ngOnChanges(changes: SimpleChanges): void {
    const p = this.data?.targetPercent ?? 0;
    this.series = [Number(p.toFixed(2))];
  }

  money(v?: number) {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return '0 TND';

  return new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n) + ' TND';
}
}
