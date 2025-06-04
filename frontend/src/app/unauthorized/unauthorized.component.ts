import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <h1>Nedostatočné oprávnenie</h1>
        <div class="icon">
          <i class="material-icons">lock</i>
        </div>
        <p>Nemáte oprávnenie pristupovať k tejto stránke.</p>
        <p>Ak by ste mali oprávnenie pristupovať k tejto stránke, prosím kontaktujte administrátora.</p>
        <a routerLink="/" class="back-button">Späť na hlavnú stránku</a>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }
    
    .unauthorized-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      text-align: center;
      max-width: 500px;
    }
    
    h1 {
      color: #e53935;
      margin-bottom: 1.5rem;
    }
    
    .icon {
      font-size: 3rem;
      color: #e53935;
      margin-bottom: 1.5rem;
    }
    
    p {
      margin-bottom: 1rem;
      color: #666;
    }
    
    .back-button {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.6rem 1.5rem;
      background-color: #3f51b5;
      color: white;
      border-radius: 4px;
      text-decoration: none;
      transition: background-color 0.3s ease;
    }
    
    .back-button:hover {
      background-color: #303f9f;
    }
  `]
})
export class UnauthorizedComponent {} 