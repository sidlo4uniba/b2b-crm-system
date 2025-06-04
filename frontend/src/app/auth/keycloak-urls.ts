import { environment } from '../../environments/environment';


export const KeycloakUrls = {
  
  BASE_URL: environment.keycloak.url,

  
  REALM: environment.keycloak.realm,

  
  getAccountUrl(): string {
    return `${this.BASE_URL}/realms/${this.REALM}/account`;
  },

  
  getAccountSecurityUrl(): string {
    return `${this.BASE_URL}/realms/${this.REALM}/account/#/security`;
  },

  
  getPersonalInfoUrl(): string {
    return `${this.BASE_URL}/realms/${this.REALM}/account/#/personal-info`;
  }
}; 