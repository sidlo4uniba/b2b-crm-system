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
import { Subject, of, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError, finalize, take, tap } from 'rxjs/operators';

import { FirmaDTO, PaginatedList } from '../../shared/services/http-clients/firmy/firmy-http-client.models';
import { FirmyHttpClientService } from '../../shared/services/http-clients/firmy/firmy-http-client.service';


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


export function scoreRangeValidator(control: AbstractControl): ValidationErrors | null {
  const scoreOd = control.get('skoreOd');
  const scoreDo = control.get('skoreDo');
  if (scoreOd && scoreDo && scoreOd.value !== null && scoreDo.value !== null) {
    if (Number(scoreDo.value) < Number(scoreOd.value)) {
      return { scoreRangeInvalid: true };
    }
  }
  return null;
}

export function valueRangeValidator(control: AbstractControl): ValidationErrors | null {
  const hodnotaOd = control.get('hodnotaOd');
  const hodnotaDo = control.get('hodnotaDo');
  if (hodnotaOd && hodnotaDo && hodnotaOd.value !== null && hodnotaDo.value !== null) {
    if (Number(hodnotaDo.value) < Number(hodnotaOd.value)) {
      return { valueRangeInvalid: true };
    }
  }
  return null;
}

@Component({
  selector: 'app-firmy-list',
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
    RouterModule
  ],
  templateUrl: './firmy-list.component.html',
  styleUrls: [
    '../../shared/styles/detail-table-default.css'
  ]
})
export class FirmyListComponent implements OnInit, OnDestroy {

  pageTitle = 'Zoznam firiem';
  isLoadingData = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = ['ico', 'nazov', 'adresa', 'skoreSpolahlivosti', 'hodnotaObjednavok', 'akcie'];
  tableDataSource = new MatTableDataSource<FirmaDTO>([]);
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
    private firmyHttpClient: FirmyHttpClientService
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
          this.sort.active = 'nazov';
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
    const sortActive = this.sort ? this.sort.active : 'nazov';
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
         console.error("Error loading table data:", err);
         this.showMessageDialog('Chyba pri načítaní firiem', 'Nepodarilo sa načítať zoznam firiem.', 'error', 'warn');
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
    filterParams?: string
  ): Observable<PaginatedList<FirmaDTO>> {

    let params: { [key: string]: any } = {
      page: page,
      pageSize: pageSize
    };

    if (sort && sort.active && sort.direction) {
      params['orderBy'] = sort.direction === 'desc' ? `${sort.active}-` : sort.active;
    } else {
      params['orderBy'] = 'nazov-';
    }

    if (searchValue) {
      params['search'] = searchValue;
    }

    if (filterParams) {
      params['filter'] = filterParams;
    }

    return this.firmyHttpClient.getList(
        params['pageSize'],
        params['page'],
        params['orderBy'],
        params['search'],
        params['filter']
    );
  }

  initializeFilterForm(): void {
    this.filterForm = this.formBuilder.group({
      skoreOd: [null, [Validators.min(0), Validators.max(100)]],
      skoreDo: [null, [Validators.min(0), Validators.max(100)]],
      hodnotaOd: [null, [Validators.min(0)]],
      hodnotaDo: [null, [Validators.min(0)]],
    }, { validators: [scoreRangeValidator, valueRangeValidator] });
  }

  buildFilterQueryParams(): string | undefined {
    if (this.filterForm.invalid) {
        console.warn("Filter form is invalid. Not building query params.");
        if (this.filterForm.hasError('scoreRangeInvalid')) {
            this.showMessageDialog('Chyba filtra', 'Skóre "Do" nemôže byť menšie ako skóre "Od".', 'warning', 'warn');
        }
        if (this.filterForm.hasError('valueRangeInvalid')) {
            this.showMessageDialog('Chyba filtra', 'Hodnota "Do" nemôže byť menšia ako hodnota "Od".', 'warning', 'warn');
        }
        return undefined;
    }

    const formValues = this.filterForm.value;
    const params: string[] = [];

    if (formValues.skoreOd !== null && formValues.skoreOd !== '') {
        params.push(`skoreSpolahlivosti=>${Number(formValues.skoreOd) / 100}`);
    }
    if (formValues.skoreDo !== null && formValues.skoreDo !== '') {
        params.push(`skoreSpolahlivosti=<${Number(formValues.skoreDo) / 100}`);
    }

    if (formValues.hodnotaOd !== null && formValues.hodnotaOd !== '') {
        params.push(`hodnotaObjednavok=>${formValues.hodnotaOd}`);
    }
    if (formValues.hodnotaDo !== null && formValues.hodnotaDo !== '') {
        params.push(`hodnotaObjednavok=<${formValues.hodnotaDo}`);
    }

    console.log("Built Filter Params:", params.join('&'));
    return params.length > 0 ? params.join('&') : undefined;
  }

  getFilterValues(): any {
    return this.filterForm.value;
  }

  resetFilters(): void {
    this.filterForm.reset({
        skoreOd: null,
        skoreDo: null,
        hodnotaOd: null,
        hodnotaDo: null
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
    this.router.navigate(['/firmy', id]);
  }

  confirmDelete(id: number, nazov: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Potvrdiť vymazanie',
        message: `Naozaj chcete vymazať firmu <strong>${this.normalizeString(nazov)}</strong>? Táto akcia je nevratná. <br><strong>Zároveň sa vymažú aj všetky objednávky a kontaktné osoby danej firmy.</strong>`,
        confirmButtonText: 'Vymazať',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoadingTable = true;
        this.firmyHttpClient.delete(id).pipe(
          takeUntil(this.destroy$),
          finalize(() => { this.isLoadingTable = false; })
        ).subscribe({
          next: () => {
            console.log('Firma successfully deleted');
            this.showMessageDialog(
              'Úspech',
              `Firma '${this.normalizeString(nazov)}' bola úspešne vymazaná vrátane všetkých objednávok a kontaktných osôb danej firmy.`,
              'check_circle',
              'primary'
            );
            this.loadTableData();
          },
          error: (error) => {
            console.error('Error deleting firma:', error);
            if (error.status === 500) {
                 this.showMessageDialog(
                   'Chyba',
                   `Nastala chyba pri vymazávaní firmy '${this.normalizeString(nazov)}. Prosím opakujte akciu neskôr alebo kontaktujte administrátora.`,
                   'error',
                   'warn'
                 );
            }
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

  normalizeString(str: string): string {
    const element = document.createElement('div');
    element.innerText = str;
    return element.innerHTML;
  }

  normalizeSearchString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
}
