import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminProfile, AdminProfileService } from '../../../services/admin-profile.service';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { InputFieldComponent } from '../../form/input/input-field.component';

@Component({
  selector: 'app-user-address-card',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, LabelComponent, InputFieldComponent, FormsModule],
  templateUrl: './user-address-card.component.html',
})
export class UserAddressCardComponent {
  @Input() profile!: AdminProfile;
  @Output() profileUpdated = new EventEmitter<AdminProfile>();

  isOpen = false;

  editAddress = {
    country: '',
    cityState: '',
    postalCode: '',
  };

  constructor(private adminProfileService: AdminProfileService) {}

  openModal() {
    this.editAddress = {
      country: this.profile?.country ?? '',
      cityState: this.profile?.cityState ?? '',
      postalCode: this.profile?.postalCode ?? '',
    };
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  handleSave() {
    this.adminProfileService.updateMyProfile({
      name: this.profile.name,
      country: this.editAddress.country,
      cityState: this.editAddress.cityState,
      postalCode: this.editAddress.postalCode,
    }).subscribe({
      next: (updated) => {
        this.profileUpdated.emit(updated);
        this.closeModal();
      },
      error: (err) => console.error('Update address failed', err),
    });
  }
}
