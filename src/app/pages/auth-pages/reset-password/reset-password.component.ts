import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../../shared/services/admin-auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  token = '';
  newPassword = '';
  confirmPassword = '';

  loading = false;
  message = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AdminAuthService
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  submit() {
    this.message = '';
    this.error = '';

    if (!this.token) {
      this.error = 'Invalid or missing token.';
      return;
    }
    if (!this.newPassword || this.newPassword.length < 4) {
      this.error = 'Password must be at least 4 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.auth.resetPassword(this.token, this.newPassword).subscribe({
  next: (msg: string) => {
    this.message = msg || 'Password updated!';
    this.loading = false;
    setTimeout(() => this.router.navigate(['/signin']), 1200);
  },
  error: (err) => {
    this.error = err?.error || 'Reset failed (token may be expired).';
    this.loading = false;
  },
});

  }
}
