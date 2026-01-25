import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DestinationService } from '../../shared/services/destination.service';
import { DestinationDTO } from '../../shared/models/destination-dto';

@Component({
  selector: 'app-destination-create',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './destination-create.component.html',
  styleUrl: './destination-create.component.css',
})
export class DestinationCreateComponent implements OnInit {
form!: FormGroup;

  saving = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private destinationService: DestinationService
  ) {}

  ngOnInit(): void {
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

    // optional initial rows (like hotel)
    this.addActivity();
    this.addFaq();
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

    this.destinationService.createDestination(payload).subscribe({
      next: (created) => {
        this.saving = false;
        if (created?.id) this.router.navigate(['/destinations', created.id]);
        else this.router.navigate(['/destinations']);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Create failed';
      },
    });
  }
}
