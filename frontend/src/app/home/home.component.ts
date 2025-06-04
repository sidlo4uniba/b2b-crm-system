import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Roles } from '../auth/roles';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  username = '';
  userRole = '';
  hasAdminOrObchodnik = false;
  hasAdminOrSkladnik = false;
  
  private subscriptions: Subscription[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.setupAuthSubscriptions();
  }

  ngOnDestroy(): void {
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupAuthSubscriptions(): void {
    
    this.subscriptions.push(
      this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
        
        if (isLoggedIn) {
          this.updateRoleBasedAccess();
        } else {
          this.resetUserData();
        }
      })
    );

    
    this.subscriptions.push(
      this.authService.displayName$.subscribe(name => {
        if (name) {
          this.username = name;
        }
      })
    );

    
    this.subscriptions.push(
      this.authService.displayRole$.subscribe(role => {
        if (role) {
          this.userRole = role;
        }
      })
    );

    
    this.subscriptions.push(
      this.authService.userRole$.subscribe(role => {
        if (role) {
          this.updateRoleBasedAccess();
        }
      })
    );
  }

  private updateRoleBasedAccess(): void {
    
    this.hasAdminOrObchodnik = 
      this.authService.hasRole(Roles.ADMIN) || 
      this.authService.hasRole(Roles.OBCHODNIK);
      
    this.hasAdminOrSkladnik = 
      this.authService.hasRole(Roles.ADMIN) || 
      this.authService.hasRole(Roles.SKLADNIK);
  }

  private resetUserData(): void {
    this.username = '';
    this.userRole = '';
    this.hasAdminOrObchodnik = false;
    this.hasAdminOrSkladnik = false;
  }

  login(): void {
    this.authService.login();
  }
}