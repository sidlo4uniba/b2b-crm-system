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
import { Router, RouterModule } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, of, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError, finalize, take, tap } from 'rxjs/operators';

import { DodavatelDTO, PaginatedList, UpdateDodavatelAktivnyCommand } from '../../shared/services/http-clients/dodavatelia/dodavatel-http-client.models';
import { DodavatelHttpClientService } from '../../shared/services/http-clients/dodavatelia/dodavatel-http-client.service';


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

@Component({
  selector: 'app-dodavatel-list',
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
    MessageDialogComponent,
    ConfirmDialogComponent,
    RouterModule,
    MatSlideToggleModule
  ],
  templateUrl: './dodavatel-list.component.html',
  styleUrls: [
    '../../shared/styles/detail-table-default.css'
  ]
})
export class DodavatelListComponent implements OnInit, OnDestroy {

  pageTitle = 'Zoznam dodávateľov';
  isLoadingData = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = ['id', 'nazovFirmy', 'email', 'telefon', 'adresa', 'aktivny', 'akcie'];
  tableDataSource = new MatTableDataSource<DodavatelDTO>([]);
  totalItems = 0;
  pageSize = 25;
  pageSizeOptions: number[] = [25, 50, 100];
  isLoadingTable = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterForm!: FormGroup;
  isFilterExpanded = false;
  searchValue = '';
  private searchSubject = new Subject<string>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private dodavatelHttpClient: DodavatelHttpClientService
  ) {
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.isLoadingData = true;
    this.setupTable();
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
          this.sort.active = 'nazovFirmy';
          this.sort.direction = 'asc';

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
    const sortActive = this.sort ? this.sort.active : 'nazovFirmy';
    const sortDirection = this.sort ? this.sort.direction : 'asc';
    const filterParams = this.buildFilterQueryParams();

    this.fetchTableData(
      pageIndex + 1,
      pageSize,
      sortActive && sortDirection ? { active: sortActive, direction: sortDirection } : undefined,
      this.searchValue,
      filterParams
    ).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
         console.error("Error loading supplier data:", err);
         this.showMessageDialog('Chyba pri načítaní dodávateľov', 'Nepodarilo sa načítať zoznam dodávateľov.', 'error', 'warn');
         return of({ items: [], totalCount: 0, pageNumber: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false } as PaginatedList<DodavatelDTO>);
      }),
      finalize(() => {
          this.isLoadingTable = false;
          this.isLoadingData = false;
      })
    ).subscribe((result: PaginatedList<DodavatelDTO>) => {
      this.tableDataSource.data = result.items ?? [];
      this.totalItems = result.totalCount ?? 0;
    });
  }

  fetchTableData(
    page: number,
    pageSize: number,
    sort?: { active: string, direction: string },
    searchValue?: string,
    filterParams?: string
  ): Observable<PaginatedList<DodavatelDTO>> {

    let orderBy: string | undefined = undefined;
    if (sort && sort.active && sort.direction) {
       const validSortColumns = ['id', 'nazovFirmy', 'email', 'telefon', 'vytvoreneDna', 'upraveneDna', 'aktivny'];
       if (validSortColumns.includes(sort.active)) {
         orderBy = sort.direction === 'desc' ? `${sort.active}-` : sort.active;
       } else {
         console.warn(`Unsupported sort column: ${sort.active}. Falling back to default.`);
         orderBy = 'nazovFirmy';
       }
    } else {
       orderBy = 'nazovFirmy';
    }

    return this.dodavatelHttpClient.getList(
        pageSize,
        page,
        orderBy,
        searchValue,
        filterParams
    );
  }

  initializeFilterForm(): void {
    this.filterForm = this.formBuilder.group({
        aktivny: ['all']
    });
  }

  buildFilterQueryParams(): string | undefined {
    const formValues = this.filterForm.value;
    const params: string[] = [];

    if (formValues.aktivny !== null && formValues.aktivny !== 'all') {
        params.push(`aktivny=${formValues.aktivny}`);
    }

    console.log("Built Filter Params:", params.join('&'));
    return params.length > 0 ? params.join('&') : undefined;
  }

  getFilterValues(): any {
    return this.filterForm.value;
  }

  resetFilters(): void {
    this.filterForm.reset({
        aktivny: 'all'
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
    this.filterForm.get(fieldName)?.reset();
  }

  applyFilters(): void {
     console.log('Filters applied:', this.getFilterValues());
     if (this.filterForm.invalid) {
         console.warn("Cannot apply invalid filters.");
         this.buildFilterQueryParams();
         return;
     }
     if (this.paginator) {
         this.paginator.pageIndex = 0;
     }
     this.loadTableData();
  }

  applyTableSearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    const normalizedValue = this.normalizeSearchString(filterValue.trim());
    this.searchSubject.next(normalizedValue);
  }

  onTablePageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.loadTableData();
  }

  onTableSortChange(sort: Sort): void {
    console.log('Sort changed:', sort);
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadTableData();
  }

  editItem(id: number): void {
    this.router.navigate(['/dodavatelia', id]);
  }

  confirmDelete(id: number, nazovFirmy: string): void {
    if (!id) {
        console.error('Cannot delete: Missing supplier ID.');
        this.showMessageDialog('Interná chyba', 'Chýba ID dodávateľa pre vymazanie.', 'error', 'warn');
        return;
    }
    const entityName = this.normalizeString(nazovFirmy) || `ID ${id}`;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Potvrdiť vymazanie dodávateľa',
        message: `Naozaj chcete natrvalo vymazať dodávateľa <strong>${entityName}</strong>? Táto akcia je nevratná. <br><strong>Zároveň sa vymažú aj všetky produkty a varianty produktov priradené k tomuto dodávateľovi.</strong>`,
        confirmButtonText: 'Vymazať',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: boolean) => {
      if (result) {
        this.isLoadingTable = true;
        this.dodavatelHttpClient.delete(id).pipe(
          takeUntil(this.destroy$),
          finalize(() => { this.isLoadingTable = false; })
        ).subscribe({
          next: () => {
            console.log('Supplier successfully deleted');
            this.showMessageDialog(
              'Dodávateľ vymazaný',
              `Dodávateľ '${entityName}' bol úspešne vymazaný vrátane všetkých jeho produktov a variantov.`,
              'check_circle',
              'primary'
            );
            this.loadTableData();
          },
          error: (error) => {
            console.error('Error deleting supplier:', error);
            let userMessage = `Nastala chyba pri vymazávaní dodávateľa '${entityName}'.`;
             if (error.status === 409) {
                userMessage = `Dodávateľa "${entityName}" nie je možné vymazať, pretože dodávateľ má priradený tovar, ktorý sa nachádza v cenových ponukách. Odporúčame namiesto toho dodávateľa deaktivovať.`;
            } else if (error.status === 500) {
                 userMessage += 'Skúste to znova neskôr alebo kontaktujte administrátora.'
             }
             this.showMessageDialog(
               'Chyba pri mazaní',
               userMessage,
               'error',
               'warn'
             );
          }
        });
      }
    });
  }

  toggleAktivnyStatus(id: number, currentStatus: boolean, nazovFirmy: string): void {
    if (id === undefined || id === null) {
        console.error('Cannot change status: Missing supplier ID.');
        this.showMessageDialog('Interná chyba', 'Chýba ID dodávateľa pre zmenu stavu.', 'error', 'warn');
        return;
    }
    const newStatus = !currentStatus;
    const actionText = newStatus ? 'aktivovať' : 'deaktivovať';
    const entityName = this.normalizeString(nazovFirmy) || `ID ${id}`;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Potvrdenie ${actionText === 'aktivovať' ? 'aktivácie' : 'deaktivácie'}`,
        message: `Naozaj chcete ${actionText} dodávateľa "${entityName}"? <br><strong>Zároveň sa ${actionText === 'aktivovať' ? 'aktivujú' : 'deaktivujú'} aj všetky produkty a varianty produktov priradené k tomuto dodávateľovi.</strong>`,
        confirmButtonText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
        confirmButtonColor: 'primary'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: boolean) => {
      if (result) {
        this.isLoadingTable = true;
        const command: UpdateDodavatelAktivnyCommand = { id: id, aktivny: newStatus };

        this.dodavatelHttpClient.updateAktivny(id, command).pipe(
          takeUntil(this.destroy$),
          finalize(() => { this.isLoadingTable = false; })
        ).subscribe({
          next: () => {
            this.showMessageDialog(
              'Stav aktualizovaný',
              `Dodávateľ "${entityName}" bol úspešne ${newStatus ? 'aktivovaný' : 'deaktivovaný'}. Táto zmena ovplyvnila aj stav všetkých produktov dodávateľa.`,
              'check_circle',
              'primary'
            );
            this.loadTableData();
          },
          error: (error) => {
            console.error(`Chyba pri ${actionText} dodávateľa:`, error);
            this.showMessageDialog(
              'Chyba',
              `Nepodarilo sa ${actionText} dodávateľa "${entityName}". Skúste to znova neskôr alebo kontaktujte administrátora.`,
              'error',
              'warn'
            );
          }
        });
      }
    });
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

  normalizeString(str: string | null | undefined): string {
    if (!str) return '';
    const element = document.createElement('div');
    element.innerText = str;
    return element.innerHTML;
  }

  normalizeSearchString(str: string): string {
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }
}
