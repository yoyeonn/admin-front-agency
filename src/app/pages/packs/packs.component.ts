import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PackDTO } from '../../shared/models/pack-dto';
import { PackService } from '../../shared/services/pack.service';

@Component({
  selector: 'app-packs',
  imports: [CommonModule, RouterModule],
  templateUrl: './packs.component.html',
  styleUrl: './packs.component.css',
})
export class PacksComponent implements OnInit {
packs: PackDTO[] = [];
  loading = false;
  error: string | null = null;

  deletingId: number | null = null;

  constructor(private packsService: PackService) {}

  ngOnInit(): void {
    this.fetchPacks();
  }

  fetchPacks() {
    this.loading = true;
    this.error = null;

    this.packsService.getPacks().subscribe({
      next: (data) => {
        this.packs = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to load packs';
      },
    });
  }

  deletePack(id: number) {
    this.deletingId = id;

    this.packsService.deletePack(id).subscribe({
      next: () => {
        this.packs = this.packs.filter(p => p.id !== id);
        this.deletingId = null;
      },
      error: (err) => {
        this.deletingId = null;
        this.error = err?.error?.message || err?.message || 'Delete failed';
      },
    });
  }
}
