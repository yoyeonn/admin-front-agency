import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReservationService } from '../../shared/services/reservation.service';
import { ReservationDTO } from '../../shared/models/reservation-dto';


@Component({
  selector: 'app-reservations',
  imports: [CommonModule, RouterModule],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.css',
})
export class ReservationsComponent implements OnInit {
 loading = false;
  error: string | null = null;
  items: ReservationDTO[] = [];

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;

    this.reservationService.getAllAdmin().subscribe({
      next: (data) => {
        this.items = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to load reservations';
      },
    });
  }

  fmtDate(v?: string) {
    if (!v) return '—';
    // works with ISO
    return new Date(v).toLocaleDateString();
  }

  money(v?: number) {
    if (v == null) return '—';
    return `${v.toFixed(2)} TND`;
  }
}
