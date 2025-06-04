import { Component, OnInit, ViewChild, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, of, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError, finalize, take, tap } from 'rxjs/operators';

import { TovarDTO, PaginatedList } from '../../shared/services/http-clients/tovary/tovary-http-client.models';
import { TovaryHttpClientService } from '../../shared/services/http-clients/tovary/tovary-http-client.service';
import { DodavatelTovaryHttpClientService } from '../../shared/services/http-clients/dodavatel-tovary/dodavatel-tovary-http-client.service';
import { UpdateTovarAktivnyCommand } from '../../shared/services/http-clients/dodavatel-tovary/dodavatel-tovary-http-client.models';
import { KategorieProduktovHttpClientService } from '../../shared/services/http-clients/kategorie-produktov/kategorie-produktov-http-client.service';
import { KategoriaProduktuDTO } from '../../shared/services/http-clients/kategorie-produktov/kategorie-produktov-http-client.models';


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
  imports: [ MatDialogModule, MatButtonModule, MatIconModule, CommonModule ]
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
  selector: 'app-tovary-list',
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
    ReactiveFormsModule,
    FormsModule,
    MatTooltipModule,
    MatChipsModule,
    MatExpansionModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MessageDialogComponent
  ],
  templateUrl: './tovary-list.component.html',
  styleUrls: [
    '../../shared/styles/detail-table-default.css'
  ]
})
export class TovaryListComponent implements OnInit, OnDestroy {

  pageTitle = 'Zoznam všetkých tovarov';
  isLoadingData = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

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
    private dialog: MatDialog,
    private tovaryHttpClient: TovaryHttpClientService,
    private kategorieService: KategorieProduktovHttpClientService,
    private dodavatelTovaryHttpClient: DodavatelTovaryHttpClientService
  ) {
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.isLoadingData = true;

    this.setupTable();
    this.loadCategories();

    this.isLoadingData = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

     setTimeout(() => {
        if (this.paginator && this.sort) {
          this.sort.active = 'interneId';
          this.sort.direction = 'desc';

          this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
              if (this.paginator) this.paginator.pageIndex = 0;
              this.loadTableData();
          });

          this.paginator.page.pipe(takeUntil(this.destroy$)).subscribe(() => {
              this.loadTableData();
          });

          this.loadTableData();

        } else {
            console.warn("Paginator or Sort not available at setupTable call time.");
            this.loadTableData();
        }
     });
  }

  loadTableData(): void {
    this.isLoadingTable = true;
    const pageIndex = this.paginator ? this.paginator.pageIndex : 0;
    const pageSize = this.paginator ? this.paginator.pageSize : this.pageSize;
    const sortActive = this.sort ? this.sort.active : 'interneId';
    const sortDirection = this.sort ? this.sort.direction : 'desc';
    const filterParams = this.buildFilterQueryParams();

    this.fetchTableData(
      pageIndex,
      pageSize,
      sortActive && sortDirection ? { active: sortActive, direction: sortDirection } : undefined,
      this.searchValue,
      filterParams
    ).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
         console.error("Error loading table data:", err);
         this.showMessageDialog('Chyba pri načítaní tovarov', 'Nepodarilo sa načítať zoznam tovarov.', 'error', 'warn');
         return of({ items: [], totalCount: 0, pageNumber: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false });
      }),
      finalize(() => {
          this.isLoadingTable = false;
          this.isLoadingData = false;
      })
    ).subscribe(result => {
      this.tableDataSource.data = result.items ?? [];
      this.totalItems = result.totalCount ?? 0;
    });
  }

  fetchTableData(
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
    } else {
      params['orderBy'] = 'interneId-';
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

    const filterString = filterStringParts.join('&');
    console.log("Filter string:", filterString);

    return this.tovaryHttpClient.getList(
        params['pageSize'],
        params['page'],
        params['orderBy'],
        params['search'],
        filterString || undefined
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
         if (this.filterForm.hasError('priceRangeInvalid')) {
             this.showMessageDialog('Chyba filtra', 'Cena "Do" musí byť väčšia alebo rovná cene "Od".', 'warning', 'warn');
         } else {
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

  
  editItem(tovarId: number, dodavatelId: number): void {
    
    if (dodavatelId) {
      this.router.navigate(['/dodavatelia', dodavatelId, 'tovary', tovarId]);
      console.log(`Navigate to edit Tovar with ID: ${tovarId} for Dodavatel ID: ${dodavatelId}`);
    } else {
      
      console.error("Cannot navigate to edit Tovar: Missing Dodavatel ID in the data for Tovar ID:", tovarId);
      this.showMessageDialog('Chyba', 'Chýba ID dodávateľa pre navigáciu na detail tovaru.', 'error', 'warn');
    }
  }

  
  toggleAktivnyStatus(tovarId: number, dodavatelId: number, currentStatus: boolean, tovarNazov: string): void {
    if (!tovarId || !dodavatelId) {
      console.error('Cannot change status: Missing tovarId or dodavatelId.');
      this.showMessageDialog('Interná chyba', 'Chýba ID tovaru alebo dodávateľa pre zmenu stavu.', 'error', 'warn');
      return;
    }

    const newStatus = !currentStatus;
    const actionText = newStatus ? 'aktivovať' : 'deaktivovať';
    const entityName = tovarNazov || `ID ${tovarId}`;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Potvrdenie ${actionText === 'aktivovať' ? 'aktivácie' : 'deaktivácie'}`,
        message: `Naozaj chcete ${actionText} tovar "${entityName}"? <strong>Zároveň sa zmení aj stav všetkých variantov tohto tovaru.</strong>`,
        confirmButtonText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
        confirmButtonColor: 'primary'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        const command: UpdateTovarAktivnyCommand = {
          dodavatelId: dodavatelId,
          tovarId: tovarId,
          aktivny: newStatus
        };
        
        this.dodavatelTovaryHttpClient.updateAktivny(dodavatelId, tovarId, command).pipe(
          takeUntil(this.destroy$) 
        ).subscribe({
          next: () => {
            this.showMessageDialog(
              'Stav aktualizovaný',
              `Tovar "${entityName}" bol úspešne ${newStatus ? 'aktivovaný' : 'deaktivovaný'}. Táto zmena ovplyvnila aj stav všetkých variantov tohto tovaru.`,
              'check_circle',
              'primary'
            );
            this.loadTableData(); 
          },
          error: (error) => {
            console.error(`Chyba pri ${actionText} tovaru:`, error);
            this.showMessageDialog(
              'Chyba',
              `Nepodarilo sa ${actionText} tovar "${entityName}".`,
              'error',
              'warn'
            );
          }
        });
      }
    });
  }

  
  confirmDelete(tovarId: number, dodavatelId: number, tovarNazov: string): void {
     if (!tovarId || !dodavatelId) {
      console.error('Cannot delete: Missing tovarId or dodavatelId.');
      this.showMessageDialog('Interná chyba', 'Chýba ID tovaru alebo dodávateľa pre vymazanie.', 'error', 'warn');
      return;
    }
    const entityName = tovarNazov || `ID ${tovarId}`; 

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Vymazať tovar',
        message: `Naozaj chcete natrvalo vymazať tovar "${entityName}"? <strong>Zároveň sa vymažú aj všetky varianty tohto tovaru.</strong>`,
        confirmButtonText: 'Vymazať',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: boolean) => {
      if (result) {
        
        this.dodavatelTovaryHttpClient.delete(dodavatelId, tovarId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showMessageDialog('Tovar vymazaný', `Tovar "${entityName}" bol úspešne vymazaný vrátane všetkých jeho variantov.`, 'check_circle', 'primary');
              this.loadTableData(); 
            },
            error: (error: any) => {
              console.error('Chyba pri mazaní tovaru:', error);
              let errorMessage = `Pri mazaní tovaru "${entityName}" sa vyskytla chyba.`;
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
    return !this.isLoadingTable && this.tableDataSource.data.length === 0;
  }

  toggleFilterPanel(isExpanded: boolean): void {
    this.isFilterExpanded = isExpanded;
  }

  showMessageDialog(title: string, message: string, icon: string, iconColor: 'primary' | 'accent' | 'warn'): void {
    this.dialog.open(MessageDialogComponent, {
      data: { title, message, icon, iconColor }
    });
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
}
