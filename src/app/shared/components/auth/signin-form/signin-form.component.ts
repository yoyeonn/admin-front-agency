import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';

import { AdminAuthService } from '../../../services/admin-auth.service';

@Component({
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './signin-form.component.html',
})
export class SigninFormComponent {
  showPassword = false;
  isChecked = false;

  email = '';
  password = '';

  loading = false;
  error = '';

  constructor(private auth: AdminAuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Please enter email and password.';
      return;
    }

    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;

        // ✅ Only admins allowed
        if (res.role !== 'ROLE_ADMIN') {
          this.error = 'Access denied: admin only.';
          this.auth.logout();
          return;
        }

        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error || 'Login failed';
      },
    });
  }
}
