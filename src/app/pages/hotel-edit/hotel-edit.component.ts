import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HotelService } from '../../shared/services/hotel.service';
import { HotelDTO } from '../../shared/models/hotel-dto';

@Component({
  selector: 'app-hotel-edit',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './hotel-edit.component.html',
  styleUrl: './hotel-edit.component.css',
})
export class HotelEditComponent implements OnInit {
id!: number;
  loading = false;
  saving = false;
  error: string | null = null;
  
  // Keep the loaded hotel (optional)
  hotel: HotelDTO | null = null;
  form!: FormGroup;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = Number(idParam);

    if (!this.id || Number.isNaN(this.id)) {
      this.error = 'Invalid hotel id';
      return;
    }
    
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      location: [''],
      city: [''],
      country: [''],
      stars: [''], // string in your DTO
      days: [''],  // string in your DTO
      about: [''],
      cancellationPolicy: [''],
      availableDates: [''],
      bestTimeToVisit: [''],

      // list fields as comma-separated text (easy to edit)
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
    this.fetchHotel();
  }

  get rooms(): FormArray { return this.form.get('rooms') as FormArray; }
get nearby(): FormArray { return this.form.get('nearby') as FormArray; }
get faq(): FormArray { return this.form.get('faq') as FormArray; }
get programme(): FormArray { return this.form.get('programme') as FormArray; }

newRoom(r?: any): FormGroup {
  return this.fb.group({
    id: [r?.id ?? null],              // keep for edit
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


  fetchHotel(): void {
    this.loading = true;
    this.error = null;

    this.hotelService.getHotelById(this.id).subscribe({
      next: (hotel) => {
        this.hotel = hotel;

        this.form.patchValue({
          name: hotel.name ?? '',
          description: hotel.description ?? '',
          location: hotel.location ?? '',
          city: hotel.city ?? '',
          country: hotel.country ?? '',
          stars: hotel.stars ?? '',
          days: hotel.days ?? '',
          about: hotel.about ?? '',
          cancellationPolicy: hotel.cancellationPolicy ?? '',
          availableDates: hotel.availableDates ?? '',
          bestTimeToVisit: hotel.bestTimeToVisit ?? '',

          highlightsText: (hotel.highlights ?? []).join(', '),
          imagesText: (hotel.images ?? []).join(', '),
          includesText: (hotel.includes ?? []).join(', '),
          excludesText: (hotel.excludes ?? []).join(', '),
          suitedForText: (hotel.suitedFor ?? []).join(', '),
          travelTipsText: (hotel.travelTips ?? []).join(', '),
        });

        // clear arrays
          this.rooms.clear();
          this.nearby.clear();
          this.faq.clear();
          this.programme.clear();

          // fill from backend
          (hotel.rooms ?? []).forEach(r => this.rooms.push(this.newRoom(r)));
          (hotel.nearby ?? []).forEach(n => this.nearby.push(this.newNearby(n)));
          (hotel.faq ?? []).forEach(f => this.faq.push(this.newFaq(f)));
          (hotel.programme ?? []).forEach(p => this.programme.push(this.newProgramme(p)));


        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Failed to load hotel';
      },
    });
  }

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

    this.hotelService.updateHotel(this.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/hotels', this.id]); // go back to details
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Update failed';
      },
    });
  }
}
