import { Component, OnInit } from '@angular/core';
import { DestinationDTO } from '../../shared/models/destination-dto';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DestinationService } from '../../shared/services/destination.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-destination-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './destination-detail.component.html',
  styleUrl: './destination-detail.component.css',
})
export class DestinationDetailComponent implements OnInit {
id!: number;

  loading = false;
  deleting = false;
  error: string | null = null;

  destination: DestinationDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destinationService: DestinationService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchDestination();
  }

  fetchDestination(): void {
    this.loading = true;
    this.error = null;

    this.destinationService.getDestinationById(this.id).subscribe({
      next: (d) => {
        this.destination = d;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Failed to load destination';
      },
    });
  }

  deleteDestination(): void {
    if (!confirm('Are you sure you want to delete this destination?')) return;

    this.deleting = true;
    this.error = null;

    this.destinationService.deleteDestination(this.id).subscribe({
      next: () => {
        this.deleting = false;
        this.router.navigate(['/destinations']);
      },
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.message || err?.message || 'Delete failed';
      },
    });
  }
}
