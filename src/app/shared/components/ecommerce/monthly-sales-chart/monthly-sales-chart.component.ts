import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexStroke,
  ApexLegend,
  ApexYAxis,
  ApexGrid,
  ApexFill,
  ApexTooltip,
} from 'ng-apexcharts';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { DashboardData } from '../../../services/dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monthly-sales-chart',
  standalone: true,
  imports: [NgApexchartsModule, DropdownComponent, DropdownItemComponent, CommonModule],
  templateUrl: './monthly-sales-chart.component.html',
})
export class MonthlySalesChartComponent implements OnChanges {
  @Input() data: DashboardData | null = null;

  public series: ApexAxisChartSeries = [{ name: 'Sales', data: [] }];
  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    height: 180,
    toolbar: { show: false },
  };

  public xaxis: ApexXAxis = {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  public plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '39%',
      borderRadius: 5,
      borderRadiusApplication: 'end',
    },
  };

  public dataLabels: ApexDataLabels = { enabled: false };
  public stroke: ApexStroke = { show: true, width: 4, colors: ['transparent'] };
  public legend: ApexLegend = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Outfit',
  };
  public yaxis: ApexYAxis = { title: { text: undefined } };
  public grid: ApexGrid = { yaxis: { lines: { show: true } } };
  public fill: ApexFill = { opacity: 1 };
  public tooltip: ApexTooltip = {
    x: { show: false },
    y: { formatter: (val: number) => `${val}` },
  };
  public colors: string[] = ['#465fff'];

  isOpen = false;
  toggleDropdown() { this.isOpen = !this.isOpen; }
  closeDropdown() { this.isOpen = false; }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.data) return;

    const labels = (this.data.monthlySales ?? []).map((x) => x.label);
    const values = (this.data.monthlySales ?? []).map((x) => Number(x.value ?? 0));

    this.xaxis = { ...this.xaxis, categories: labels };
    this.series = [{ name: 'Sales', data: values }];
  }
}
