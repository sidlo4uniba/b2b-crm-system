import { Component, OnInit, ViewChild, OnDestroy, Inject, Input, Output, EventEmitter, model, effect } from '@angular/core';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject, of, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError, finalize, take, tap } from 'rxjs/operators';

import { TovarDTO, PaginatedList, TovarDetailDTO, VariantDTO } from '../../../shared/services/http-clients/tovary/tovary-http-client.models';
import { TovaryHttpClientService } from '../../../shared/services/http-clients/tovary/tovary-http-client.service';
import { DodavatelTovaryHttpClientService } from '../../../shared/services/http-clients/dodavatel-tovary/dodavatel-tovary-http-client.service';
import { UpdateTovarAktivnyCommand } from '../../../shared/services/http-clients/dodavatel-tovary/dodavatel-tovary-http-client.models';
import { KategorieProduktovHttpClientService } from '../../../shared/services/http-clients/kategorie-produktov/kategorie-produktov-http-client.service';
import { KategoriaProduktuDTO } from '../../../shared/services/http-clients/kategorie-produktov/kategorie-produktov-http-client.models';


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


export interface SelectedTovarItem {
  id: number;
  tovarId: number;
  variantTovarId?: number | null;
  nazovTovaru: string;
  interneId: string;
  kategoriaId: number;
  mnozstvo: number;
  cena: number;
  jeVariantTovaru: boolean;
  velkost?: string | null;
  farbaHex?: string | null;
}


@Component({
  selector: 'app-product-selection-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="product-selection-dialog">
      <h2 mat-dialog-title>Pridať tovar do objednávky</h2>

      <div *ngIf="isLoading" class="dialog-spinner-container">
        <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
      </div>

      <form [formGroup]="tovarForm" *ngIf="!isLoading">
        <div mat-dialog-content>
          <h3>{{ data.tovar.nazov }}</h3>
          <p class="product-info-detail">{{ data.tovar.interneId }}</p>
          <p class="product-info-detail">Základná cena:
            {{ data.tovar.cena | currency:'EUR':'symbol':'1.2-2' }}
          </p>

          <mat-form-field appearance="outline" class="quantity-field">
            <mat-label>Množstvo</mat-label>
            <input
              matInput
              type="number"
              formControlName="mnozstvo"
              min="1"
              step="1"
            />
            <mat-error *ngIf="tovarForm.get('mnozstvo')?.hasError('required')">
              Množstvo je povinné pole
            </mat-error>
            <mat-error *ngIf="tovarForm.get('mnozstvo')?.hasError('min')">
              Množstvo musí byť minimálne 1
            </mat-error>
          </mat-form-field>

          <mat-form-field
            appearance="outline"
            class="variant-field"
            *ngIf="hasVariants"
          >
            <mat-label>Variant</mat-label>
            <mat-select formControlName="variantId">
              <mat-select-trigger>
                <ng-container
                  *ngIf="tovarForm.value.variantId as vid; else baseProduct"
                >
                  <ng-container
                    *ngIf="variantyMap.get(vid) as selectedVariant"
                  >
                    <strong *ngIf="selectedVariant.velkost?.code">{{ selectedVariant.velkost?.code }}</strong>
                    <div style="width: 10px; height: 10px; display: inline-block;" *ngIf="selectedVariant.velkost?.code && selectedVariant.farbaHex"> </div>
                    
                    <div *ngIf="selectedVariant.farbaHex" style="display: inline-flex; align-items: center; vertical-align: middle; margin-bottom: 2px">
                      <span style="display: inline-block;">{{ selectedVariant.farbaHex }}</span>
                      <div [style.background-color]="selectedVariant.farbaHex"
                           style="width: 14px; height: 14px; margin-left: 4px; border: 1px solid #000; display: inline-block;">
                      </div>
                    </div>
                  </ng-container>
                </ng-container>
                <ng-template #baseProduct
                  >Základný produkt (bez variantu)</ng-template
                >
              </mat-select-trigger>

              <mat-option [value]="null"
                >Základný produkt (bez variantu)</mat-option
              >

              
              <mat-option
                *ngFor="let variant of varianty"
                [value]="variant.id"
              >
                <div style="display: flex; align-items: center; width: 100%;">
                  <span style="flex-grow: 1;">
                    <strong *ngIf="variant.velkost?.code">{{ variant.velkost?.code }}</strong>
                    <div style="width: 10px; height: 10px; display: inline-block;" *ngIf="variant.velkost?.code && variant.farbaHex"> </div>
                    
                    <div *ngIf="variant.farbaHex" style="display: inline-flex; align-items: center; vertical-align: middle;">
                      <span style="display: inline-block;">{{ variant.farbaHex }}</span>
                      <div [style.background-color]="variant.farbaHex"
                           style="width: 14px; height: 14px; margin-left: 4px; border: 1px solid #000; display: inline-block;">
                      </div>
                    </div>
                  </span>
                  <span style="margin-left: auto; padding-left: 10px;">
                    {{ getVariantPrice(variant) | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                </div>
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div mat-dialog-actions align="end">
          <button mat-button (click)="onCancel()">Zrušiť</button>
          <button
            mat-flat-button
            color="primary"
            [disabled]="tovarForm.invalid"
            (click)="onSave()"
          >
            Pridať do objednávky
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .product-selection-dialog {
        min-width: 400px;
      }
      .product-info-detail {
        font-size: 0.95rem;
        margin-bottom: 8px;
        color: black;
      }
      mat-form-field {
        width: 100%;
        margin-bottom: 16px;
      }
      .dialog-spinner-container {
        display: flex;
        justify-content: center;
        padding: 24px;
      }
      .quantity-field {
        margin-top: 16px;
      }
      
      ::ng-deep .mat-mdc-option .mdc-list-item__primary-text {
        width: 100%; 
      }
    `,
  ],
})
export class ProductSelectionDialogComponent implements OnInit {
  tovarForm: FormGroup;
  varianty: VariantDTO[] = [];
  
  variantyMap = new Map<number, VariantDTO>();
  hasVariants = false;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      tovar: TovarDTO;
      tovaryHttpClient: TovaryHttpClientService;
    }
  ) {
    this.tovarForm = this.fb.group({
      mnozstvo: [1, [Validators.required, Validators.min(1)]],
      variantId: [null],
    });
  }

  ngOnInit(): void {
    this.loadTovarDetails();
  }

  
  getVariantPrice(variant: VariantDTO): number {
    return variant.cena === 0 ? this.data.tovar.cena : variant.cena;
  }

  private loadTovarDetails(): void {
    this.isLoading = true;

    this.data.tovaryHttpClient
      .getById(this.data.tovar.id)
      .pipe(
        catchError((error) => {
          console.error('Error loading tovar details:', error);
          return of(null as unknown as TovarDetailDTO);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((tovarDetail) => {
        if (tovarDetail && tovarDetail.varianty) {
          
          const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
          this.varianty = tovarDetail.varianty
            .filter((v) => v.aktivny)
            .sort((a, b) => {
              const aIdx = sizeOrder.indexOf(a.velkost?.code ?? '');
              const bIdx = sizeOrder.indexOf(b.velkost?.code ?? '');
              
              return (aIdx === -1 ? sizeOrder.length : aIdx) -
                     (bIdx === -1 ? sizeOrder.length : bIdx);
            });

          
          this.varianty.forEach((v) => this.variantyMap.set(v.id, v));

          this.hasVariants = this.varianty.length > 0;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.tovarForm.valid) {
      const formValue = this.tovarForm.value;
      const variantId = formValue.variantId;

      const selectedVariant = variantId
        ? this.variantyMap.get(variantId) ?? null
        : null;

      
      const variantPrice = selectedVariant?.cena ?? 0;
      const finalPrice = variantPrice === 0 ? this.data.tovar.cena : variantPrice;

      const selectedTovar: SelectedTovarItem = {
        id: this.generateRandomId(),
        tovarId: this.data.tovar.id,
        variantTovarId: variantId,
        nazovTovaru: this.data.tovar.nazov,
        interneId: this.data.tovar.interneId,
        kategoriaId: this.data.tovar.kategoriaId,
        mnozstvo: formValue.mnozstvo,
        cena: finalPrice,
        jeVariantTovaru: !!variantId,
        velkost: selectedVariant?.velkost?.code || null,
        farbaHex: selectedVariant?.farbaHex || null,
      };

      this.dialogRef.close(selectedTovar);
    }
  }

  private generateRandomId(): number {
    return Math.floor(Math.random() * 1_000_000);
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
  selector: 'app-vyber-tovaru',
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
    MatCheckboxModule,
    MessageDialogComponent,
    ProductSelectionDialogComponent
  ],
  templateUrl: './vyber-tovaru.component.html',
  styleUrls: [
    '../../../shared/styles/detail-table-default.css'
  ]
})
export class VyberTovaruComponent implements OnInit, OnDestroy {

  selectedItems = model<SelectedTovarItem[]>([]);
  
  isLoadingData = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = ['select', 'interneId', 'nazov', 'kategoriaId', 'ean', 'cena'];
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
    
    
    effect(() => {
      const items = this.selectedItems();
      console.log('[VyberTovaru] Selected items changed:', items);
    });
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
    filterStringParts.push('aktivny=true');

    if (filterParams) {
        const validFilterKeys = ['kategoriaId', 'cenaOd', 'cenaDo'];
        for (const key in filterParams) {
            if (validFilterKeys.includes(key) && filterParams[key] !== null && filterParams[key] !== undefined && filterParams[key] !== '') {
                if (key === 'cenaOd') {
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

  
  openProductSelectionDialog(tovar: TovarDTO): void {
    const dialogRef = this.dialog.open(ProductSelectionDialogComponent, {
      width: '500px',
      data: {
        tovar,
        tovaryHttpClient: this.tovaryHttpClient
      },
      disableClose: false
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: SelectedTovarItem | undefined) => {
      if (result) {
        
        const currentItems = [...this.selectedItems()];
        
        
        const existingItemIndex = currentItems.findIndex(
          item => item.tovarId === result.tovarId && 
                  item.variantTovarId === result.variantTovarId
        );
        
        if (existingItemIndex >= 0) {
          
          currentItems[existingItemIndex].mnozstvo += result.mnozstvo;
        } else {
          
          currentItems.push(result);
        }
        
        
        this.selectedItems.set(currentItems);
        
        
        this.showMessageDialog(
          'Tovar pridaný', 
          `Tovar "${result.nazovTovaru}" bol pridaný do objednávky v množstve ${result.mnozstvo}.`,
          'check_circle',
          'primary'
        );
      }
    });
  }

  
  isTovarSelected(tovarId: number): boolean {
    const result = this.selectedItems().some(item => item.tovarId === tovarId);
    return result;
  }

  
  onRowClick(row: TovarDTO): void {
    this.openProductSelectionDialog(row);
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
