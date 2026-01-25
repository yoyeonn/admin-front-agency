import { Component, OnInit } from '@angular/core';
import { HotelService } from '../../shared/services/hotel.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HotelDTO } from '../../shared/models/hotel-dto';


@Component({
  selector: 'app-hotels',
  imports: [CommonModule, RouterModule],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.css',
})
export class HotelsComponent implements OnInit {
  loading = false;
  error: string | null = null;
  hotels: HotelDTO[] = [];

  deletingId: number | null = null;

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.fetchHotels();
  }

  fetchHotels(): void {
    this.loading = true;
    this.error = null;

    this.hotelService.getHotels().subscribe({
      next: (hotels) => {
        this.hotels = hotels;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Failed to load hotels';
      },
    });
  }

  onDelete(id: number, name?: string) {
    const ok = confirm(`Delete hotel "${name ?? ''}"? This cannot be undone.`);
    if (!ok) return;

    this.deletingId = id;

    this.hotelService.deleteHotel(id).subscribe({
      next: () => {
        this.hotels = this.hotels.filter(h => h.id !== id);
        this.deletingId = null;
      },
      error: (err) => {
        this.deletingId = null;
        alert(err?.error?.message || err?.message || 'Delete failed');
      },
    });
  }
}