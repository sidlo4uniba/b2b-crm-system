import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import { Roles, AccessControl } from './roles';


const hasAnyRole = (userRoles: string[], requiredRoles: string[]): boolean => {
  return requiredRoles.some(role => userRoles.includes(role));
};


const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;
  const router = inject(Router);
  
  
  if (!authenticated) {
    return router.parseUrl('/');
  }

  
  if (!route.data['roles']) {
    return true;
  }

  
  const requiredRoles: string[] = route.data['roles'];
  const hasRequiredRoles = hasAnyRole(grantedRoles.realmRoles, requiredRoles);

  
  const url = state.url.split('/')[1]; 
  let hasAccessToSection = true;

  if (url) {
    
    hasAccessToSection = Object.entries(AccessControl).some(([role, sections]) => {
      return grantedRoles.realmRoles.includes(role) && sections.includes(url);
    });
  }

  if (hasRequiredRoles && hasAccessToSection) {
    return true;
  }

  
  return router.parseUrl('/unauthorized');
};


export const authGuard: CanActivateFn = createAuthGuard(isAccessAllowed); 