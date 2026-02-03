import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';
import { UserInfoCardComponent } from '../../shared/components/user-profile/user-info-card/user-info-card.component';
import { UserAddressCardComponent } from '../../shared/components/user-profile/user-address-card/user-address-card.component';
import { AdminProfile, AdminProfileService } from '../../shared/services/admin-profile.service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    UserMetaCardComponent,
    UserInfoCardComponent,
    UserAddressCardComponent
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  profile?: AdminProfile;
  isLoading = true;

  constructor(private adminProfileService: AdminProfileService) {}

  ngOnInit(): void {
    this.adminProfileService.getMyProfile().subscribe({
  next: (p: AdminProfile) => {
    this.profile = p;
    this.isLoading = false;
  },
  error: (err: unknown) => {
    console.error(err);
    this.isLoading = false;
  }
});
  }

  onProfileUpdated(p: AdminProfile) {
    this.profile = p;
  }
}
