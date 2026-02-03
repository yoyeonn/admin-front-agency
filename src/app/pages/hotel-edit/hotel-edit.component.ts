import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class HotelEditComponent implements OnInit, OnDestroy {
  id!: number;
  loading = false;
  saving = false;
  error: string | null = null;

  hotel: HotelDTO | null = null;
  form!: FormGroup;

  // ✅ Hotel image: 1 file only
  selectedImages: File[] = [];
  previewUrls: string[] = [];

  // ✅ Room images: 1 per room index
  roomSelectedFile: Record<number, File | null> = {};
  roomPreviewUrl: Record<number, string> = {};

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
      stars: [''],
      days: [''],
      about: [''],
      cancellationPolicy: [''],
      availableDates: [''],
      bestTimeToVisit: [''],

      highlightsText: [''],
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

  ngOnDestroy(): void {
    this.previewUrls.forEach((u) => URL.revokeObjectURL(u));
    Object.values(this.roomPreviewUrl).forEach((u) => u && URL.revokeObjectURL(u));
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
      image: [r?.image ?? ''], // stored URL from backend
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

  addRoom() {
    this.rooms.push(this.newRoom());
  }
  removeRoom(i: number) {
    // cleanup room preview if exists
    this.clearRoomSelected(i);
    this.rooms.removeAt(i);
  }

  addNearby() {
    this.nearby.push(this.newNearby());
  }
  removeNearby(i: number) {
    this.nearby.removeAt(i);
  }

  addFaq() {
    this.faq.push(this.newFaq());
  }
  removeFaq(i: number) {
    this.faq.removeAt(i);
  }

  addProgramme() {
    const lastDay =
    this.programme.length > 0
      ? Number(this.programme.at(this.programme.length - 1).get('day')?.value ?? this.programme.length)
      : 0;

  this.programme.push(this.newProgramme({ day: lastDay + 1 }));
  }
  removeProgramme(i: number) {
    this.programme.removeAt(i);

  this.programme.controls.forEach((ctrl, idx) => {
    ctrl.get('day')?.setValue(idx + 1);
  });
  }

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
          includesText: (hotel.includes ?? []).join(', '),
          excludesText: (hotel.excludes ?? []).join(', '),
          suitedForText: (hotel.suitedFor ?? []).join(', '),
          travelTipsText: (hotel.travelTips ?? []).join(', '),
        });

        this.rooms.clear();
        this.nearby.clear();
        this.faq.clear();
        this.programme.clear();

        (hotel.rooms ?? []).forEach((r) => this.rooms.push(this.newRoom(r)));
        (hotel.nearby ?? []).forEach((n) => this.nearby.push(this.newNearby(n)));
        (hotel.faq ?? []).forEach((f) => this.faq.push(this.newFaq(f)));
        (hotel.programme ?? []).forEach((p) => this.programme.push(this.newProgramme(p)));

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
      .map((x) => x.trim())
      .filter(Boolean);
  }

  // ✅ Hotel image: allow only 1 file
  onFilesSelected(files: FileList | null) {
    if (!files?.length) return;

    const file = files[0];

    // clear old previews
    this.previewUrls.forEach((u) => URL.revokeObjectURL(u));
    this.previewUrls = [];
    this.selectedImages = [];

    this.selectedImages = [file];
    this.previewUrls = [URL.createObjectURL(file)];
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
    if (!this.hotel) return;
    const ok = confirm('Remove this image?');
    if (!ok) return;

    this.hotelService.deleteHotelImage(this.id, i).subscribe({
      next: (updated) => {
        this.hotel = updated;
      },
      error: (err) => {
        alert(err?.error?.message || err?.message || 'Delete image failed');
      },
    });
  }

  // ✅ Room: select 1 file and preview
  onRoomFileSelected(roomIndex: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];

    const old = this.roomPreviewUrl[roomIndex];
    if (old) URL.revokeObjectURL(old);

    this.roomSelectedFile[roomIndex] = file;
    this.roomPreviewUrl[roomIndex] = URL.createObjectURL(file);
  }

  clearRoomSelected(roomIndex: number) {
    const old = this.roomPreviewUrl[roomIndex];
    if (old) URL.revokeObjectURL(old);

    this.roomPreviewUrl[roomIndex] = '';
    this.roomSelectedFile[roomIndex] = null;
  }

  async uploadRoomImagesAfterSave(): Promise<void> {
    const uploads: Promise<any>[] = [];

    this.rooms.controls.forEach((ctrl, i) => {
      const roomId = ctrl.get('id')?.value;
      const file = this.roomSelectedFile[i];

      if (roomId && file) {
        uploads.push(this.hotelService.uploadRoomImage(this.id, Number(roomId), file).toPromise());
      }
    });

    if (uploads.length > 0) {
      await Promise.all(uploads);
    }

    // cleanup previews
    Object.keys(this.roomPreviewUrl).forEach((k) => {
      const url = this.roomPreviewUrl[Number(k)];
      if (url) URL.revokeObjectURL(url);
    });
    this.roomPreviewUrl = {};
    this.roomSelectedFile = {};
  }

  deleteRoomImage(roomIndex: number) {
    const roomId = this.rooms.at(roomIndex).get('id')?.value;
    if (!roomId) return;

    const ok = confirm('Delete this room image?');
    if (!ok) return;

    this.hotelService.deleteRoomImage(this.id, Number(roomId)).subscribe({
      next: (updated) => {
        this.hotel = updated;

        const roomForm = this.rooms.at(roomIndex);
        roomForm.patchValue({ image: '' });

        this.clearRoomSelected(roomIndex);
      },
      error: (err) => {
        alert(err?.error?.message || err?.message || 'Delete room image failed');
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
      next: async () => {
        try {
          // ✅ upload hotel image (if selected)
          if (this.selectedImages.length > 0) {
            await this.hotelService.uploadHotelImages(this.id, this.selectedImages).toPromise();

            // cleanup hotel previews
            this.previewUrls.forEach((u) => URL.revokeObjectURL(u));
            this.previewUrls = [];
            this.selectedImages = [];
          }

          // ✅ upload room images (if selected)
          await this.uploadRoomImagesAfterSave();

          this.saving = false;
          this.router.navigate(['/hotels', this.id]);
        } catch (err: any) {
          this.saving = false;
          this.error = err?.error?.message || err?.message || 'Upload failed';
        }
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Update failed';
      },
    });
  }
}
