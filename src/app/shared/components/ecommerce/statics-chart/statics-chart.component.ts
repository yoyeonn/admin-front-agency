import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import flatpickr from 'flatpickr';
import { Instance } from 'flatpickr/dist/types/instance';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { ChartTabComponent } from '../../common/chart-tab/chart-tab.component';
import { DashboardData } from '../../../services/dashboard.service';

@Component({
  selector: 'app-statics-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, ChartTabComponent],
  templateUrl: './statics-chart.component.html',
})
export class StatisticsChartComponent implements AfterViewInit, OnChanges {
  @Input() data: DashboardData | null = null;
  @ViewChild('datepicker') datepicker!: ElementRef<HTMLInputElement>;

  // ✅ Default config (works even before API data arrives)
  public series: ApexAxisChartSeries = [{ name: 'Revenue', data: [] }];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    height: 310,
    type: 'area',
    toolbar: { show: false },
  };

  public colors: string[] = ['#465FFF'];

  public stroke: ApexStroke = { curve: 'straight', width: 2 };

  public fill: ApexFill = {
    type: 'gradient',
    gradient: { opacityFrom: 0.55, opacityTo: 0 },
  };

  public markers: ApexMarkers = {
    size: 0,
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: { size: 6 },
  };

  public grid: ApexGrid = {
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  };

  public dataLabels: ApexDataLabels = { enabled: false };

  public tooltip: ApexTooltip = {
    enabled: true,
    x: { format: 'yyyy-MM-dd' },
  };

  public xaxis: ApexXAxis = {
    type: 'category',
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  };

  public yaxis: ApexYAxis = {
    title: { text: '', style: { fontSize: '0px' } },
  };

  public legend: ApexLegend = { show: false };

  ngAfterViewInit(): void {
    flatpickr(this.datepicker.nativeElement, {
      mode: 'range',
      static: true,
      monthSelectorType: 'static',
      dateFormat: 'M j',
      defaultDate: [new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date()],
      onReady: (_selectedDates: Date[], dateStr: string, instance: Instance) => {
        (instance.element as HTMLInputElement).value = dateStr.replace('to', '-');
        const customClass = instance.element.getAttribute('data-class');
        if (customClass) instance.calendarContainer?.classList.add(customClass);
      },
      onChange: (_selectedDates: Date[], dateStr: string, instance: Instance) => {
        (instance.element as HTMLInputElement).value = dateStr.replace('to', '-');
      },
    });
  }

  ngOnChanges(_changes: SimpleChanges): void {
    const stats = this.data?.statistics ?? [];
    const labels = stats.map((x) => x.label);
    const values = stats.map((x) => Number(x.value ?? 0));

    this.xaxis = { ...this.xaxis, categories: labels };
    this.series = [{ name: 'Revenue', data: values }];
  }
}
