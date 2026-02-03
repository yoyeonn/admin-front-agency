import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class DestinationEditComponent implements OnInit, OnDestroy {
  id!: number;
  loading = false;
  saving = false;
  error: string | null = null;

  destination: DestinationDTO | null = null;
  form!: FormGroup;

  // ✅ like hotel
  selectedImages: File[] = [];
  previewUrls: string[] = [];

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
    name: [{ value: r?.name ?? '', disabled: true }],
    stars: [{ value: r?.stars ?? 5, disabled: true }],
    comment: [{ value: r?.comment ?? '', disabled: true }],
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

  addNearby() { this.nearby.push(this.newNearby()); }
  removeNearby(i: number) { this.nearby.removeAt(i); }

  addFaq() { this.faq.push(this.newFaq()); }
  removeFaq(i: number) { this.faq.removeAt(i); }

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
        });

        this.activities.clear();
        this.nearby.clear();
        this.faq.clear();
        this.reviews.clear();

        (d.activities ?? []).forEach((a) => this.activities.push(this.newActivity(a)));
        (d.nearby ?? []).forEach((n) => this.nearby.push(this.newNearby(n)));
        (d.faq ?? []).forEach((f) => this.faq.push(this.newFaq(f)));
        (d.reviews ?? []).forEach((r) => this.reviews.push(this.newReview(r)));

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Failed to load destination';
      },
    });
  }

  // ✅ images handlers (like hotel)
  onFilesSelected(files: FileList | null) {
    if (!files?.length) return;

    Array.from(files).forEach((file) => {
      this.selectedImages.push(file);
      this.previewUrls.push(URL.createObjectURL(file));
    });
  }

  removeSelectedImage(i: number) {
    URL.revokeObjectURL(this.previewUrls[i]);
    this.previewUrls.splice(i, 1);
    this.selectedImages.splice(i, 1);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.onFilesSelected(event.dataTransfer?.files ?? null);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  removeExistingImage(i: number) {
    if (!this.destination) return;

    const ok = confirm('Remove this image?');
    if (!ok) return;

    this.destinationService.deleteDestinationImage(this.id, i).subscribe({
      next: (updated) => {
        this.destination = updated;
      },
      error: (err) => {
        alert(err?.error?.message || err?.message || 'Delete image failed');
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

    // ✅ IMPORTANT: do NOT send images in update payload
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

      activities: this.activities.value,
      nearby: this.nearby.value,
      faq: this.faq.value,
    };

    // 1) update destination fields
    this.destinationService.updateDestination(this.id, payload).subscribe({
      next: () => {
        // 2) if no new images selected => done
        if (this.selectedImages.length === 0) {
          this.saving = false;
          this.router.navigate(['/destinations', this.id]);
          return;
        }

        // 3) upload selected images
        this.destinationService.uploadDestinationImages(this.id, this.selectedImages).subscribe({
          next: (updated) => {
            this.destination = updated;

            this.previewUrls.forEach((u) => URL.revokeObjectURL(u));
            this.previewUrls = [];
            this.selectedImages = [];

            this.saving = false;
            this.router.navigate(['/destinations', this.id]);
          },
          error: (err) => {
            this.saving = false;
            this.error = err?.error?.message || err?.message || 'Image upload failed';
          },
        });
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Update failed';
      },
    });
  }

  ngOnDestroy(): void {
    this.previewUrls.forEach((u) => URL.revokeObjectURL(u));
  }
}
