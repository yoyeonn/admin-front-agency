import { Component, OnInit } from '@angular/core';
import { DestinationDTO } from '../../shared/models/destination-dto';
import { DestinationService } from '../../shared/services/destination.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-destinations',
  imports: [CommonModule, RouterModule],
  templateUrl: './destinations.component.html',
  styleUrl: './destinations.component.css',
})
export class DestinationsComponent implements OnInit {
loading = false;
  error: string | null = null;

  deletingId: number | null = null;
  destinations: DestinationDTO[] = [];

  constructor(private destinationService: DestinationService) {}

  ngOnInit(): void {
    this.fetchDestinations();
  }

  fetchDestinations(): void {
    this.loading = true;
    this.error = null;

    this.destinationService.getDestinations().subscribe({
      next: (data) => {
        this.destinations = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Failed to load destinations';
      },
    });
  }

  deleteDestination(id: number): void {
    if (!confirm('Are you sure you want to delete this destination?')) return;

    this.deletingId = id;
    this.error = null;

    this.destinationService.deleteDestination(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.destinations = this.destinations.filter((d) => d.id !== id);
      },
      error: (err) => {
        this.deletingId = null;
        this.error = err?.error?.message || err?.message || 'Delete failed';
      },
    });
  }
}
