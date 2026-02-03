import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../../shared/services/admin-auth.service';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  message = '';
  error = '';

  constructor(private auth: AdminAuthService) {}

  submit() {
    this.message = '';
    this.error = '';

    if (!this.email.trim()) {
      this.error = 'Please enter your email';
      return;
    }

    this.loading = true;

    this.auth.forgotPassword(this.email.trim()).subscribe({
      next: () => {
        this.message =
          "If this email exists, you'll receive a reset link in your inbox.";
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error ?? 'Something went wrong. Try again.';
        this.loading = false;
      },
    });
  }
}
