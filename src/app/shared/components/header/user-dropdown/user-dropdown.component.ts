import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { AdminAuthService } from '../../../services/admin-auth.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemTwoComponent],
})
export class UserDropdownComponent {
  isOpen = false;

  constructor(private auth: AdminAuthService, private router: Router) {}

  private getStored(key: string): string | null {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

get name() { return this.getStored('name') ?? 'Admin'; }
get email() { return this.getStored('email') ?? ''; }


  toggleDropdown() { this.isOpen = !this.isOpen; }
  closeDropdown() { this.isOpen = false; }

  signOut() {
    this.auth.logout();
    this.closeDropdown();
    this.router.navigate(['/signin']);
  }

  get imageSrc(): string {
  const url = this.getStored('imageUrl');
  if (!url) return '/images/user/owner.jpg';

  if (url.startsWith('http')) return url;

  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `http://localhost:9090${normalized}`;
}

}
