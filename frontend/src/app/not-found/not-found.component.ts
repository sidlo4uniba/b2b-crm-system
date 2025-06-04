import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div class="not-found-container">
      <mat-card class="not-found-card">
        <mat-card-header>
          <mat-card-title>Page Under Construction</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="icon-container">
            <mat-icon class="construction-icon">build</mat-icon>
          </div>
          <p>This page is currently under development and will be available soon.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/">Go Home</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      height: 100%;
    }
    
    .not-found-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border-radius: 8px;
    }
    
    .icon-container {
      display: flex;
      justify-content: center;
      margin: 2rem 0;
    }
    
    .construction-icon {
      font-size: 4rem;
      height: 4rem;
      width: 4rem;
      color: var(--primary-color);
    }
    
    mat-card-actions {
      display: flex;
      justify-content: center;
      padding-bottom: 20px;
    }

    mat-card-title {
      color: var(--primary-color);
      font-weight: 500;
    }

    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
  `]
})
export class NotFoundComponent {} 