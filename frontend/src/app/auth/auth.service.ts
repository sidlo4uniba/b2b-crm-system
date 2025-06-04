import { Injectable, inject, effect } from '@angular/core';
import Keycloak from 'keycloak-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { Roles } from './roles';
import { KeycloakUrls } from './keycloak-urls';
import { KEYCLOAK_EVENT_SIGNAL } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  private _displayName = new BehaviorSubject<string | undefined>(undefined);
  private _displayRole = new BehaviorSubject<string | undefined>(undefined);
  private _userRole = new BehaviorSubject<string | undefined>(undefined);

  public readonly isLoggedIn$: Observable<boolean> = this._isLoggedIn.asObservable();
  public readonly displayName$: Observable<string | undefined> = this._displayName.asObservable();
  public readonly displayRole$: Observable<string | undefined> = this._displayRole.asObservable();
  public readonly userRole$: Observable<string | undefined> = this._userRole.asObservable();

  constructor(private readonly keycloak: Keycloak) {
    const keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
    keycloak.init({
        onLoad: 'check-sso'
    });

    effect(() => {
        const keycloakEvent = keycloakSignal();
        console.log('keycloakEvent', keycloakEvent);
        this.keycloakLoadData();
    });
  }
  private async keycloakLoadData(): Promise<void> {
    try {
        const authenticated = await this.keycloak.authenticated;
        this._isLoggedIn.next(authenticated || false);

        if (authenticated) {
            const profile = await this.keycloak.loadUserProfile();
            this._displayName.next(`${profile?.firstName} ${profile.lastName}`);

            let role: string | undefined = undefined;
            let displayRole: string | undefined = 'Používateľ'; 

            if (this.keycloak.hasRealmRole(Roles.ADMIN)) {
                role = Roles.ADMIN;
                displayRole = 'Administrátor';
            } else if (this.keycloak.hasRealmRole(Roles.OBCHODNIK)) {
                role = Roles.OBCHODNIK;
                displayRole = 'Obchodník';
            } else if (this.keycloak.hasRealmRole(Roles.SKLADNIK)) {
                role = Roles.SKLADNIK;
                displayRole = 'Skladník';
            }

            this._userRole.next(role);
            this._displayRole.next(displayRole);
        }
    } catch (error) {
        console.error('Failed to load user profile or roles', error);
        this._displayName.next('Chyba pri načítaní');
        this._displayRole.next('Neznáma');
        this._userRole.next(undefined);
    }
  }

  

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.keycloak.logout();
  }

  editProfile(): void {
    window.location.href = KeycloakUrls.getPersonalInfoUrl();
  }

  

  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role);
  }
} 