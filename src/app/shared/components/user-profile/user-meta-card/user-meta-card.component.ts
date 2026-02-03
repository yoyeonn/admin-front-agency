import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { ModalComponent } from '../../ui/modal/modal.component';
import { InputFieldComponent } from './../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { FormsModule } from '@angular/forms';
import { AdminProfile, AdminProfileService } from '../../../services/admin-profile.service';

@Component({
  selector: 'app-user-meta-card',
  imports: [ModalComponent, InputFieldComponent, ButtonComponent, FormsModule],
  templateUrl: './user-meta-card.component.html',
})
export class UserMetaCardComponent {
  @Input() profile!: AdminProfile;
  @Output() profileUpdated = new EventEmitter<AdminProfile>();

  constructor(
    public modal: ModalService,
    private adminProfileService: AdminProfileService
  ) {}
  selectedFile?: File;
  previewUrl?: string;
  isOpen = false;
  openModal() {
    this.editName = this.profile?.name ?? '';
    this.isOpen = true;
  }
  closeModal() {
    this.isOpen = false;
  }

  // form model
  editName = '';

  get firstName(): string {
    return (this.profile?.name ?? '').split(' ')[0] ?? '';
  }

  get lastName(): string {
    const parts = (this.profile?.name ?? '').split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }


onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];

  // preview instantly
  if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  this.previewUrl = URL.createObjectURL(file);

  // upload immediately
  this.adminProfileService.uploadProfileImage(file).subscribe({
    next: (updated) => {
      this.profileUpdated.emit(updated);
      this.previewUrl = undefined;
      this.selectedFile = undefined;
    },
    error: (err) => {
      console.error('Upload failed', err);
    },
  });
}



uploadImage() {
  if (!this.selectedFile) return;

  this.adminProfileService.uploadProfileImage(this.selectedFile).subscribe({
    next: (updated) => {
      this.profile = updated;
      this.profileUpdated.emit(updated);

      this.previewUrl = undefined;
      this.selectedFile = undefined;
    },
    error: (err) => console.error('Upload failed', err),
  });
}


  handleSave() {
    this.adminProfileService.updateMyProfile({ name: this.editName }).subscribe({
      next: (updated) => {
        this.profileUpdated.emit(updated);
        this.closeModal();
      },
      error: (err) => {
        console.error('Failed to update profile', err);
      },
    });
  }

  get imageSrc(): string {
  if (this.previewUrl) return this.previewUrl;

  const url = this.profile?.imageUrl;
  if (!url) return '/images/user/owner.jpg';

  // If backend returns Cloudinary URL (https://...), 
  if (url.startsWith('http')) return url;

  // If backend returns relative path (/uploads/...), prefix backend host
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `http://localhost:9090${normalized}`;
}

}
