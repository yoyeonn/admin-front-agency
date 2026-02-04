import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';

import { HotelDTO } from '../../shared/models/hotel-dto';
import { DestinationDTO } from '../../shared/models/destination-dto';
import { PackUpsertPayload } from '../../shared/models/pack-dto';

import { HotelService } from '../../shared/services/hotel.service';
import { DestinationService } from '../../shared/services/destination.service';
import { PackService } from '../../shared/services/pack.service';

@Component({
  selector: 'app-pack-create',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './pack-create.component.html',
  styleUrl: './pack-create.component.css',
})
export class PackCreateComponent implements OnInit{
form!: FormGroup;

  hotels: HotelDTO[] = [];
  destinations: DestinationDTO[] = [];

  selectedHotel: HotelDTO | null = null;
  selectedDestination: DestinationDTO | null = null;

  saving = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private hotelService: HotelService,
    private destinationService: DestinationService,
    private packsService: PackService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      country: ['', Validators.required],
      location: [''],
      days: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      about: [''],

      hotelId: [null, Validators.required],
      destinationId: [null, Validators.required],

      activities: this.fb.array([]),
      faq: this.fb.array([]),
      nearby: this.fb.array([]),
    });

    this.addActivity();
    this.addFaq();
    this.addNearby();

    // load hotels + destinations
    combineLatest([
      this.hotelService.getHotels(),
      this.destinationService.getDestinations(),
    ]).subscribe({
      next: ([hotels, destinations]) => {
        this.hotels = hotels ?? [];
        this.destinations = destinations ?? [];
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load hotels/destinations';
      }
    });

    // react to hotel selection to show stars
    this.form.get('hotelId')?.valueChanges.subscribe((id) => {
      const num = Number(id);
      this.selectedHotel = this.hotels.find(h => h.id === num) ?? null;
    });

    this.form.get('destinationId')?.valueChanges.subscribe((id) => {
      const num = Number(id);
      this.selectedDestination = this.destinations.find(d => d.id === num) ?? null;
    });
  }

  get activities(): FormArray {
    return this.form.get('activities') as FormArray;
  }
  get faq(): FormArray {
    return this.form.get('faq') as FormArray;
  }
  get nearby(): FormArray {
    return this.form.get('nearby') as FormArray;
  }

  newActivity(a?: { day?: number; activity?: string }): FormGroup {
  return this.fb.group({
    day: [a?.day ?? 1, [Validators.required, Validators.min(1)]],
    activity: [a?.activity ?? '', Validators.required],
  });
}

  newFaq(): FormGroup {
    return this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required],
      open: [false],
    });
  }

  newNearby(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      distance: [''],
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

  private csvToList(v: unknown): string[] {
    const s = (v ?? '').toString().trim();
    if (!s) return [];
    return s.split(',').map(x => x.trim()).filter(Boolean);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = null;

    const v = this.form.value;

    const payload: PackUpsertPayload = {
      name: v.name ?? '',
      country: v.country ?? '',
      location: v.location ?? '',
      days: Number(v.days ?? 1),
      price: Number(v.price ?? 0),
      description: v.description ?? '',
      about: v.about ?? '',
      images: this.csvToList(v.imagesText),

      hotelId: Number(v.hotelId),
      destinationId: Number(v.destinationId),

      activities: this.activities.value,
      faq: this.faq.value,
      nearby: this.nearby.value,
    };

    this.packsService.createPack(payload).subscribe({
      next: (created) => {
        this.saving = false;
        if (created?.id) this.router.navigate(['/packs', created.id]);
        else this.router.navigate(['/packs']);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Create failed';
      }
    });
  }
}
