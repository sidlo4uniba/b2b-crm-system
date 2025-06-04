import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HasRolesDirective } from 'keycloak-angular';
import { Roles } from './auth/roles';
import { AuthService } from './auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    CommonModule
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'BakalarkaFrontend';
  currentPageTitle = 'Dashboard';
  showBackButton = false;
  displayName: string | undefined = 'Meno Používateľa';
  displayRole: string | undefined = 'Rola';
  userRole: string | undefined = undefined;
  isLoggedIn = false;
  roles = Roles;
  showSidenav = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    
    this.subscriptions.push(
      this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      }),
      
      this.authService.displayName$.subscribe(name => {
        if (name) this.displayName = name;
      }),
      
      this.authService.displayRole$.subscribe(role => {
        if (role) this.displayRole = role;
      }),
      
      this.authService.userRole$.subscribe(role => {
        this.userRole = role;
      })
    );

    
    this.subscriptions.push(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.updatePageTitleAndBackButton();
        this.updateSidenavVisibility();
      })
    );
    
    this.updatePageTitleAndBackButton();
    this.updateSidenavVisibility();
  }

  ngOnDestroy() {
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  updatePageTitleAndBackButton() {
    const url = this.router.url;
    let title = 'Dashboard';
    let showBack = false;

    if (url.startsWith('/firmy')) {
      title = 'Firmy';
    } else if (url.startsWith('/dodavatelia')) {
      title = 'Dodávatelia';
    } else if (url.startsWith('/tovary')) {
      title = 'Tovary';
    } else if (url.startsWith('/objednavky')) {
      title = 'Objednávky';
    } else {
      title = '';
    }

    if ( (url.startsWith('/firmy') && url !== '/firmy') ||
         (url.startsWith('/dodavatelia') && url !== '/dodavatelia') ||
         (url.startsWith('/tovary') && url !== '/tovary') ||
         (url.startsWith('/objednavky') && url !== '/objednavky') )
    {
        showBack = true;
    } else {
        showBack = false;
    }

    if (url.match(/^\/dodavatelia\/\d+\/tovary\/pridat$/)) {
        title = 'Pridať Tovar';
        showBack = true;
    } else if (url.match(/^\/dodavatelia\/\d+\/tovary\/\d+$/)) {
        title = 'Detail Tovaru';
        showBack = true;
    }
    else if (url.endsWith('/pridat')) {
        if (title === 'Firmy') title = 'Pridať Firmu';
        else if (title === 'Dodávatelia') title = 'Pridať Dodávateľa';
        showBack = true;
    }
    else if (url.match(/\/\d+$/)) {
        if (title === 'Firmy') title = 'Detail Firmy';
        else if (title === 'Dodávatelia') title = 'Detail Dodávateľa';
        showBack = true;
    }

    this.currentPageTitle = title;
    this.showBackButton = showBack;
  }

  updateSidenavVisibility() {
    this.showSidenav = this.isLoggedIn && this.router.url !== '/';
  }

  goBack() {
    this.location.back();
  }

  editProfile() {
    this.authService.editProfile();
  }

  logout() {
    this.authService.logout();
  }
}
