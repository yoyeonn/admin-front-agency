import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HotelService } from '../../shared/services/hotel.service';
import { HotelDTO } from '../../shared/models/hotel-dto';

@Component({
  selector: 'app-hotel-create',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './hotel-create.component.html',
  styleUrl: './hotel-create.component.css',
})
export class HotelCreateComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  saving = false;
  error: string | null = null;

  selectedImages: File[] = [];
  previewUrls: string[] = [];

  // Room images: 1 per room index
  roomSelectedFile: Record<number, File | null> = {};
  roomPreviewUrl: Record<number, string> = {};

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

    this.addRoom();
    this.addFaq();
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
      image: [''],
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

  private csvToList(v: unknown): string[] {
    const s = (v ?? '').toString().trim();
    if (!s) return [];
    return s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  onFilesSelected(files: FileList | null) {
    if (!files?.length) return;

    const file = files[0];

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

  // Room: select 1 file and preview
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

  async uploadRoomImagesAfterCreate(created: HotelDTO): Promise<void> {
    const hotelId = created.id;
    if (!hotelId) return;

    const createdRooms: any[] = (created as any).rooms ?? [];
    const uploads: Promise<any>[] = [];

    createdRooms.forEach((room, i) => {
      const file = this.roomSelectedFile[i];
      if (room?.id && file) {
        uploads.push(this.hotelService.uploadRoomImage(hotelId, room.id, file).toPromise());
      }
    });

    if (uploads.length > 0) {
      await Promise.all(uploads);
    }

    Object.keys(this.roomPreviewUrl).forEach((k) => {
      const url = this.roomPreviewUrl[Number(k)];
      if (url) URL.revokeObjectURL(url);
    });
    this.roomPreviewUrl = {};
    this.roomSelectedFile = {};
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

    this.hotelService.createHotel(payload).subscribe({
      next: async (created) => {
        const id = created?.id;
        if (!id) {
          this.saving = false;
          this.router.navigate(['/hotels']);
          return;
        }

        try {
          // upload hotel image (if selected)
          if (this.selectedImages.length > 0) {
            await this.hotelService.uploadHotelImages(id, this.selectedImages).toPromise();

            this.previewUrls.forEach((u) => URL.revokeObjectURL(u));
            this.previewUrls = [];
            this.selectedImages = [];
          }

          // upload room images after create (needs room ids)
          await this.uploadRoomImagesAfterCreate(created);

          this.saving = false;
          this.router.navigate(['/hotels', id]);
        } catch (err: any) {
          this.saving = false;
          this.error = err?.error?.message || err?.message || 'Upload failed';
        }
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Create failed';
      },
    });
  }
}
