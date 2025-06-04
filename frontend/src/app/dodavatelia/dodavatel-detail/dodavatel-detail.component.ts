import { Component, OnInit, ViewChild, OnDestroy, Inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, of, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError, finalize, take, tap } from 'rxjs/operators';

import { DodavatelDetailDTO, DodavatelDTO, UpdateDodavatelCommand, CreateDodavatelCommand, CreateDodavatelResponse, UpdateDodavatelAktivnyCommand } from '../../shared/services/http-clients/dodavatelia/dodavatel-http-client.models';
import { DodavatelHttpClientService } from '../../shared/services/http-clients/dodavatelia/dodavatel-http-client.service';
import { TovarDTO, PaginatedList } from '../../shared/services/http-clients/tovary/tovary-http-client.models';
import { TovaryHttpClientService } from '../../shared/services/http-clients/tovary/tovary-http-client.service';
import { KategorieProduktovHttpClientService } from '../../shared/services/http-clients/kategorie-produktov/kategorie-produktov-http-client.service';
import { KategoriaProduktuDTO } from '../../shared/services/http-clients/kategorie-produktov/kategorie-produktov-http-client.models';
import { DodavatelTovaryHttpClientService } from '../../shared/services/http-clients/dodavatel-tovary/dodavatel-tovary-http-client.service';
import { UpdateTovarAktivnyCommand } from '../../shared/services/http-clients/dodavatel-tovary/dodavatel-tovary-http-client.models';


@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  template: `
    <div class="confirm-dialog-container">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <div mat-dialog-content>
        <p [innerHTML]="data.message"></p>
      </div>
      <div mat-dialog-actions align="end">
        <button mat-button (click)="onNoClick()" cdkFocusInitial>Nie</button>
        <button mat-flat-button [color]="data.confirmButtonColor || 'primary'" (click)="onYesClick()">
          {{ data.confirmButtonText || 'Áno' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog-container {
      min-width: 400px;
    }
    div[mat-dialog-content] p {
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    div[mat-dialog-actions] {
      justify-content: flex-end;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string,
      message: string,
      confirmButtonText?: string,
      confirmButtonColor?: 'primary' | 'accent' | 'warn'
    }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
} 


export interface MessageDialogData {
  title: string;
  message: string;
  icon: string;
  iconColor: 'primary' | 'accent' | 'warn';
}


@Component({
  selector: 'app-message-dialog',
  template: `
    <div class="message-dialog-container">
      <h1 mat-dialog-title class="message-title" [style.color]="getIconColor()">
        <mat-icon [color]="data.iconColor">{{ data.icon }}</mat-icon>
        {{ data.title }}
      </h1>
      <div mat-dialog-content>
        <p>{{ data.message }}</p>
      </div>
      <div mat-dialog-actions align="end">
        <button mat-flat-button [color]="data.iconColor" (click)="onCloseClick()">Zavrieť</button>
      </div>
    </div>
  `,
  styles: [`
    .message-dialog-container {
        min-width: 400px;
    }
    .message-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }
    mat-icon {
      vertical-align: middle;
    }
  `],
  standalone: true,
  imports: [  MatDialogModule, MatButtonModule, MatIconModule, CommonModule ]
})
export class MessageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageDialogData
  ) {}

  onCloseClick(): void {
    this.dialogRef.close();
  }

  getIconColor(): string {
    switch (this.data.iconColor) {
      case 'primary': return 'var(--primary-color)';
      case 'accent': return 'var(--accent-color)';
      case 'warn': return '#f44336';
      default: return 'inherit';
    }
  }
}


export function priceRangeValidator(control: AbstractControl): ValidationErrors | null {
  const cenaOd = control.get('cenaOd');
  const cenaDo = control.get('cenaDo');

  
  if (cenaOd && cenaDo && cenaOd.value !== null && cenaDo.value !== null) {
    
    const odValue = Number(cenaOd.value);
    const doValue = Number(cenaDo.value);

    if (!isNaN(odValue) && !isNaN(doValue) && doValue < odValue) {
      
      
      return { priceRangeInvalid: true };
    }
  }

  return null; 
}

@Component({
  selector: 'app-dodavatel-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    MatTooltipModule,
    MatChipsModule,
    MatExpansionModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dodavatel-detail.component.html',
  styleUrls: [
    '../../shared/styles/detail-table-default.css'
  ]
})
export class DodavatelDetailComponent implements OnInit, OnDestroy {

  
  currentEntityId: number | null = null;
  isAddMode = false;
  pageTitle = 'Detail dodávateľa';
  isSaving = false;
  isLoadingData = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  
  detailForm!: FormGroup;
  private formChangedSubject = new BehaviorSubject<boolean>(false);
  formChanged$ = this.formChangedSubject.asObservable();
  private detailsSubject = new BehaviorSubject<DodavatelDetailDTO | null>(null);
  details$ = this.detailsSubject.asObservable();

  
  displayedColumns: string[] = ['interneId', 'nazov', 'kategoriaId', 'ean', 'cena', 'aktivny', 'akcie'];
  tableDataSource = new MatTableDataSource<TovarDTO>([]);
  totalItems = 0;
  pageSize = 25;
  pageSizeOptions: number[] = [25, 50, 100];
  isLoadingTable = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  
  filterForm!: FormGroup;
  isFilterExpanded = false;
  searchValue = '';
  kategorieProduktov: KategoriaProduktuDTO[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private dodavatelHttpClient: DodavatelHttpClientService,
    private tovaryHttpClient: TovaryHttpClientService,
    private kategorieService: KategorieProduktovHttpClientService,
    private dodavatelTovaryHttpClient: DodavatelTovaryHttpClientService,
    private location: Location
  ) {
    this.initializeForm();
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.isLoadingData = true;

    this.formChanged$.pipe(takeUntil(this.destroy$)).subscribe(changed => {
       
    });

    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const idParam = params.get('id');
        if (idParam === 'pridat') {
          this.isAddMode = true;
          this.pageTitle = 'Pridať nového dodávateľa';
          this.currentEntityId = null;
          this.resetForm();
          this.isLoadingData = false;
          return of(null);
        } else if (idParam) {
          this.isAddMode = false;
          this.pageTitle = 'Detail dodávateľa';
          this.currentEntityId = +idParam;
          return this.loadEntityDetails(this.currentEntityId).pipe(
             catchError(err => {
                this.showMessageDialog(
                  'Chyba pri načítaní dát dodávateľa',
                  `Nepodarilo sa načítať údaje dodávateľa (ID: ${this.currentEntityId}). Skúste sa vrátiť na domovskú stránku alebo kontaktujte administrátora.`,
                  'error',
                  'warn'
                );
                console.error("Error loading entity details:", err);
                return of(null);
             })
          );
        } else {
          console.warn('No entity ID found in route parameters, redirecting.');
          this.router.navigate(['/dodavatelia']);
          this.isLoadingData = false;
          return of(null);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(details => {
        if (!this.isAddMode && details) {
           console.log('Entity details loaded successfully.');
           this.setupTable();
           this.loadCategories();
        } else if (this.isAddMode) {
            
        }
        this.isLoadingData = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.detailForm = this.formBuilder.group({
      nazovFirmy: ['', [Validators.required, Validators.maxLength(200)]],
      email: ['', [Validators.required, Validators.email]],
      telefon: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{9,15}$/)]],
      adresa: this.formBuilder.group({
        ulica: ['', [Validators.required, Validators.pattern(/.*\d.*/)]],
        mesto: ['', Validators.required],
        psc: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        krajina: ['Slovensko', Validators.required]
      }),
      poznamka: [''],
    });

    this.detailForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.detailForm.pristine) {
         this.formChangedSubject.next(true);
      }
    });
  }

  loadEntityDetails(id: number): Observable<DodavatelDetailDTO> {
    this.isLoadingData = true;
    return this.dodavatelHttpClient.getById(id).pipe(
      tap(details => {
        console.log("Loaded details:", details);
        this.detailsSubject.next(details);

        this.detailForm.patchValue({
          nazovFirmy: details.nazovFirmy,
          email: details.email,
          telefon: details.telefon,
          adresa: details.adresa ?? { ulica: '', mesto: '', psc: '', krajina: 'Slovensko' },
          poznamka: details.poznamka,
        });

        this.resetFormChangeState();
        this.detailForm.markAsPristine();
        this.detailForm.markAsUntouched();
      }),
      catchError(error => {
        console.error("Error loading entity details:", error);
        this.detailsSubject.next(null);
        throw error;
      }),
      finalize(() => this.isLoadingData = false )
    );
  }

  resetFormChangeState(): void {
    this.formChangedSubject.next(false);
  }

  getCurrentDetails(): DodavatelDetailDTO | null {
    return this.detailsSubject.getValue();
  }

  resetForm(): void {
    if (this.isAddMode) {
        this.detailForm.reset({ adresa: { krajina: 'Slovensko' } });
    } else {
        const currentDetails = this.getCurrentDetails();
        if (currentDetails) {
          this.detailForm.patchValue({
            nazovFirmy: currentDetails.nazovFirmy,
            email: currentDetails.email,
            telefon: currentDetails.telefon,
            adresa: currentDetails.adresa ?? { ulica: '', mesto: '', psc: '', krajina: 'Slovensko' },
            poznamka: currentDetails.poznamka,
          });
        } else {
          this.detailForm.reset({ adresa: { krajina: 'Slovensko' } });
          console.warn('No current details found for edit reset.');
        }
    }
    this.resetFormChangeState();
    this.detailForm.markAsPristine();
    this.detailForm.markAsUntouched();
  }

  saveForm(): void {
    this.detailForm.markAllAsTouched();
    if (this.detailForm.invalid) {
       const message = this.isAddMode ? 'Skontrolujte povinné polia alebo opravte nesprávne vyplnené údaje vo formulári.' : 'Opravte chyby vo formulári dodávateľa.';
       this.showMessageDialog('Opravte chyby vo formulári', message, 'warning', 'warn');
       return;
    }
    if (this.isSaving) return;
    this.isSaving = true;

    const formValue = this.detailForm.getRawValue();

    if (this.isAddMode) {
        const createCommand: CreateDodavatelCommand = {
            nazovFirmy: formValue.nazovFirmy,
            email: formValue.email,
            telefon: formValue.telefon,
            adresa: {
                ulica: formValue.adresa.ulica,
                mesto: formValue.adresa.mesto,
                psc: formValue.adresa.psc,
                krajina: formValue.adresa.krajina
            },
            poznamka: formValue.poznamka || null,
            aktivny: true
        };

        this.dodavatelHttpClient.create(createCommand).pipe(
            takeUntil(this.destroy$),
            finalize(() => this.isSaving = false)
        ).subscribe({
            next: (response: CreateDodavatelResponse) => {
                this.showMessageDialog('Dodávateľ pridaný', 'Nový dodávateľ bol úspešne vytvorený.', 'check_circle', 'primary');
                this.router.navigate(['/dodavatelia', response.id]);
            },
            error: (error) => {
                console.error('Chyba pri vytváraní dodávateľa:', error);
                this.showMessageDialog('Problém pri pridávaní', 'Pri vytváraní nového dodávateľa sa vyskytla chyba.', 'error', 'warn');
            }
        });

    } else {
        if (!this.currentEntityId) {
            this.showMessageDialog('Interná chyba', 'Chýba ID dodávateľa pre uloženie.', 'error', 'warn');
            this.isSaving = false;
            return;
        }
        const updateCommand: UpdateDodavatelCommand = {
            id: this.currentEntityId,
            nazovFirmy: formValue.nazovFirmy,
            email: formValue.email,
            telefon: formValue.telefon,
            adresa: {
                ulica: formValue.adresa.ulica,
                mesto: formValue.adresa.mesto,
                psc: formValue.adresa.psc,
                krajina: formValue.adresa.krajina
            },
            poznamka: formValue.poznamka || null
        };

        this.dodavatelHttpClient.update(this.currentEntityId, updateCommand).pipe(
            takeUntil(this.destroy$),
            switchMap(() => {
                if (this.currentEntityId !== null) {
                   return this.loadEntityDetails(this.currentEntityId);
                } else {
                   return of(null);
                }
            }),
            finalize(() => this.isSaving = false)
        ).subscribe({
            next: () => {
                this.showMessageDialog('Úspešné uloženie', 'Údaje dodávateľa boli úspešne uložené.', 'check_circle', 'primary');
            },
            error: (error) => {
                console.error('Chyba pri aktualizácii dodávateľa:', error);
                this.showMessageDialog('Problém pri ukladaní zmien', 'Pri ukladaní údajov dodávateľa sa vyskytla chyba.', 'error', 'warn');
            }
        });
    }
  }

  setupTable(): void {
     this.searchSubject.pipe(
       debounceTime(400),
       distinctUntilChanged(),
       takeUntil(this.destroy$)
     ).subscribe(value => {
       this.searchValue = value;
       if (this.paginator) {
           this.paginator.pageIndex = 0;
       }
       this.loadTableData();
     });

     if (this.paginator && this.sort) {
       
       this.sort.active = 'interneId';
       this.sort.direction = 'desc';
       this.sort.sortChange.emit({ active: 'interneId', direction: 'desc' });

       this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
           this.paginator.pageIndex = 0;
           this.loadTableData();
       });

       this.paginator.page.pipe(takeUntil(this.destroy$)).subscribe(() => {
           this.loadTableData();
       });
     } else {
         console.warn("Paginator or Sort not available at setupTable call time.");
     }
     this.loadTableData();
  }

  loadTableData(): void {
    if (this.isAddMode || this.currentEntityId === null) {
        console.log("Skipping table load: Add mode or no entity ID.");
        this.tableDataSource.data = [];
        this.totalItems = 0;
        return;
    }

    this.isLoadingTable = true;
    const pageIndex = this.paginator ? this.paginator.pageIndex : 0;
    const pageSize = this.paginator ? this.paginator.pageSize : this.pageSize;
    const sortActive = this.sort ? this.sort.active : undefined;
    const sortDirection = this.sort ? this.sort.direction : undefined;
    const filterParams = this.buildFilterQueryParams();

    this.fetchTableData(
      this.currentEntityId,
      pageIndex,
      pageSize,
      sortActive && sortDirection ? { active: sortActive, direction: sortDirection } : undefined,
      this.searchValue,
      filterParams
    ).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
         console.error("Error loading table data:", err);
         this.showMessageDialog('Chyba pri načítaní tovarov', 'Nepodarilo sa načítať zoznam tovarov pre tohto dodávateľa.', 'error', 'warn');
         return of({ items: [], totalCount: 0, pageNumber: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false });
      }),
      finalize(() => this.isLoadingTable = false)
    ).subscribe(result => {
      this.tableDataSource.data = result.items ?? [];
      this.totalItems = result.totalCount ?? 0;
    });
  }

  fetchTableData(
    dodavatelId: number,
    page: number,
    pageSize: number,
    sort?: { active: string, direction: string },
    searchValue?: string,
    filterParams?: any
  ): Observable<PaginatedList<TovarDTO>> {

    let params: { [key: string]: any } = {
      page: page + 1,
      pageSize: pageSize
    };

    if (sort && sort.active && sort.direction) {
      params['orderBy'] = sort.direction === 'desc' ? `${sort.active}-` : sort.active;
    }

    if (searchValue) {
      params['search'] = searchValue;
    }

    let filterStringParts: string[] = [];
    if (filterParams) {
        const validFilterKeys = ['kategoriaId', 'cenaOd', 'cenaDo', 'aktivny'];
        for (const key in filterParams) {
            if (validFilterKeys.includes(key) && filterParams[key] !== null && filterParams[key] !== undefined && filterParams[key] !== '') {
                if (key === 'aktivny') {
                    const aktivnyBool = filterParams[key] === 'aktivne';
                    filterStringParts.push(`aktivny=${aktivnyBool}`);
                } else if (key === 'cenaOd') {
                    filterStringParts.push(`cena=>${filterParams[key]}`);
                } else if (key === 'cenaDo') {
                    filterStringParts.push(`cena=<${filterParams[key]}`);
                } else {
                    filterStringParts.push(`${key}=${filterParams[key]}`);
                }
            }
        }
    }

    filterStringParts.push(`dodavatelId=${dodavatelId}`);

    const filterString = filterStringParts.join('&');

    return this.tovaryHttpClient.getList(
        params['pageSize'],
        params['page'],
        params['orderBy'],
        params['search'],
        filterString
    );
  }

  initializeFilterForm(): void {
    this.filterForm = this.formBuilder.group({
      kategoriaId: [null],
      cenaOd: [null, [Validators.min(0)]],
      cenaDo: [null, [Validators.min(0)]],
      aktivny: ['vsetky']
    }, { validators: priceRangeValidator });
  }

  buildFilterQueryParams(): any {
    if (this.filterForm.invalid) {
        console.warn("Filter form is invalid. Not building query params.");
        const errors = this.filterForm.errors;
        if (errors?.['priceRangeInvalid']) {
            this.showMessageDialog('Chyba filtra', 'Cena "Do" nemôže byť menšia ako cena "Od".', 'warning', 'warn');
        }
        return {};
    }

    const formValues = this.filterForm.value;
    const params: any = {};

    if (formValues.kategoriaId) params.kategoriaId = formValues.kategoriaId;
    if (formValues.cenaOd !== null && formValues.cenaOd !== '') params.cenaOd = formValues.cenaOd;
    if (formValues.cenaDo !== null && formValues.cenaDo !== '') params.cenaDo = formValues.cenaDo;
    if (formValues.aktivny && formValues.aktivny !== 'vsetky') {
       params.aktivny = formValues.aktivny;
    }

    console.log("Built Filter Params:", params);
    return params;
  }

  getFilterValues(): any {
    return this.filterForm.value;
  }

  resetFilters(): void {
    this.filterForm.reset({
        kategoriaId: null,
        cenaOd: null,
        cenaDo: null,
        aktivny: 'vsetky'
    });
    this.filterForm.markAsPristine();
    this.filterForm.markAsUntouched();
    this.searchValue = '';
    const searchInput = document.querySelector('.search-field input') as HTMLInputElement;
    if (searchInput) searchInput.value = '';
    this.searchSubject.next('');

    this.applyFilters();
  }

  clearFilterField(fieldName: string): void {
    this.filterForm.get(fieldName)?.setValue(null);
  }

  applyFilters(): void {
     console.log('Filters applied:', this.getFilterValues());
     if (this.filterForm.invalid) {
         console.warn("Cannot apply invalid filters.");
         if (!this.filterForm.errors?.['priceRangeInvalid']) {
             this.showMessageDialog('Chyba filtra', 'Opravte neplatné hodnoty vo filtri.', 'warning', 'warn');
         }
         return;
     }
     if (this.paginator) {
         this.paginator.pageIndex = 0;
     }
     this.loadTableData();
  }

  applyTableSearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  onTablePageChange(event: PageEvent): void {
  }

  onTableSortChange(sort: Sort): void {
    console.log('Sort changed:', sort);
  }

  editItem(tovarId: number): void {
    if (this.currentEntityId !== null) {
      this.router.navigate(['/dodavatelia', this.currentEntityId, 'tovary', tovarId]);
      console.log(`Navigate to edit Tovar with ID: ${tovarId} for Dodavatel ID: ${this.currentEntityId}`);
    } else {
      console.error("Cannot navigate to edit Tovar: Missing current Dodavatel ID.");
      this.showMessageDialog('Chyba', 'Chýba ID dodávateľa pre navigáciu na detail tovaru.', 'error', 'warn');
    }
  }

  addItem(): void {
    if (this.currentEntityId !== null) {
      this.router.navigate(['/dodavatelia', this.currentEntityId, 'tovary', 'pridat']);
      console.log(`Navigate to add new Tovar for Dodavatel ID: ${this.currentEntityId}`);
    } else {
      console.error("Cannot navigate to add Tovar: Missing current Dodavatel ID.");
      this.showMessageDialog('Chyba', 'Chýba ID dodávateľa pre navigáciu na pridanie tovaru.', 'error', 'warn');
    }
  }

  loadCategories(): void {
    this.kategorieService.getList()
      .pipe(takeUntil(this.destroy$), catchError(err => {
          console.error("Error loading kategorie produktov:", err);
          this.showMessageDialog('Chyba', 'Nepodarilo sa načítať kategórie produktov pre filter.', 'error', 'warn');
          return of([]);
      }))
      .subscribe((response: KategoriaProduktuDTO[]) => {
        this.kategorieProduktov = response ?? [];
      });
  }

  getCategoryName(id: number | null): string {
      if (id === null) return 'N/A';
      const kategoria = this.kategorieProduktov.find(k => k.id === id);
      return kategoria ? kategoria.nazov : `Neznáma (${id})`;
  }

  get isEmptyTable(): boolean {
    return this.tableDataSource.data.length === 0 && !this.isLoadingTable;
  }

  toggleFilterPanel(isExpanded: boolean): void {
    this.isFilterExpanded = isExpanded;
  }

  toggleAktivnyStatus(): void {
    if (this.isAddMode || !this.currentEntityId) {
      console.warn('Cannot change status in add mode or without an ID.');
      return;
    }

    this.details$.pipe(take(1)).subscribe(details => {
      if (!details) {
        this.showMessageDialog('Chyba', 'Nepodarilo sa načítať aktuálny stav dodávateľa.', 'error', 'warn');
        return;
      }

      const currentStatus = details.aktivny;
      const newStatus = !currentStatus;
      const actionText = newStatus ? 'aktivovať' : 'deaktivovať';
      const entityName = details.nazovFirmy || `ID ${this.currentEntityId}`;

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: `Potvrdenie ${actionText === 'aktivovať' ? 'aktivácie' : 'deaktivácie'}`,
          message: `Naozaj chcete ${actionText} dodávateľa "${entityName}"? <strong>Zmena stavu ovplyvní aj všetky priradené tovary a ich varianty.</strong>`,
          confirmButtonText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          confirmButtonColor: 'primary'
        }
      });

      dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
        if (result && this.currentEntityId) {
          const command: UpdateDodavatelAktivnyCommand = {
            id: this.currentEntityId,
            aktivny: newStatus
          };
          this.isSaving = true;
          this.dodavatelHttpClient.updateAktivny(this.currentEntityId, command).pipe(
            switchMap(() => {
                if (this.currentEntityId !== null) {
                   return this.loadEntityDetails(this.currentEntityId);
                } else {
                   return of(null);
                }
            }),
            finalize(() => this.isSaving = false),
            takeUntil(this.destroy$)
          ).subscribe({
            next: () => {
              this.showMessageDialog(
                'Stav aktualizovaný',
                `Dodávateľ "${entityName}" bol úspešne ${newStatus ? 'aktivovaný' : 'deaktivovaný'}. Táto zmena ovplyvnila aj stav všetkých priradených tovarov a ich variantov.`,
                'check_circle',
                'primary'
              );
            },
            error: (error) => {
              console.error(`Chyba pri ${actionText === 'aktivovať' ? 'aktivácii' : 'deaktivácii'} dodávateľa:`, error);
              this.showMessageDialog(
                'Chyba',
                `Nepodarilo sa ${actionText} dodávateľa "${entityName}".`,
                'error',
                'warn'
              );
            }
          });
        }
      });
    });
  }

  confirmDelete(): void {
     if (this.isAddMode || !this.currentEntityId) {
       console.warn('Cannot delete in add mode or without an ID.');
       return;
     }

     this.details$.pipe(take(1)).subscribe(details => {
        const entityName = details?.nazovFirmy || `ID ${this.currentEntityId}`;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Vymazať dodávateľa',
            message: `Táto akcia je <strong style="color: red;">nezvratná</strong>. Táto akcia <strong style="color: red;">odstráni aj všetky priradené tovary a ich varianty</strong>. Naozaj chcete natrvalo vymazať dodávateľa "${entityName}"?`,
            confirmButtonText: 'Vymazať',
            confirmButtonColor: 'warn'
          }
        });

        dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
          if (result && this.currentEntityId) {
            this.isSaving = true;
            this.dodavatelHttpClient.delete(this.currentEntityId).pipe(
                finalize(() => this.isSaving = false),
                takeUntil(this.destroy$)
            ).subscribe({
                next: () => {
                    this.showMessageDialog(
                        'Dodávateľ vymazaný',
                        `Dodávateľ "${entityName}" bol úspešne vymazaný.`,
                        'check_circle',
                        'primary'
                    );
                    this.router.navigate(['/dodavatelia']);
                },
                error: (error) => {
                    console.error('Chyba pri mazaní dodávateľa:', error);
                    let errorMessage = `Nepodarilo sa vymazať dodávateľa "${entityName}".`;
                    if (error.status === 409) {
                        errorMessage = `Dodávateľa "${entityName}" nie je možné vymazať, pretože dodávateľ má priradený tovar, ktorý sa nachádza v cenových ponukách. Odporúčame namiesto toho dodávateľa deaktivovať.`;
                    } else {
                        errorMessage += ' Skúste akciu zopakovať alebo kontaktujte administrátora.';
                    }
                    this.showMessageDialog('Chyba pri mazaní', errorMessage, 'error', 'warn');
                }
            });
          }
        });
     });
  }

  showMessageDialog(title: string, message: string, icon: string, iconColor: 'primary' | 'accent' | 'warn'): void {
    this.dialog.open(MessageDialogComponent, {
      data: { title, message, icon, iconColor }
    });
  }

  goBack(): void {
    if (this.formChangedSubject.getValue()) {
         console.log("Form has changes, navigating back.");
         this.router.navigate(['/dodavatelia']);
    } 
    else {
      this.router.navigate(['/dodavatelia']);
    }
  }

  normalizeString(str: string): string {
    const diacriticsMap: { [key: string]: string } = {
      'á': 'a', 'ä': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'í': 'i',
      'ĺ': 'l', 'ľ': 'l', 'ň': 'n', 'ó': 'o', 'ô': 'o', 'ŕ': 'r',
      'š': 's', 'ť': 't', 'ú': 'u', 'ý': 'y', 'ž': 'z',
      'Á': 'A', 'Ä': 'A', 'Č': 'C', 'Ď': 'D', 'É': 'E', 'Í': 'I',
      'Ĺ': 'L', 'Ľ': 'L', 'Ň': 'N', 'Ó': 'O', 'Ô': 'O', 'Ŕ': 'R',
      'Š': 'S', 'Ť': 'T', 'Ú': 'U', 'Ý': 'Y', 'Ž': 'Z'
    };
    return str.split('').map(char => diacriticsMap[char] || char).join('').toLowerCase();
  }

  
  toggleAktivnyStatusTovar(tovarId: number, currentStatus: boolean, tovarNazov: string): void {
    if (this.currentEntityId === null) {
      console.error("Cannot toggle tovar status: Missing current Dodavatel ID.");
      this.showMessageDialog('Interná chyba', 'Chýba ID dodávateľa pre zmenu stavu tovaru.', 'error', 'warn');
      return;
    }

    const newStatus = !currentStatus;
    const actionText = newStatus ? 'aktivovať' : 'deaktivovať';
    const confirmTitle = newStatus ? 'Potvrdenie aktivácie tovaru' : 'Potvrdenie deaktivácie tovaru';
    const confirmMessage = `Naozaj chcete ${actionText} tovar "${tovarNazov}"? <strong>Zároveň sa zmení aj stav všetkých variantov tohto tovaru.</strong>`;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: confirmTitle,
        message: confirmMessage,
        confirmButtonText: newStatus ? 'Aktivovať' : 'Deaktivovať',
        confirmButtonColor: newStatus ? 'primary' : 'warn'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        const command: UpdateTovarAktivnyCommand = {
          dodavatelId: this.currentEntityId!,
          tovarId: tovarId,
          aktivny: newStatus
        };
        this.dodavatelTovaryHttpClient.updateAktivny(this.currentEntityId!, tovarId, command).pipe(
          finalize(() => {  }),
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.showMessageDialog(
              'Stav tovaru aktualizovaný',
              `Tovar "${tovarNazov}" bol úspešne ${newStatus ? 'aktivovaný' : 'deaktivovaný'}. Táto zmena ovplyvnila aj stav všetkých variantov tohto tovaru.`,
              'check_circle',
              'primary'
            );
            this.loadTableData();
          },
          error: (error) => {
            console.error(`Chyba pri ${actionText === 'aktivovať' ? 'aktivácii' : 'deaktivácii'} tovaru:`, error);
            this.showMessageDialog(
              'Chyba',
              `Nepodarilo sa ${actionText} tovar "${tovarNazov}". Skúste akciu zopakovať alebo kontaktujte administrátora.`,
              'error',
              'warn'
            );
          }
        });
      }
    });
  }

  
  confirmDeleteTovar(tovarId: number, tovarNazov: string): void {
     if (this.currentEntityId === null) {
      console.error("Cannot delete tovar: Missing current Dodavatel ID.");
      this.showMessageDialog('Interná chyba', 'Chýba ID dodávateľa pre vymazanie tovaru.', 'error', 'warn');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Vymazať tovar',
        message: `Naozaj chcete natrvalo vymazať tento tovar? <strong>Zároveň sa vymažú aj všetky varianty tohto tovaru.</strong>`,
        confirmButtonText: 'Vymazať',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.dodavatelTovaryHttpClient.delete(this.currentEntityId!, tovarId).pipe(
          finalize(() => {  }),
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.showMessageDialog('Tovar vymazaný', 'Tovar bol úspešne vymazaný vrátane všetkých jeho variantov.', 'check_circle', 'primary');
            this.loadTableData();
          },
          error: (error) => {
            console.error('Chyba pri mazaní tovaru:', error);
            let errorMessage = 'Pri mazaní tovaru sa vyskytla chyba.';
            if (error.status === 409) {
              errorMessage = 'Tovar nie je možné vymazať, pretože je použitý v cenových ponukách.';
            } else {
              errorMessage += ' Skúste akciu zopakovať alebo kontaktujte administrátora.';
            }
            this.showMessageDialog('Problém pri mazaní', errorMessage, 'error', 'warn');
          }
        });
      }
    });
  }
}
