import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface User {
  id: string;
  username: string;
  email?: string;
  pass: string;
  role: 'ADMIN' | 'MODERATOR' | 'USER';
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly usersKey = 'cozy_users';
  private readonly currentUserKey = 'current_user';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  // Default admin user (for demo purposes)
  private readonly defaultAdmin: User = {
    id: '1',
    username: 'admin',
    email: 'admin@cozy.com',
    pass: 'admin123',
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  constructor(private router: Router) {
    // Initialize users array in localStorage if it doesn't exist
    if (!localStorage.getItem(this.usersKey)) {
      const initialUsers = [this.defaultAdmin];
      localStorage.setItem(this.usersKey, JSON.stringify(initialUsers));
    }
    
    // Initialize current user from localStorage
    const storedUser = localStorage.getItem(this.currentUserKey);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Get the current user value
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  /**
   * Check if current user has required role
   */
  public hasRole(role: User['role']): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    return user.role === role;
  }

  /**
   * Register a new user
   */
  register(userData: Omit<User, 'id' | 'role' | 'createdAt' | 'updatedAt'>): Observable<User> {
    // Check if username already exists
    const users = this.getUsers();
    const userExists = users.some(u => u.username === userData.username || u.email === userData.email);
    
    if (userExists) {
      return throwError(() => new Error('Username or email already exists'));
    }
    
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(newUser);
    this.saveUsers(users);
    
    // Auto-login after registration
    return this.login(userData.username, userData.pass);
  }

  /**
   * Login with username and password
   */
  login(username: string, password: string): Observable<User> {
    const users = this.getUsers();
    const user = users.find(u => 
      (u.username === username || u.email === username) && 
      u.pass === password
    );
    
    if (!user) {
      return throwError(() => new Error('Invalid username/email or password'));
    }
    
    // Update last login time
    user.updatedAt = new Date();
    this.saveUsers(users);
    
    // Store user in local storage
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
    
    return of(user);
  }
  
  /**
   * Logout the current user
   */
  logout(): void {
    // Remove user from local storage
    localStorage.removeItem(this.currentUserKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  /**
   * Get all users (admin only)
   */
  getAllUsers(): Observable<User[]> {
    if (!this.hasRole('ADMIN')) {
      return throwError(() => new Error('Unauthorized'));
    }
    return of(this.getUsers());
  }
  
  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User | undefined> {
    const users = this.getUsers();
    const user = users.find(u => u.id === id);
    
    // Only allow users to view their own profile unless admin
    const currentUser = this.currentUserValue;
    if (!currentUser || (currentUser.id !== id && currentUser.role !== 'ADMIN')) {
      return throwError(() => new Error('Unauthorized'));
    }
    
    return of(user);
  }
  
  /**
   * Update user profile
   */
  updateUser(id: string, userData: Partial<User>): Observable<User> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    const currentUser = this.currentUserValue;
    
    // Check if user exists
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }
    
    // Only allow users to update their own profile or admin
    if (!currentUser || (currentUser.id !== id && currentUser.role !== 'ADMIN')) {
      return throwError(() => new Error('Unauthorized'));
    }
    
    // Prevent changing role unless admin
    if (userData.role && currentUser.role !== 'ADMIN') {
      delete userData.role;
    }
    
    // Update user
    const updatedUser = { 
      ...users[userIndex], 
      ...userData, 
      updatedAt: new Date() 
    };
    
    users[userIndex] = updatedUser;
    this.saveUsers(users);
    
    // Update current user if it's the same user
    if (currentUser.id === id) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
    
    return of(updatedUser);
  }
  
  /**
   * Delete user (admin only)
   */
  deleteUser(id: string): Observable<boolean> {
    if (!this.hasRole('ADMIN')) {
      return throwError(() => new Error('Unauthorized'));
    }
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }
    
    // Prevent deleting self
    const currentUser = this.currentUserValue;
    if (currentUser && currentUser.id === id) {
      return throwError(() => new Error('Cannot delete your own account'));
    }
    
    users.splice(userIndex, 1);
    this.saveUsers(users);
    
    return of(true);
  }
  
  // Helper methods
  private getUsers(): User[] {
    return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
  }
  
  private saveUsers(users: User[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  updateData(id: string, userData: Partial<User>): Observable<User> {
    return this.updateUser(id, userData);
  }

  getAll() {
    return of(JSON.parse(localStorage.getItem(this.usersKey) || '[]'));
  }

  getByID(id: any) {
    const users = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
    return of(users.find((user: any) => user.id === id));
  }

  deleteByID(id: any) {
    let users = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
    users = users.filter((user: any) => user.id !== id);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return of({ success: true });
  }
}
