import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DestinationDTO } from '../../shared/models/destination-dto';
import { DestinationService } from '../../shared/services/destination.service';

@Component({
  selector: 'app-destination-edit',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './destination-edit.component.html',
  styleUrl: './destination-edit.component.css',
})
export class DestinationEditComponent implements OnInit{
id!: number;
  loading = false;
  saving = false;
  error: string | null = null;

  destination: DestinationDTO | null = null;
  form!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private destinationService: DestinationService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = Number(idParam);

    if (!this.id || Number.isNaN(this.id)) {
      this.error = 'Invalid destination id';
      return;
    }

    this.form = this.fb.group({
      name: ['', Validators.required],
      country: [''],
      location: [''],
      title: [''],
      price: [0],
      days: [1],
      availableFrom: [''],
      availableTo: [''],
      description: [''],
      about: [''],

      imagesText: [''],

      activities: this.fb.array([]),
      nearby: this.fb.array([]),
      faq: this.fb.array([]),
      reviews: this.fb.array([]),
    });

    this.fetchDestination();
  }

  get activities(): FormArray { return this.form.get('activities') as FormArray; }
  get nearby(): FormArray { return this.form.get('nearby') as FormArray; }
  get faq(): FormArray { return this.form.get('faq') as FormArray; }
  get reviews(): FormArray { return this.form.get('reviews') as FormArray; }

  newActivity(a?: any): FormGroup {
    return this.fb.group({
      day: [a?.day ?? 1, Validators.required],
      activity: [a?.activity ?? '', Validators.required],
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

  newReview(r?: any): FormGroup {
    return this.fb.group({
      name: [r?.name ?? '', Validators.required],
      stars: [r?.stars ?? 5],
      comment: [r?.comment ?? ''],
    });
  }

  addActivity() { this.activities.push(this.newActivity()); }
  removeActivity(i: number) { this.activities.removeAt(i); }

  addNearby() { this.nearby.push(this.newNearby()); }
  removeNearby(i: number) { this.nearby.removeAt(i); }

  addFaq() { this.faq.push(this.newFaq()); }
  removeFaq(i: number) { this.faq.removeAt(i); }

  addReview() { this.reviews.push(this.newReview()); }
  removeReview(i: number) { this.reviews.removeAt(i); }

  fetchDestination(): void {
    this.loading = true;
    this.error = null;

    this.destinationService.getDestinationById(this.id).subscribe({
      next: (d) => {
        this.destination = d;

        this.form.patchValue({
          name: d.name ?? '',
          country: d.country ?? '',
          location: d.location ?? '',
          title: d.title ?? '',
          price: d.price ?? 0,
          days: d.days ?? 1,
          availableFrom: d.availableFrom ?? '',
          availableTo: d.availableTo ?? '',
          description: d.description ?? '',
          about: d.about ?? '',
          imagesText: (d.images ?? []).join(', '),
        });

        this.activities.clear();
        this.nearby.clear();
        this.faq.clear();
        this.reviews.clear();

        (d.activities ?? []).forEach(a => this.activities.push(this.newActivity(a)));
        (d.nearby ?? []).forEach(n => this.nearby.push(this.newNearby(n)));
        (d.faq ?? []).forEach(f => this.faq.push(this.newFaq(f)));
        (d.reviews ?? []).forEach(r => this.reviews.push(this.newReview(r)));

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Failed to load destination';
      },
    });
  }

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

    const payload: Partial<DestinationDTO> = {
      name: v.name ?? '',
      country: v.country ?? '',
      location: v.location ?? '',
      title: v.title ?? '',
      price: Number(v.price ?? 0),
      days: Number(v.days ?? 1),

      availableFrom: v.availableFrom ?? null,
      availableTo: v.availableTo ?? null,

      description: v.description ?? '',
      about: v.about ?? '',

      images: this.csvToList(v.imagesText),

      activities: this.activities.value,
      nearby: this.nearby.value,
      faq: this.faq.value,
      reviews: this.reviews.value,
    };

    this.destinationService.updateDestination(this.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/destinations', this.id]);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Update failed';
      },
    });
  }
}
