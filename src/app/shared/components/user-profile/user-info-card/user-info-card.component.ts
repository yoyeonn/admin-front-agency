import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminProfile, AdminProfileService } from '../../../services/admin-profile.service';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { InputFieldComponent } from '../../form/input/input-field.component';


@Component({
  selector: 'app-user-info-card',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, FormsModule, LabelComponent, InputFieldComponent],
  templateUrl: './user-info-card.component.html',
})
export class UserInfoCardComponent {
  @Input() profile!: AdminProfile;
  @Output() profileUpdated = new EventEmitter<AdminProfile>();

  isOpen = false;
  editName = '';

  constructor(private adminProfileService: AdminProfileService) {}


  openModal() {
    this.editName = this.profile?.name ?? '';
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  handleSave() {
    this.adminProfileService.updateMyProfile({ name: this.editName }).subscribe({
      next: (updated: AdminProfile) => {
        this.profileUpdated.emit(updated);
        this.closeModal();
      },
      error: (err: unknown) => console.error(err),
    });
  }
}
