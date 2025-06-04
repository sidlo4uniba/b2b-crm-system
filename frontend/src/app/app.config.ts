import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideKeycloak, withAutoRefreshToken, AutoRefreshTokenService, UserActivityService, includeBearerTokenInterceptor, createInterceptorCondition, IncludeBearerTokenCondition, INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG } from 'keycloak-angular';
import { environment } from '../environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';


const createApiRequestCondition = () => {
  return createInterceptorCondition<IncludeBearerTokenCondition>({
    urlPattern: new RegExp(`^(${environment.apiUrl})(\/.*)?$`, 'i'),
    bearerPrefix: 'Bearer'
  });
};

export const appConfig: ApplicationConfig = {
    providers: [
      provideKeycloak({
        config: {
          url: environment.keycloak.url,
          realm: environment.keycloak.realm,
          clientId: environment.keycloak.clientId
        },
        features: [
          withAutoRefreshToken({
            onInactivityTimeout: 'logout',
            sessionTimeout: 60000
          })
        ],
      }),
      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useValue: [createApiRequestCondition()]
      },
      AutoRefreshTokenService, 
      UserActivityService,
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideHttpClient(withInterceptors([includeBearerTokenInterceptor]))  
    ]
  };
