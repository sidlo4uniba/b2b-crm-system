import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';


export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.log('Unauthorized request. Redirecting to login page...');
        router.navigate(['/']);
      }
      if (error.status === 403) {
        console.log('Forbidden request. Redirecting to unauthorized page...');
        router.navigate(['/unauthorized']);
      }
      
      return throwError(() => error);
    })
  );
}; 