import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PackService } from '../../shared/services/pack.service';
import { HotelService } from '../../shared/services/hotel.service';
import { DestinationService } from '../../shared/services/destination.service';

import { PackDTO } from '../../shared/models/pack-dto';
import { HotelDTO } from '../../shared/models/hotel-dto';
import { DestinationDTO } from '../../shared/models/destination-dto';

@Component({
  selector: 'app-pack-edit',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './pack-edit.component.html',
  styleUrl: './pack-edit.component.css',
})
export class PackEditComponent implements OnInit{
id!: number;

  loading = false;
  saving = false;
  error: string | null = null;

  pack: PackDTO | null = null;

  hotels: HotelDTO[] = [];
  destinations: DestinationDTO[] = [];

  form!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private packsService: PackService,
    private hotelService: HotelService,
    private destinationService: DestinationService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = Number(idParam);

    if (!this.id || Number.isNaN(this.id)) {
      this.error = 'Invalid pack id';
      return;
    }

    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      days: [1, [Validators.required, Validators.min(1)]],
      location: [''],
      description: [''],
      about: [''],
      imagesText: [''],

      hotelId: [null, Validators.required],
      destinationId: [null, Validators.required],

      activities: this.fb.array([]),
      faq: this.fb.array([]),
      nearby: this.fb.array([]),
    });

    this.loadLists();
    this.fetchPack();
  }

  // ---------- Arrays ----------
  get activities(): FormArray { return this.form.get('activities') as FormArray; }
  get faq(): FormArray { return this.form.get('faq') as FormArray; }
  get nearby(): FormArray { return this.form.get('nearby') as FormArray; }

  newActivity(a?: any): FormGroup {
    return this.fb.group({
      day: [a?.day ?? 1, [Validators.required, Validators.min(1)]],
      activity: [a?.activity ?? '', Validators.required],
    });
  }

  newFaq(f?: any): FormGroup {
    return this.fb.group({
      question: [f?.question ?? '', Validators.required],
      answer: [f?.answer ?? '', Validators.required],
      open: [false],
    });
  }

  newNearby(n?: any): FormGroup {
    return this.fb.group({
      name: [n?.name ?? '', Validators.required],
      distance: [n?.distance ?? ''],
    });
  }

  addActivity() {
  const lastDay =
    this.activities.length > 0
      ? Number(this.activities.at(this.activities.length - 1).get('day')?.value ?? this.activities.length)
      : 0;

  this.activities.push(this.newActivity({ day: lastDay + 1 }));
}
  removeActivity(i: number) {
  this.activities.removeAt(i);

  this.activities.controls.forEach((ctrl, idx) => {
    ctrl.get('day')?.setValue(idx + 1);
  });
}

  addFaq() { this.faq.push(this.newFaq()); }
  removeFaq(i: number) { this.faq.removeAt(i); }

  addNearby() { this.nearby.push(this.newNearby()); }
  removeNearby(i: number) { this.nearby.removeAt(i); }

  // ---------- Helpers ----------
  private csvToList(v: unknown): string[] {
    const s = (v ?? '').toString().trim();
    if (!s) return [];
    return s.split(',').map(x => x.trim()).filter(Boolean);
  }

  get selectedHotel(): HotelDTO | undefined {
    const id = Number(this.form.get('hotelId')?.value);
    return this.hotels.find(h => h.id === id);
  }

  get selectedDestination(): DestinationDTO | undefined {
    const id = Number(this.form.get('destinationId')?.value);
    return this.destinations.find(d => (d.id ?? 0) === id);
  }

  // ---------- Data ----------
  private loadLists(): void {
    this.hotelService.getHotels().subscribe({
      next: (h) => (this.hotels = h ?? []),
      error: () => (this.hotels = []),
    });

    this.destinationService.getDestinations().subscribe({
      next: (d) => (this.destinations = d ?? []),
      error: () => (this.destinations = []),
    });
  }

  private fetchPack(): void {
    this.loading = true;
    this.error = null;

    this.packsService.getPackById(this.id).subscribe({
      next: (p) => {
        this.pack = p;

        this.form.patchValue({
          name: p.name ?? '',
          price: p.price ?? 0,
          days: p.days ?? 1,
          location: p.location ?? '',
          description: p.description ?? '',
          about: p.about ?? '',
          imagesText: (p.images ?? []).join(', '),

          hotelId: p.hotel?.id ?? null,
          destinationId: p.destination?.id ?? null,
        });

        // fill arrays
        this.activities.clear();
        this.faq.clear();
        this.nearby.clear();

        (p.activities ?? []).forEach(a => this.activities.push(this.newActivity(a)));
        (p.faq ?? []).forEach(f => this.faq.push(this.newFaq(f)));
        (p.nearby ?? []).forEach(n => this.nearby.push(this.newNearby(n)));

        // defaults if empty
        if (this.activities.length === 0) this.addActivity();
        if (this.faq.length === 0) this.addFaq();

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to load pack';
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = null;

    const v = this.form.value;

    const selectedDest = this.selectedDestination;

const payload: any = {
  name: v.name ?? '',
  // country must come from destination
  country: selectedDest?.country ?? '',

  price: Number(v.price ?? 0),
  days: Number(v.days ?? 1),
  location: v.location ?? '',
  description: v.description ?? '',
  about: v.about ?? '',

  images: this.csvToList(v.imagesText),

  hotelId: Number(v.hotelId),
  destinationId: Number(v.destinationId),

  activities: this.activities.value,
  faq: this.faq.value,
  nearby: this.nearby.value,
};


    this.packsService.updatePack(this.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/packs', this.id]);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Update failed';
      },
    });
  }
}
