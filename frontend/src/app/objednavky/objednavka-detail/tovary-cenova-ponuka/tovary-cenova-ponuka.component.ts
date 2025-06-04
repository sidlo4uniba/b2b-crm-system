import { Component, OnInit, ViewChild, OnDestroy, Inject, Input, Output, EventEmitter, model, effect, OnChanges, SimpleChanges } from '@angular/core';
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
import { ObjednavkaFaza, ObjednavkaDetailDTO } from '../../../shared/services/http-clients/objednavky/objednavky-http-client.models';


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
  selector: 'app-edit-quantity-dialog',
  template: `
    <div class="edit-quantity-dialog-container">
      <h2 mat-dialog-title>Úprava množstva</h2>
      <div mat-dialog-content>
        <p>Tovar: <strong>{{ data.nazovTovaru }}</strong></p>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Množstvo</mat-label>
          <input matInput type="number" min="1" [formControl]="quantityControl" placeholder="Zadajte množstvo">
          <mat-error *ngIf="quantityControl.hasError('required')">Množstvo je povinné</mat-error>
          <mat-error *ngIf="quantityControl.hasError('min')">Množstvo musí byť minimálne 1</mat-error>
        </mat-form-field>
      </div>
      <div mat-dialog-actions align="end">
        <button mat-button (click)="onCancelClick()">Zrušiť</button>
        <button mat-flat-button color="primary" [disabled]="quantityControl.invalid" (click)="onSaveClick()">Uložiť</button>
      </div>
    </div>
  `,
  styles: [`
    .edit-quantity-dialog-container {
      min-width: 300px;
    }
    .full-width {
      width: 100%;
    }
  `],
  standalone: true,
  imports: [
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    ReactiveFormsModule, 
    CommonModule
  ]
})
export class EditQuantityDialogComponent {
  quantityControl = new FormBuilder().control<number | null>(null, [
    Validators.required,
    Validators.min(1)
  ]);

  constructor(
    public dialogRef: MatDialogRef<EditQuantityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      id: number, 
      nazovTovaru: string, 
      mnozstvo: number 
    }
  ) {
    
    this.quantityControl.setValue(this.data.mnozstvo);
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.quantityControl.valid) {
      this.dialogRef.close(this.quantityControl.value);
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
  selector: 'app-tovary-cenova-ponuka',
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
    EditQuantityDialogComponent
  ],
  templateUrl: './tovary-cenova-ponuka.component.html',
  styleUrls: [
    '../../../shared/styles/detail-table-default.css'
  ]
})
export class TovaryCenovaPonukaComponent implements OnInit, OnDestroy, OnChanges {
  @Input() orderDetail: ObjednavkaDetailDTO | null = null;
  
  
  private objednavkaFaza: ObjednavkaFaza = ObjednavkaFaza.Nacenenie;

  selectedItems = model<SelectedTovarItem[]>([]);

  isLoadingData = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  
  displayedColumns: string[] = [
    'interneId', 
    'nazovTovaru', 
    'kategoriaId', 
    'velkost', 
    'farbaHex', 
    'mnozstvo', 
    'cena', 
    'celkovaCena',
  ];
  actionColumn = 'akcie';
  tableDataSource = new MatTableDataSource<SelectedTovarItem>([]);
  
  
  footerData = {
    celkoveMnozstvo: 0,
    celkovaCena: 0
  };

  totalItems = 0;
  pageSize = 25;
  pageSizeOptions: number[] = [25, 50, 100];
  searchValue = '';
  isLoadingTable = false;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  kategorieProduktov: KategoriaProduktuDTO[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private kategorieService: KategorieProduktovHttpClientService
  ) {
    
    effect(() => {
      const items = this.selectedItems();
      console.log('[TovaryCenovaPonuka] Selected items changed:', items);
      
      this.updateTableData();
    });

    
  }

  
  ngOnChanges(changes: SimpleChanges): void {
    
    if (changes['orderDetail'] && changes['orderDetail'].currentValue) {
      const detail = changes['orderDetail'].currentValue as ObjednavkaDetailDTO;
      console.log('[TovaryCenovaPonuka] Order detail changed via ngOnChanges:', detail);
      
      
      this.objednavkaFaza = detail.faza as ObjednavkaFaza;
      
      
      this.updateDisplayColumns();
    }
  }

  ngOnInit(): void {
    this.isLoadingData = true;

    this.setupTable();
    this.loadCategories();
    
    
    this.updateDisplayColumns();

    this.isLoadingData = false;
  }

  
  shouldShowActions(): boolean {
    
    return this.objednavkaFaza === ObjednavkaFaza.Nacenenie && 
           this.orderDetail?.zrusene !== true;
  }

  
  updateDisplayColumns(): void {
    
    const columns = [...this.displayedColumns];
    
    
    if (this.shouldShowActions()) {
      if (!columns.includes(this.actionColumn)) {
        columns.push(this.actionColumn);
      }
    } else {
      
      const actionIndex = columns.indexOf(this.actionColumn);
      if (actionIndex !== -1) {
        columns.splice(actionIndex, 1);
      }
    }
    
    
    this.displayedColumns = columns;
    console.log('[TovaryCenovaPonuka] Updated display columns:', this.displayedColumns);
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
      this.applySearch(value);
    });

    
    this.updateTableData();

    
    setTimeout(() => {
      if (this.paginator) {
        this.tableDataSource.paginator = this.paginator;
      }
      
      if (this.sort) {
        this.tableDataSource.sort = this.sort;
        
        
        this.tableDataSource.sortingDataAccessor = (item: SelectedTovarItem, property: string): string | number => {
          switch (property) {
            case 'celkovaCena':
              return item.mnozstvo * item.cena;
            case 'velkost':
              
              if (!item.velkost) return 9999; 
              
              const sizeOrder: { [key: string]: number } = {
                'XS': 1,
                'S': 2,
                'M': 3, 
                'L': 4,
                'XL': 5,
                'XXL': 6
              };
              
              return sizeOrder[item.velkost] || 7; 
            default:
              const value = item[property as keyof SelectedTovarItem];
              
              return typeof value === 'string' || typeof value === 'number' ? value : '';
          }
        };
      }
    });
  }

  updateTableData(): void {
    console.log('[TovaryCenovaPonuka] Updating table data with items:', this.selectedItems());
    
    this.tableDataSource.data = this.selectedItems();
    this.totalItems = this.selectedItems().length;
    
    
    this.calculateTotals();
    
    
    this.tableDataSource.filterPredicate = (data: SelectedTovarItem, filter: string) => {
      const searchStr = filter.toLowerCase();
      const kategoriaNazov = this.getCategoryName(data.kategoriaId).toLowerCase();
      
      return data.nazovTovaru.toLowerCase().includes(searchStr) || 
             data.interneId.toLowerCase().includes(searchStr) || 
             kategoriaNazov.includes(searchStr) ||
             (data.velkost ? data.velkost.toLowerCase().includes(searchStr) : false) ||
             (data.farbaHex ? data.farbaHex.toLowerCase().includes(searchStr) : false);
    };
  }

  applySearch(searchValue: string): void {
    this.tableDataSource.filter = searchValue.trim().toLowerCase();
    
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
    
    
    this.calculateTotals();
  }

  calculateTotals(): void {
    
    const data = this.tableDataSource.filteredData;
    
    let totalMnozstvo = 0;
    let totalCena = 0;
    
    data.forEach(item => {
      totalMnozstvo += item.mnozstvo;
      totalCena += item.mnozstvo * item.cena;
    });
    
    this.footerData = {
      celkoveMnozstvo: totalMnozstvo,
      celkovaCena: totalCena
    };
  }

  applyTableSearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  onTablePageChange(event: PageEvent): void {
    
  }

  onTableSortChange(sort: Sort): void {
    
    
    this.calculateTotals();
  }

  loadCategories(): void {
    this.kategorieService.getList()
      .pipe(
        takeUntil(this.destroy$), 
        catchError(err => {
          console.error("Error loading kategorie produktov:", err);
          this.showMessageDialog('Chyba', 'Nepodarilo sa načítať kategórie produktov.', 'error', 'warn');
          return of([]);
        })
      )
      .subscribe((response: KategoriaProduktuDTO[]) => {
        this.kategorieProduktov = response ?? [];
      });
  }

  getCategoryName(id: number | null): string {
    if (id === null) return 'N/A';
    const kategoria = this.kategorieProduktov.find(k => k.id === id);
    return kategoria ? kategoria.nazov : `Neznáma (${id})`;
  }

  editQuantity(item: SelectedTovarItem): void {
    const dialogRef = this.dialog.open(EditQuantityDialogComponent, {
      width: '350px',
      data: {
        id: item.id,
        nazovTovaru: item.nazovTovaru,
        mnozstvo: item.mnozstvo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
        const index = this.selectedItems().findIndex(i => i.id === item.id);
        if (index !== -1) {
          const updatedItems = [...this.selectedItems()];
          updatedItems[index] = {
            ...updatedItems[index],
            mnozstvo: result
          };
          
          
          this.selectedItems.set(updatedItems);
          
          
          this.updateTableData();
        }
      }
    });
  }

  deleteItem(item: SelectedTovarItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Odstránenie tovaru',
        message: `Naozaj chcete odstrániť tovar "${item.nazovTovaru}" z cenovej ponuky?`,
        confirmButtonText: 'Odstrániť',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
        const updatedItems = this.selectedItems().filter(i => i.id !== item.id);
        
        
        this.selectedItems.set(updatedItems);
        
        
        this.updateTableData();
      }
    });
  }

  get isEmptyTable(): boolean {
    return this.tableDataSource.data.length === 0;
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
