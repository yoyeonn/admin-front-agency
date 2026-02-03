import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class DestinationCreateComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  saving = false;
  error: string | null = null;

  // ✅ like hotel
  selectedImages: File[] = [];
  previewUrls: string[] = [];

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

      activities: this.fb.array([]),
      nearby: this.fb.array([]),
      faq: this.fb.array([]),
    });

    this.addActivity();
    this.addFaq();
  }

  get activities(): FormArray { return this.form.get('activities') as FormArray; }
  get nearby(): FormArray { return this.form.get('nearby') as FormArray; }
  get faq(): FormArray { return this.form.get('faq') as FormArray; }

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

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = null;

    const v = this.form.value;

    // ✅ IMPORTANT: do NOT send images from text. Backend images come from upload endpoint.
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

    this.destinationService.createDestination(payload).subscribe({
      next: (created) => {
        const id = created?.id;
        if (!id) {
          this.saving = false;
          this.router.navigate(['/destinations']);
          return;
        }

        // ✅ no images selected => done
        if (this.selectedImages.length === 0) {
          this.saving = false;
          this.router.navigate(['/destinations', id]);
          return;
        }

        // ✅ upload images
        this.destinationService.uploadDestinationImages(id, this.selectedImages).subscribe({
          next: () => {
            this.previewUrls.forEach((u) => URL.revokeObjectURL(u));
            this.previewUrls = [];
            this.selectedImages = [];

            this.saving = false;
            this.router.navigate(['/destinations', id]);
          },
          error: (err) => {
            this.saving = false;
            this.error = err?.error?.message || err?.message || 'Image upload failed';
          },
        });
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Create failed';
      },
    });
  }

  ngOnDestroy(): void {
    this.previewUrls.forEach((u) => URL.revokeObjectURL(u));
  }
}
