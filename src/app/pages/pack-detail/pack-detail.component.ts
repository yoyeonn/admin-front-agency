import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PackService } from '../../shared/services/pack.service';
import { PackDTO } from '../../shared/models/pack-dto';

@Component({
  selector: 'app-pack-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './pack-detail.component.html',
  styleUrl: './pack-detail.component.css',
})
export class PackDetailComponent implements OnInit {
id!: number;

  loading = false;
  deleting = false;
  error: string | null = null;

  pack: PackDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private packsService: PackService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = Number(idParam);

    if (!this.id || Number.isNaN(this.id)) {
      this.error = 'Invalid pack id';
      return;
    }

    this.fetchPack();
  }

  fetchPack(): void {
    this.loading = true;
    this.error = null;

    this.packsService.getPackById(this.id).subscribe({
      next: (p) => {
        this.pack = p;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to load pack';
      },
    });
  }

  deletePack(): void {
    if (!this.id) return;

    this.deleting = true;
    this.error = null;

    this.packsService.deletePack(this.id).subscribe({
      next: () => {
        this.deleting = false;
        this.router.navigate(['/packs']);
      },
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.message || err?.message || 'Delete failed';
      },
    });
  }
}
