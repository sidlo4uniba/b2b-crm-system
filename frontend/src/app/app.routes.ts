import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { FirmyListOldComponent } from './firmy/firmy-list-old/firmy-list-old.component';
import { DodavatelDetailComponent } from './dodavatelia/dodavatel-detail/dodavatel-detail.component';
import { TovarDetailComponent } from './tovary/tovar-detail/tovar-detail.component';
import { FirmaDetailComponent } from './firmy/firma-detail/firma-detail.component';
import { TovaryListComponent } from './tovary/tovary-list/tovary-list.component';
import { FirmyListComponent } from './firmy/firmy-list/firmy-list.component';
import { DodavatelListComponent } from './dodavatelia/dodavatel-list/dodavatel-list.component';
import { ObjednavkaDetailComponent } from './objednavky/objednavka-detail/objednavka-detail.component';
import { ObjednavkyListComponent } from './objednavky/objednavky-list/objednavky-list.component';
import { authGuard } from './auth/auth.guard';
import { Roles } from './auth/roles';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'unauthorized', component: UnauthorizedComponent, data: { title: 'Prístup zamietnutý' } },

  { 
    path: 'firmy', 
    component: FirmyListComponent, 
    canActivate: [authGuard], 
    data: { roles: [Roles.ADMIN, Roles.OBCHODNIK], title: 'Firmy' }
  },
  { 
    path: 'firmy/:id', 
    component: FirmaDetailComponent, 
    canActivate: [authGuard], 
    data: { roles: [Roles.ADMIN, Roles.OBCHODNIK], title: 'Detail firmy' }
  },
  { 
    path: 'firmy/pridat', 
    component: FirmaDetailComponent, 
    canActivate: [authGuard], 
    data: { roles: [Roles.ADMIN, Roles.OBCHODNIK], title: 'Pridať firmu' }
  },

  { 
    path: 'dodavatelia', 
    component: DodavatelListComponent, 
    canActivate: [authGuard], 
    data: { roles: [Roles.ADMIN, Roles.SKLADNIK], title: 'Dodávatelia' }
  },
  { 
    path: 'dodavatelia/:id', 
    component: DodavatelDetailComponent, 
    canActivate: [authGuard], 
    data: { roles: [Roles.ADMIN, Roles.SKLADNIK], title: 'Detail dodávateľa' }
  },
  { 
    path: 'dodavatelia/pridat', 
    component: DodavatelDetailComponent, 
    canActivate: [authGuard], 
    data: { roles: [Roles.ADMIN, Roles.SKLADNIK], title: 'Pridať dodávateľa' }
  },

  { 
    path: 'tovary', 
    component: TovaryListComponent, 
    canActivate: [authGuard], 
    data: { roles: [Roles.ADMIN, Roles.SKLADNIK], title: 'Tovary' }
  },
  { 
    path: 'dodavatelia/:dodavatelId/tovary/pridat', 
    component: TovarDetailComponent, 
    canActivate: [authGuard], 
    data: { roles: [Roles.ADMIN, Roles.SKLADNIK], title: 'Pridať tovar' }
  },
  { 
    path: 'dodavatelia/:dodavatelId/tovary/:tovarId', 
    component: TovarDetailComponent, 
    canActivate: [authGuard], 
    data: { roles: [Roles.ADMIN, Roles.SKLADNIK], title: 'Detail tovaru' }
  },

  { 
    path: 'objednavky', 
    component: ObjednavkyListComponent, 
    canActivate: [authGuard], 
    data: { roles: [Roles.ADMIN, Roles.OBCHODNIK, Roles.SKLADNIK], title: 'Objednávky' }
  },
  { 
    path: 'objednavky/:id', 
    component: ObjednavkaDetailComponent, 
    canActivate: [authGuard], 
    data: { roles: [Roles.ADMIN, Roles.OBCHODNIK, Roles.SKLADNIK], title: 'Detail objednávky' }
  },
  { path: '**', component: NotFoundComponent, data: { title: 'Stránka nenájdená' } }
];
