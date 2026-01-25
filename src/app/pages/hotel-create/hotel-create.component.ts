import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HotelService } from '../../shared/services/hotel.service';
import { HotelDTO } from '../../shared/models/hotel-dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hotel-create',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './hotel-create.component.html',
  styleUrl: './hotel-create.component.css',
})
export class HotelCreateComponent implements OnInit {
form!: FormGroup;

  saving = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      location: [''],
      city: [''],
      country: [''],
      stars: [''],
      days: [''],
      about: [''],
      cancellationPolicy: [''],
      availableDates: [''],
      bestTimeToVisit: [''],

      // list fields as comma-separated text
      highlightsText: [''],
      imagesText: [''],
      includesText: [''],
      excludesText: [''],
      suitedForText: [''],
      travelTipsText: [''],

      rooms: this.fb.array([]),
      nearby: this.fb.array([]),
      faq: this.fb.array([]),
      programme: this.fb.array([]),
    });
    this.addRoom();
    this.addFaq();
  }

  get rooms(): FormArray { 
    return this.form.get('rooms') as FormArray; 
  }
  get nearby(): FormArray { 
    return this.form.get('nearby') as FormArray; 
  }
  get faq(): FormArray { 
    return this.form.get('faq') as FormArray; 
  }
  get programme(): FormArray { 
    return this.form.get('programme') as FormArray; 
  }

newRoom(r?: any): FormGroup {
  return this.fb.group({
    id: [r?.id ?? null],
    name: [r?.name ?? '', Validators.required],
    image: [r?.image ?? ''],
    description: [r?.description ?? ''],
    capacity: [r?.capacity ?? 1],
    price: [r?.price ?? 0],
  });
}

newNearby(n?: any): FormGroup {
  return this.fb.group({
    name: [n?.name ?? '', Validators.required],
    distance: [n?.distance ?? ''],
  });
}

newFaq(f?: any): FormGroup {
  return this.fb.group({
    question: [f?.question ?? '', Validators.required],
    answer: [f?.answer ?? '', Validators.required],
    open: [f?.open ?? false],
  });
}

newProgramme(p?: any): FormGroup {
  return this.fb.group({
    day: [p?.day ?? 1, Validators.required],
    activity: [p?.activity ?? '', Validators.required],
  });
}

addRoom() { this.rooms.push(this.newRoom()); }
removeRoom(i: number) { this.rooms.removeAt(i); }

addNearby() { this.nearby.push(this.newNearby()); }
removeNearby(i: number) { this.nearby.removeAt(i); }

addFaq() { this.faq.push(this.newFaq()); }
removeFaq(i: number) { this.faq.removeAt(i); }

addProgramme() { this.programme.push(this.newProgramme()); }
removeProgramme(i: number) { this.programme.removeAt(i); }

  private csvToList(v: unknown): string[] {
    const s = (v ?? '').toString().trim();
    if (!s) return [];
    return s
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = null;

    const v = this.form.value;

    const payload: Partial<HotelDTO> = {
      name: v.name ?? '',
      description: v.description ?? '',
      location: v.location ?? '',
      city: v.city ?? '',
      country: v.country ?? '',
      stars: v.stars ?? '',
      days: v.days ?? '',
      about: v.about ?? '',
      cancellationPolicy: v.cancellationPolicy ?? '',
      availableDates: v.availableDates ?? '',
      bestTimeToVisit: v.bestTimeToVisit ?? '',

      highlights: this.csvToList(v.highlightsText),
      images: this.csvToList(v.imagesText),
      includes: this.csvToList(v.includesText),
      excludes: this.csvToList(v.excludesText),
      suitedFor: this.csvToList(v.suitedForText),
      travelTips: this.csvToList(v.travelTipsText),

      rooms: this.rooms.value,
      nearby: this.nearby.value,
      faq: this.faq.value,
      programme: this.programme.value,
    };

    this.hotelService.createHotel(payload).subscribe({
      next: (created) => {
        this.saving = false;

        // go to details page of the created hotel
        if (created?.id) {
          this.router.navigate(['/hotels', created.id]);
        } else {
          this.router.navigate(['/hotels']);
        }
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Create failed';
      },
    });
  }
}
