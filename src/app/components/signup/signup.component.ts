import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from './../../service/login.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup = new FormGroup({});
  loading = false;
  submitted = false;
  errorMessage = '';
  isSignupFailed = false;
  isSignupSuccess = false;
  roles = [
    { value: 'USER', label: 'User' },
    { value: 'MODERATOR', label: 'Moderator' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    // Redirect to home if already logged in
    if (this.loginService.currentUserValue) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      pass: ['', [
        Validators.required, 
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', Validators.required],
      role: ['USER', Validators.required]
    }, {
      validators: [this.mustMatch('pass', 'confirmPassword')]
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  // Password validation helpers
  hasUppercase(): boolean {
    const value = this.signupForm.get('pass')?.value || '';
    return /[A-Z]/.test(value);
  }

  hasLowercase(): boolean {
    const value = this.signupForm.get('pass')?.value || '';
    return /[a-z]/.test(value);
  }

  hasNumber(): boolean {
    const value = this.signupForm.get('pass')?.value || '';
    return /[0-9]/.test(value);
  }

  hasSpecialChar(): boolean {
    const value = this.signupForm.get('pass')?.value || '';
    return /[!@#$%^&*(),.?":{}|<>]/.test(value);
  }

  // Custom validator for password strength
  private passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const hasNumber = /[0-9]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const valid = hasNumber && hasUpper && hasLower && hasSpecial;
      
      if (!valid) {
        return { passwordStrength: true };
      }
      return null;
    };
  }

  // Custom validator for matching passwords
  private mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return null;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
        return { mustMatch: true };
      } else {
        matchingControl.setErrors(null);
        return null;
      }
    };
  }

  onSubmit() {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;
    this.isSignupFailed = false;
    this.errorMessage = '';

    // Prepare user data
    const { confirmPassword, ...userData } = this.signupForm.value;
    
    this.loginService.register(userData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.isSignupSuccess = true;
          this.isSignupFailed = false;
          
          // Show success message and redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/log-in']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred during registration. Please try again.';
          this.isSignupFailed = true;
          this.loading = false;
        }
      });
  }
}
