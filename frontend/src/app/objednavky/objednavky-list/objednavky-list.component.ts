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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, of, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError, finalize, take, tap } from 'rxjs/operators';

import { ObjednavkaDTO, PaginatedList, ObjednavkaFaza, ChybaKlienta, PatchObjednavkaCommand } from '../../shared/services/http-clients/objednavky/objednavky-http-client.models';
import { ObjednavkyHttpClientService } from '../../shared/services/http-clients/objednavky/objednavky-http-client.service';


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

export function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const dateOd = control.get('dateOd');
  const dateDo = control.get('dateDo');

  if (dateOd && dateDo && dateOd.value && dateDo.value) {
    const odValue = new Date(dateOd.value);
    const doValue = new Date(dateDo.value);

    if (doValue < odValue) {
      return { dateRangeInvalid: true };
    }
  }

  return null;
}

@Component({
  selector: 'app-objednavky-list',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MessageDialogComponent
  ],
  templateUrl: './objednavky-list.component.html',
  styleUrls: [
    '../../shared/styles/detail-table-default.css'
  ]
})
export class ObjednavkyListComponent implements OnInit, OnDestroy {

  pageTitle = 'Zoznam objednávok';
  isLoadingData = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  
  displayedColumns: string[] = ['firmaNazov', 'faza', 'zrusene', 'firmaICO', 'kontaktnaOsoba', 'naplanovanyDatumVyroby', 'ocakavanyDatumDorucenia', 'akcie'];
  tableDataSource = new MatTableDataSource<ObjednavkaDTO>([]);
  totalItems = 0;
  pageSize = 25;
  pageSizeOptions: number[] = [25, 50, 100];
  isLoadingTable = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  
  filterForm!: FormGroup;
  isFilterExpanded = false;
  searchValue = '';

  
  private fazaToStringMap: { [key: number]: string } = {
    0: 'Nacenenie',
    1: 'NacenenieCaka',
    2: 'VyrobaNeriesene',
    3: 'VyrobaNemozna',
    4: 'VyrobaCaka',
    5: 'OdoslanieCaka',
    6: 'PlatbaCaka',
    7: 'Vybavene'
  };

  
  fazaOptions = Object.entries(this.fazaToStringMap).map(([key, value]) => ({
    key: value,
    value: Number(key)
  }));
  
  chybaKlientaOptions = Object.keys(ChybaKlienta)
    .filter(key => !isNaN(Number(ChybaKlienta[key as keyof typeof ChybaKlienta])))
    .map(key => ({ 
      key: key, 
      value: ChybaKlienta[key as keyof typeof ChybaKlienta]
    }));

  private searchSubject = new Subject<string>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private objednavkyService: ObjednavkyHttpClientService
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
        this.sort.active = 'faza';
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
    const sortActive = this.sort ? this.sort.active : 'faza';
    const sortDirection = this.sort ? this.sort.direction : 'asc';
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
        this.showMessageDialog('Chyba pri načítaní objednávok', 'Nepodarilo sa načítať zoznam objednávok.', 'error', 'warn');
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
  ): Observable<PaginatedList<ObjednavkaDTO>> {

    let params: { [key: string]: any } = {
      page: page + 1,
      pageSize: pageSize
    };

    if (sort && sort.active && sort.direction) {
      params['orderBy'] = sort.direction === 'desc' ? `${sort.active}-` : sort.active;
    } else {
      params['orderBy'] = 'faza';
    }

    if (searchValue) {
      params['search'] = searchValue;
    }

    let filterStringParts: string[] = [];
    if (filterParams) {
      
      
      
      if (filterParams.faza !== undefined && filterParams.faza !== null) {
        filterStringParts.push(`faza=${filterParams.faza}`);
      }
      
      if (filterParams.chybaKlienta !== undefined && filterParams.chybaKlienta !== null) {
        filterStringParts.push(`chybaKlienta=${filterParams.chybaKlienta}`);
      }
      
      if (filterParams.zrusene !== undefined && filterParams.zrusene !== null) {
        filterStringParts.push(`zrusene=${filterParams.zrusene}`);
      }
      
      if (filterParams.zaplatene !== undefined && filterParams.zaplatene !== null) {
        filterStringParts.push(`zaplatene=${filterParams.zaplatene}`);
      }
      
      
      if (filterParams.ocakavanyDatumDoruceniaOd) {
        const formattedDate = this.formatDateForFilter(filterParams.ocakavanyDatumDoruceniaOd);
        filterStringParts.push(`ocakavanyDatumDorucenia=>${formattedDate}`);
      }
      
      if (filterParams.ocakavanyDatumDoruceniaDo) {
        const formattedDate = this.formatDateForFilter(filterParams.ocakavanyDatumDoruceniaDo);
        filterStringParts.push(`ocakavanyDatumDorucenia=<${formattedDate}`);
      }
      
      if (filterParams.naplanovanyDatumVyrobyOd) {
        const formattedDate = this.formatDateForFilter(filterParams.naplanovanyDatumVyrobyOd);
        filterStringParts.push(`naplanovanyDatumVyroby=>${formattedDate}`);
      }
      
      if (filterParams.naplanovanyDatumVyrobyDo) {
        const formattedDate = this.formatDateForFilter(filterParams.naplanovanyDatumVyrobyDo);
        filterStringParts.push(`naplanovanyDatumVyroby=<${formattedDate}`);
      }
    }

    const filterString = filterStringParts.join('&');
    console.log("Filter string:", filterString);

    return this.objednavkyService.getList(
      params['pageSize'],
      params['page'],
      params['orderBy'],
      params['search'],
      filterString || undefined
    );
  }

  formatDateForFilter(date: Date): string {
    return date.toISOString().split('T')[0]; 
  }

  initializeFilterForm(): void {
    this.filterForm = this.formBuilder.group({
      faza: [null],
      zrusene: [null],
      zaplatene: [null],
      chybaKlienta: [null],
      ocakavanyDatumDoruceniaOd: [null],
      ocakavanyDatumDoruceniaDo: [null],
      naplanovanyDatumVyrobyOd: [null],
      naplanovanyDatumVyrobyDo: [null]
    }, { 
      validators: [
        this.createDateRangeValidator('ocakavanyDatumDoruceniaOd', 'ocakavanyDatumDoruceniaDo'),
        this.createDateRangeValidator('naplanovanyDatumVyrobyOd', 'naplanovanyDatumVyrobyDo')
      ] 
    });
  }

  createDateRangeValidator(startDateKey: string, endDateKey: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const startDate = group.get(startDateKey)?.value;
      const endDate = group.get(endDateKey)?.value;
      
      if (startDate && endDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        if (endDateObj < startDateObj) {
          return { [`${startDateKey}_${endDateKey}_invalid`]: true };
        }
      }
      
      return null;
    };
  }

  buildFilterQueryParams(): any {
    if (this.filterForm.invalid) {
      console.warn("Filter form is invalid. Not building query params.");
      if (this.filterForm.errors) {
        if ('ocakavanyDatumDoruceniaOd_ocakavanyDatumDoruceniaDo_invalid' in this.filterForm.errors) {
          this.showMessageDialog('Chyba filtra', 'Dátum dorucenia "Do" nemôže byť menší ako dátum "Od".', 'warning', 'warn');
        } else if ('naplanovanyDatumVyrobyOd_naplanovanyDatumVyrobyDo_invalid' in this.filterForm.errors) {
          this.showMessageDialog('Chyba filtra', 'Dátum výroby "Do" nemôže byť menší ako dátum "Od".', 'warning', 'warn');
        }
      }
      return {};
    }

    const formValues = this.filterForm.value;
    const params: any = {};

    
    if (formValues.faza !== undefined && formValues.faza !== null) {
      params.faza = this.fazaToStringMap[formValues.faza] || formValues.faza;
    }

    
    Object.entries(formValues).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== 'faza') {
        params[key] = value;
      }
    });

    return params;
  }

  resetFilters(): void {
    this.filterForm.reset({
      faza: null,
      zrusene: null,
      zaplatene: null,
      chybaKlienta: null,
      ocakavanyDatumDoruceniaOd: null,
      ocakavanyDatumDoruceniaDo: null,
      naplanovanyDatumVyrobyOd: null,
      naplanovanyDatumVyrobyDo: null
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
      if (this.filterForm.errors) {
        if ('ocakavanyDatumDoruceniaOd_ocakavanyDatumDoruceniaDo_invalid' in this.filterForm.errors) {
          this.showMessageDialog('Chyba filtra', 'Dátum dorucenia "Do" nemôže byť menší ako dátum "Od".', 'warning', 'warn');
        } else if ('naplanovanyDatumVyrobyOd_naplanovanyDatumVyrobyDo_invalid' in this.filterForm.errors) {
          this.showMessageDialog('Chyba filtra', 'Dátum výroby "Do" nemôže byť menší ako dátum "Od".', 'warning', 'warn');
        } else {
          this.showMessageDialog('Chyba filtra', 'Opravte neplatné hodnoty vo filtri.', 'warning', 'warn');
        }
      }
      return;
    }
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadTableData();
  }

  getFilterValues(): any {
    return this.filterForm.value;
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

  
  editItem(objednavkaId: number): void {
    if (objednavkaId) {
      this.router.navigate(['/objednavky', objednavkaId]);
      console.log(`Navigate to edit Objednavka with ID: ${objednavkaId}`);
    } else {
      console.error("Cannot navigate to edit Objednavka: Missing Objednavka ID");
      this.showMessageDialog('Chyba', 'Chýba ID objednávky pre navigáciu na detail.', 'error', 'warn');
    }
  }

  
  toggleOrderCancellation(objednavkaId: number, currentStatus: boolean): void {
    if (!objednavkaId) {
      console.error('Cannot change status: Missing objednavkaId.');
      this.showMessageDialog('Interná chyba', 'Chýba ID objednávky pre zmenu stavu.', 'error', 'warn');
      return;
    }

    const action = currentStatus ? 'obnoviť' : 'zrušiť';
    const dialogTitle = currentStatus ? 'Obnovenie objednávky' : 'Zrušenie objednávky';
    const dialogMessage = `Naozaj chcete ${action} túto objednávku?`;
    const confirmButtonText = currentStatus ? 'Obnoviť' : 'Zrušiť';
    const confirmButtonColor = currentStatus ? 'primary' : 'warn';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: dialogTitle,
        message: dialogMessage,
        confirmButtonText: confirmButtonText,
        confirmButtonColor: confirmButtonColor
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        
        const patchCommand: PatchObjednavkaCommand = {
          objednavkaId: objednavkaId,
          zrusene: !currentStatus 
        };
        
        this.objednavkyService.patch(objednavkaId, patchCommand)
          .pipe(
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: () => {
              const statusMessage = !currentStatus 
                ? 'Objednávka bola úspešne zrušená.' 
                : 'Objednávka bola úspešne obnovená.';
              
              this.showMessageDialog(
                'Úspech',
                statusMessage,
                'check_circle',
                'primary'
              );
              
              this.loadTableData(); 
            },
            error: (error: unknown) => {
              console.error('Error updating order cancellation status', error);
              const errorMessage = `Nastala chyba pri ${action} objednávky.`;
              this.showMessageDialog(
                'Chyba',
                errorMessage,
                'error',
                'warn'
              );
            }
          });
      }
    });
  }

  
  confirmDelete(objednavkaId: number, firmaNazov: string): void {
    if (!objednavkaId) {
      console.error('Cannot delete: Missing objednavkaId.');
      this.showMessageDialog('Interná chyba', 'Chýba ID objednávky pre vymazanie.', 'error', 'warn');
      return;
    }
    const entityName = firmaNazov || `ID ${objednavkaId}`; 

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Vymazať objednávku',
        message: `Naozaj chcete natrvalo vymazať objednávku pre firmu "${entityName}"? <strong>Táto akcia je trvalá a nevratná</strong>, na rozdiel od zrušenia objednávky. Odstráni všetky súvisiace údaje.`,
        confirmButtonText: 'Vymazať',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: boolean) => {
      if (result) {
        this.objednavkyService.delete(objednavkaId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showMessageDialog('Objednávka vymazaná', `Objednávka pre firmu "${entityName}" bola úspešne vymazaná.`, 'check_circle', 'primary');
              this.loadTableData(); 
            },
            error: (error: unknown) => {
              console.error('Chyba pri mazaní objednávky:', error);
              let errorMessage = `Pri mazaní objednávky pre firmu "${entityName}" sa vyskytla chyba.`;
              if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
                errorMessage = 'Objednávku nie je možné vymazať, pretože je referovaná v inej časti systému.';
              } else {
                errorMessage += ' Skúste akciu zopakovať alebo kontaktujte administrátora.';
              }
              this.showMessageDialog('Problém pri mazaní', errorMessage, 'error', 'warn');
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

  getPhaseClassName(faza: number): string {
    switch (faza) {
      case ObjednavkaFaza.Nacenenie:
        return 'phase-nacenenie';
      case ObjednavkaFaza.NacenenieCaka:
        return 'phase-nacenenie-caka';
      case ObjednavkaFaza.VyrobaNeriesene:
        return 'phase-vyroba-neriesene';
      case ObjednavkaFaza.VyrobaNemozna:
        return 'phase-vyroba-nemozna';
      case ObjednavkaFaza.VyrobaCaka:
        return 'phase-vyroba-caka';
      case ObjednavkaFaza.OdoslanieCaka:
        return 'phase-odoslanie-caka';
      case ObjednavkaFaza.PlatbaCaka:
        return 'phase-platba-caka';
      case ObjednavkaFaza.Vybavene:
        return 'phase-vybavene';
      default:
        return '';
    }
  }

  getPhaseName(faza: number): string {
    switch (faza) {
      case ObjednavkaFaza.Nacenenie:
        return 'Nacenenie';
      case ObjednavkaFaza.NacenenieCaka:
        return 'Nacenenie čaká';
      case ObjednavkaFaza.VyrobaNeriesene:
        return 'Výroba neriešené';
      case ObjednavkaFaza.VyrobaNemozna:
        return 'Výroba nemožná';
      case ObjednavkaFaza.VyrobaCaka:
        return 'Výroba čaká';
      case ObjednavkaFaza.OdoslanieCaka:
        return 'Odoslanie čaká';
      case ObjednavkaFaza.PlatbaCaka:
        return 'Platba čaká';
      case ObjednavkaFaza.Vybavene:
        return 'Vybavené';
      default:
        return 'Neznáma';
    }
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('sk-SK');
  }

  getFullName(firstName: string, lastName: string): string {
    if (!firstName && !lastName) return '-';
    return `${firstName || ''} ${lastName || ''}`.trim();
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
