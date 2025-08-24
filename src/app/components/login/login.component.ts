import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/service/login.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  loading = false;
  submitted = false;
  errorMessage = '';
  isLoginFailed = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loginService: LoginService
  ) {
    // Redirect to home if already logged in
    if (this.loginService.currentUserValue) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      pass: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.isLoginFailed = false;
    this.errorMessage = '';

    const { username, pass } = this.loginForm.value;
    
    this.loginService.login(username, pass)
      .pipe(first())
      .subscribe({
        next: (user) => {
          if (user) {
            // Store user details and basic auth credentials in local storage 
            // to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('username', user.username);
            localStorage.setItem('isLogin', 'true');
            
            // Redirect based on user role
            if (user.role === 'ADMIN') {
              this.router.navigate(['/admin-dashboard']);
            } else if (user.role === 'MODERATOR') {
              this.router.navigate(['/moderator-dashboard']);
            } else {
              this.router.navigate(['/home']);
            }
          } else {
            this.errorMessage = 'Invalid username or password';
            this.isLoginFailed = true;
          }
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred during login';
          this.isLoginFailed = true;
          this.loading = false;
        }
      });
  }
}