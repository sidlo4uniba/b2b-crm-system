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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, of, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError, finalize, take, tap } from 'rxjs/operators';

import { DodavatelDetailDTO, DodavatelDTO, UpdateDodavatelCommand, CreateDodavatelCommand, CreateDodavatelResponse, UpdateDodavatelAktivnyCommand } from '../../shared/services/http-clients/dodavatelia/dodavatel-http-client.models';
import { DodavatelHttpClientService } from '../../shared/services/http-clients/dodavatelia/dodavatel-http-client.service';
import { TovarDTO, PaginatedList, TovarDetailDTO, VariantDTO } from '../../shared/services/http-clients/tovary/tovary-http-client.models';
import { TovaryHttpClientService } from '../../shared/services/http-clients/tovary/tovary-http-client.service';
import { KategorieProduktovHttpClientService } from '../../shared/services/http-clients/kategorie-produktov/kategorie-produktov-http-client.service';
import { KategoriaProduktuDTO } from '../../shared/services/http-clients/kategorie-produktov/kategorie-produktov-http-client.models';
import { DodavatelTovaryHttpClientService } from '../../shared/services/http-clients/dodavatel-tovary/dodavatel-tovary-http-client.service';
import { CreateTovarCommand, UpdateTovarCommand, UpdateTovarAktivnyCommand } from '../../shared/services/http-clients/dodavatel-tovary/dodavatel-tovary-http-client.models';
import { VariantTovarHttpClientService } from '../../shared/services/http-clients/variant-tovar/variant-tovar-http-client.service';
import { CreateVariantTovarCommand, UpdateVariantTovarCommand, UpdateVariantTovarAktivnyCommand, VelkostDTO } from '../../shared/services/http-clients/variant-tovar/variant-tovar-http-client.models';


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


export interface VariantDialogData {
  variant: VariantDTO | null;
  tovarId: number;
  isNew: boolean;
}

@Component({
  selector: 'app-variant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatChipsModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="variant-dialog-container">
      <h2 mat-dialog-title>{{ data.isNew ? 'Pridať nový variant' : 'Upraviť variant' }}</h2>
      <form [formGroup]="variantForm">
        <div mat-dialog-content>
          <mat-chip-listbox formControlName="variantType" aria-label="Typ variantu" required class="variant-type-chips">
            <mat-chip-option value="size">Iba Veľkosť</mat-chip-option>
            <mat-chip-option value="color">Iba Farba</mat-chip-option>
            <mat-chip-option value="both">Veľkosť a Farba</mat-chip-option>
          </mat-chip-listbox>
          <mat-error *ngIf="variantForm.get('variantType')?.hasError('required') && variantForm.get('variantType')?.touched" class="validation-error">
            Musíte vybrať typ variantu.
          </mat-error>

          <div class="form-row" *ngIf="variantForm.get('variantType')?.value === 'size' || variantForm.get('variantType')?.value === 'both'">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Veľkosť</mat-label>
              <mat-select formControlName="velkost" [required]="variantForm.get('variantType')?.value === 'size' || variantForm.get('variantType')?.value === 'both'">
                <mat-option [value]="null">-- Žiadna --</mat-option>
                <mat-option value="XS">XS</mat-option>
                <mat-option value="S">S</mat-option>
                <mat-option value="M">M</mat-option>
                <mat-option value="L">L</mat-option>
                <mat-option value="XL">XL</mat-option>
                <mat-option value="XXL">XXL</mat-option>
              </mat-select>
               <mat-error *ngIf="variantForm.get('velkost')?.hasError('required')">
                 Veľkosť je povinná pre zvolený typ variantu.
               </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row" *ngIf="variantForm.get('variantType')?.value === 'color' || variantForm.get('variantType')?.value === 'both'">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Farba</mat-label>
              <input matInput formControlName="farbaHex" [value]="variantForm.get('farbaHex')?.value || '#000000'"
                     (click)="colorPicker.click()" readonly [required]="variantForm.get('variantType')?.value === 'color' || variantForm.get('variantType')?.value === 'both'">
              <div matSuffix class="color-preview" [style.background-color]="variantForm.get('farbaHex')?.value || '#FFFFFF'"
                   (click)="colorPicker.click()"></div>
              <input type="color" style="position: absolute; opacity: 0; pointer-events: none;" #colorPicker
                     [value]="variantForm.get('farbaHex')?.value || '#000000'"
                     (change)="variantForm.get('farbaHex')?.setValue(colorPicker.value)">
              <mat-error *ngIf="variantForm.get('farbaHex')?.hasError('required')">
                 Farba je povinná pre zvolený typ variantu.
               </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row price-toggle-row">
             <mat-slide-toggle formControlName="useCustomPrice">Odlišná cena od ceny tovaru</mat-slide-toggle>
           </div>

          <div class="form-row" *ngIf="variantForm.get('useCustomPrice')?.value">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Vlastná cena variantu (€)</mat-label>
              <input matInput formControlName="cena" type="number" min="0" step="0.01" [required]="variantForm.get('useCustomPrice')?.value">
              <mat-icon matSuffix>euro</mat-icon>
              <mat-error *ngIf="variantForm.get('cena')?.hasError('required')">
                Cena je povinná pri použití vlastnej ceny.
              </mat-error>
              <mat-error *ngIf="variantForm.get('cena')?.hasError('min')">
                Cena musí byť väčšia ako 0.
              </mat-error>
            </mat-form-field>
          </div>
        </div>
        
        <div mat-dialog-actions align="end">
          <button mat-button (click)="onCancelClick()">Zrušiť</button>
          <button mat-flat-button color="primary" [disabled]="variantForm.invalid" (click)="onSaveClick()">
            {{ data.isNew ? 'Pridať' : 'Uložiť' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .variant-dialog-container {
      min-width: 400px;
    }
    .form-row {
      margin-bottom: 16px;
    }
    .price-toggle-row {
        margin-bottom: 20px;
        margin-top: 10px;
    }
    .form-field {
      width: 100%;
    }
    .color-preview {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid #ccc;
      cursor: pointer;
      margin-right: 8px;
    }
    .validation-error {
      margin-bottom: 16px;
      display: block;
      font-size: 75%;
    }
    .variant-type-chips {
      margin-bottom: 20px;
    }
    mat-chip-listbox {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
  `]
})
export class VariantDialogComponent {
  variantForm: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<VariantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VariantDialogData
  ) {
    const hasSize = !!data.variant?.velkost?.code;
    const hasColor = !!data.variant?.farbaHex;
    let initialType: string | null = null;

    if (hasSize && hasColor) {
      initialType = 'both';
    } else if (hasSize) {
      initialType = 'size';
    } else if (hasColor) {
      initialType = 'color';
    }

    const initialUseCustomPrice = data.variant?.cena != null && data.variant.cena > 0;
    const initialPrice = initialUseCustomPrice ? data.variant?.cena : 0;

    this.variantForm = this.formBuilder.group({
      variantType: [initialType, Validators.required],
      velkost: [data.variant?.velkost?.code || null],
      farbaHex: [data.variant?.farbaHex || null],
      useCustomPrice: [initialUseCustomPrice],
      cena: [initialPrice, [initialUseCustomPrice ? Validators.min(0.01) : Validators.min(0)]]
    });

    this.variantForm.get('variantType')?.valueChanges.subscribe(type => {
        const velkostControl = this.variantForm.get('velkost');
        if (type === 'size' || type === 'both') {
            velkostControl?.setValidators(Validators.required);
        } else {
            velkostControl?.clearValidators();
            velkostControl?.setValue(null);
        }
        velkostControl?.updateValueAndValidity();

        const farbaControl = this.variantForm.get('farbaHex');
         if (type === 'color' || type === 'both') {
            farbaControl?.setValidators(Validators.required);
         } else {
            farbaControl?.clearValidators();
            farbaControl?.setValue(null);
         }
         farbaControl?.updateValueAndValidity();
    });
    
    this.variantForm.get('variantType')?.updateValueAndValidity();

    this.variantForm.get('useCustomPrice')?.valueChanges.subscribe(useCustom => {
        const cenaControl = this.variantForm.get('cena');
        if (useCustom) {
            cenaControl?.setValidators([Validators.required, Validators.min(0.01)]);
        } else {
            cenaControl?.clearValidators();
            cenaControl?.setValidators([Validators.min(0)]);
            cenaControl?.setValue(0);
        }
        cenaControl?.updateValueAndValidity();
    });
    this.variantForm.get('useCustomPrice')?.updateValueAndValidity();
  }
  
  onCancelClick(): void {
    this.dialogRef.close();
  }
  
  onSaveClick(): void {
    this.variantForm.markAllAsTouched();
    if (this.variantForm.invalid) {
        console.log("Variant form invalid:", this.variantForm.errors);
        return;
    }

    const formValue = this.variantForm.value;
    const variantType = formValue.variantType;
    const useCustomPrice = formValue.useCustomPrice;

    let velkost: VelkostDTO | null = null;
    if (variantType === 'size' || variantType === 'both') {
        if (formValue.velkost) {
            velkost = { code: formValue.velkost };
        }
    }

    let farbaHex: string | null = null;
    if (variantType === 'color' || variantType === 'both') {
         farbaHex = formValue.farbaHex || null;
    }

    const cena = useCustomPrice ? formValue.cena : 0;

    const result: any = {
      tovarId: this.data.tovarId,
      velkost: velkost,
      farbaHex: farbaHex,
      cena: cena
    };

    if (!this.data.isNew && this.data.variant) {
      result['variantId'] = this.data.variant.id;
    }

    this.dialogRef.close(result);
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
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './tovar-detail.component.html',
  styleUrls: [
    '../../shared/styles/detail-table-default.css'
  ]
})
export class TovarDetailComponent implements OnInit, OnDestroy {

  
  currentEntityId: number | null = null;
  currentDodavatelId: number | null = null;
  isAddMode = false;
  pageTitle = 'Detail tovaru';
  isSaving = false;
  isLoadingData = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  
  detailForm!: FormGroup;
  private formChangedSubject = new BehaviorSubject<boolean>(false);
  formChanged$ = this.formChangedSubject.asObservable();
  private detailsSubject = new BehaviorSubject<TovarDetailDTO | null>(null);
  details$ = this.detailsSubject.asObservable();

  
  displayedColumns: string[] = ['interneId', 'nazov', 'kategoriaId', 'ean', 'cena', 'akcie'];
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

  
  variantsDisplayedColumns: string[] = ['velkost', 'farbaHex', 'cena', 'aktivny', 'akcie'];
  variantsDataSource = new MatTableDataSource<VariantDTO>([]);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private dodavatelHttpClient: DodavatelHttpClientService,
    private tovaryHttpClient: TovaryHttpClientService,
    private dodavatelTovaryHttpClient: DodavatelTovaryHttpClientService,
    private variantTovaryHttpClient: VariantTovarHttpClientService,
    private kategorieService: KategorieProduktovHttpClientService,
    private location: Location
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.isLoadingData = true;
    this.loadCategories();

    this.formChanged$.pipe(takeUntil(this.destroy$)).subscribe(changed => {
       
    });

    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const dodavatelIdParam = params.get('dodavatelId');
        const tovarIdParam = params.get('tovarId');

        if (!dodavatelIdParam) {
          console.error('Missing dodavatelId in route parameters, redirecting.');
          this.showMessageDialog('Chyba', 'Chýba ID dodávateľa v URL adrese.', 'error', 'warn');
          this.router.navigate(['/dashboard']);
          this.isLoadingData = false;
          return of(null);
        }

        this.currentDodavatelId = +dodavatelIdParam;

        if (tovarIdParam === 'pridat') {
          this.isAddMode = true;
          this.pageTitle = 'Pridať nový tovar';
          this.currentEntityId = null;
          this.resetForm();
          this.isLoadingData = false;
          return of(null);
        } else if (tovarIdParam) {
          this.isAddMode = false;
          this.pageTitle = 'Detail tovaru';
          this.currentEntityId = +tovarIdParam;
          return this.loadEntityDetails(this.currentEntityId).pipe(
             catchError(err => {
                this.showMessageDialog(
                  'Chyba pri načítaní dát tovaru',
                  `Nepodarilo sa načítať údaje tovaru (ID: ${this.currentEntityId}) pre dodávateľa (ID: ${this.currentDodavatelId}). Skúste sa vrátiť späť na stránku dodávateľa alebo kontaktujte administrátora.`,
                  'error',
                  'warn'
                );
                console.error("Error loading entity details:", err);
                this.router.navigate(['/dodavatelia', this.currentDodavatelId]);
                return of(null);
             })
          );
        } else {
          console.warn('Missing tovarId or "pridat" in route parameters, redirecting.');
          this.router.navigate(['/dodavatelia', this.currentDodavatelId]);
          this.isLoadingData = false;
          return of(null);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(details => {
        if (!this.isAddMode && details) {
           console.log('Entity details loaded successfully.');
           if (details.dodavatelId !== this.currentDodavatelId) {
               console.warn(`Mismatch: Dodavatel ID from URL (${this.currentDodavatelId}) differs from loaded Tovar's Dodavatel ID (${details.dodavatelId}). Redirecting.`);
               this.showMessageDialog('Chyba', 'Nekonzistentné dáta. Tovar nepatrí k danému dodávateľovi.', 'error', 'warn');
               this.router.navigate(['/dodavatelia', this.currentDodavatelId]);
           } else {
               this.updateTable();
           }
        }
        this.isLoadingData = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.setupTable();
  }

  initializeForm(): void {
    this.detailForm = this.formBuilder.group({
      nazov: ['', [Validators.required, Validators.maxLength(200)]],
      kategoriaId: [null, Validators.required],
      interneId: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^T-\d{2}-[A-Za-z0-9]{6}$/)
      ]],
      ean: ['', [
        Validators.maxLength(13),
        Validators.minLength(13),
        Validators.pattern(/^\d{13}$/)
      ]],
      cena: [0, [Validators.required, Validators.min(0)]],
    });

    this.detailForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.detailForm.pristine) {
         this.formChangedSubject.next(true);
      }
    });
  }

  loadEntityDetails(id: number): Observable<TovarDetailDTO> {
    this.isLoadingData = true;
    return this.tovaryHttpClient.getById(id).pipe(
      tap(details => {
        console.log("Loaded details:", details);
        this.detailsSubject.next(details);
        if (this.currentDodavatelId === null) {
            this.currentDodavatelId = details.dodavatelId;
        } else if (this.currentDodavatelId !== details.dodavatelId) {
            console.error(`Critical Mismatch: Dodavatel ID from URL (${this.currentDodavatelId}) differs from loaded Tovar's Dodavatel ID (${details.dodavatelId}).`);
            throw new Error('Dodavatel ID mismatch');
        }

        this.detailForm.patchValue({
          nazov: details.nazov,
          kategoriaId: details.kategoriaId,
          interneId: details.interneId,
          ean: details.ean,
          cena: details.cena,
        });

        this.resetFormChangeState();
        this.detailForm.markAsPristine();
        this.detailForm.markAsUntouched();

        this.variantsDataSource.data = details.varianty || [];
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

  getCurrentDetails(): TovarDetailDTO | null {
    return this.detailsSubject.getValue();
  }

  resetForm(): void {
    if (this.isAddMode) {
        this.detailForm.reset({
          cena: 0
        });
    } else {
        const currentDetails = this.getCurrentDetails();
        if (currentDetails) {
          this.detailForm.patchValue({
            nazov: currentDetails.nazov,
            kategoriaId: currentDetails.kategoriaId,
            interneId: currentDetails.interneId,
            ean: currentDetails.ean,
            cena: currentDetails.cena,
          });
        } else {
          this.detailForm.reset({
            cena: 0
          });
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
       const message = this.isAddMode ? 'Skontrolujte povinné polia alebo opravte nesprávne vyplnené údaje vo formulári.' : 'Opravte chyby vo formulári tovaru.';
       this.showMessageDialog('Opravte chyby vo formulári', message, 'warning', 'warn');
       return;
    }
    if (this.isSaving) return;

    if (this.currentDodavatelId === null) {
        this.showMessageDialog('Interná chyba', 'Chýba ID dodávateľa pre uloženie.', 'error', 'warn');
        console.error("Cannot save: currentDodavatelId is null.");
        return;
    }

    this.isSaving = true;
    const formValue = this.detailForm.getRawValue();

    if (this.isAddMode) {
      const createCommand: CreateTovarCommand = {
        dodavatelId: this.currentDodavatelId,
        nazov: formValue.nazov,
        kategoriaId: formValue.kategoriaId,
        interneId: formValue.interneId,
        ean: formValue.ean || null,
        cena: formValue.cena,
        obrazokURL: null,
        aktivny: true
      };

      this.dodavatelTovaryHttpClient.create(this.currentDodavatelId, createCommand).pipe(
          finalize(() => this.isSaving = false),
          takeUntil(this.destroy$)
      ).subscribe({
        next: (response: { id: number }) => {
          this.showMessageDialog('Tovar pridaný', 'Nový tovar bol úspešne vytvorený.', 'check_circle', 'primary');
          this.router.navigate(['/dodavatelia', this.currentDodavatelId, 'tovary', response.id]);
        },
        error: (error: any) => {
          console.error('Chyba pri vytváraní tovaru:', error);
          let errorMessage = 'Pri vytváraní nového tovaru sa vyskytla chyba.';
          if (error.status === 409 || error.status === 400) {
            if (error.error?.message?.toLowerCase().includes('interneid')) {
              errorMessage = 'Tovar s týmto interným ID už existuje.';
            } else if (error.error?.message?.toLowerCase().includes('ean')) {
              errorMessage = 'Tovar s týmto EAN kódom už existuje.';
            }
            else {
              errorMessage += 'Tovar s týmto interným ID alebo EAN kódom už existuje.';
            }
          }
          this.showMessageDialog('Problém pri pridávaní', errorMessage, 'error', 'warn');
        }
      });
    } else {
        if (!this.currentEntityId || !this.currentDodavatelId) {
            this.showMessageDialog('Interná chyba', 'Chýba ID tovaru alebo dodávateľa pre uloženie.', 'error', 'warn');
            this.isSaving = false;
            return;
        }
        const updateCommand: UpdateTovarCommand = {
            dodavatelId: this.currentDodavatelId,
            tovarId: this.currentEntityId,
            nazov: formValue.nazov,
            kategoriaId: formValue.kategoriaId,
            interneId: formValue.interneId,
            ean: formValue.ean || null,
            cena: formValue.cena,
            obrazokURL: null
        };

        this.dodavatelTovaryHttpClient.update(this.currentDodavatelId, this.currentEntityId, updateCommand).pipe(
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
                this.showMessageDialog('Úspešné uloženie', 'Údaje tovaru boli úspešne uložené.', 'check_circle', 'primary');
            },
            error: (error) => {
                console.error('Chyba pri aktualizácii tovaru:', error);
                let errorMessage = 'Pri ukladaní údajov tovaru sa vyskytla chyba.';
                 if (error.status === 409 || error.status === 400) {
                    if (error.error?.message?.toLowerCase().includes('interneid')) {
                        errorMessage = 'Tovar s týmto interným ID už existuje.';
                    } else if (error.error?.message?.toLowerCase().includes('ean')) {
                        errorMessage = 'Tovar s týmto EAN kódom už existuje.';
                    }
                    else {
                        errorMessage += 'Tovar s týmto interným ID alebo EAN kódom už existuje.';
                    }  
                }
                this.showMessageDialog('Problém pri ukladaní zmien', errorMessage, 'error', 'warn');
            }
        });
    }
  }

  updateTable(): void {
    const details = this.getCurrentDetails();
    if (details) {
      this.variantsDataSource.data = details.varianty || [];
    } else {
      this.variantsDataSource.data = [];
    }
    setTimeout(() => {
      this.setupTable();
    });
  }

  setupTable(): void {
    if (this.sort) {
      this.variantsDataSource.sortingDataAccessor = (item: any, property: string): any => {
        if (property === 'velkost') {
          const orderMap: { [key: string]: number } = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6 };
          const code = item.velkost?.code;
          return orderMap[code] || 99;
        }
        const value = item[property];
        return typeof value === 'string' ? value.toLowerCase() : value;
      };

      this.sort.active = 'velkost';
      this.sort.direction = 'asc';
      this.sort.sortChange.emit({ active: 'velkost', direction: 'asc' });
      this.variantsDataSource.sort = this.sort;
    } else {
      console.warn('MatSort is not available for variants table.');
    }
  }

  toggleAktivnyStatus(): void {
    if (this.isAddMode || !this.currentEntityId || !this.currentDodavatelId) {
      console.warn('Cannot change status in add mode or without an ID.');
      return;
    }

    this.details$.pipe(take(1)).subscribe(details => {
      if (!details) {
        this.showMessageDialog('Chyba', 'Nepodarilo sa načítať aktuálny stav tovaru.', 'error', 'warn');
        return;
      }

      const currentStatus = details.aktivny;
      const newStatus = !currentStatus;
      const actionText = newStatus ? 'aktivovať' : 'deaktivovať';
      const entityName = details.nazov || `ID ${this.currentEntityId}`;

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: `Potvrdenie ${actionText === 'aktivovať' ? 'aktivácie' : 'deaktivácie'}`,
          message: `Naozaj chcete ${actionText} tovar "${entityName}"? <strong>Zároveň sa zmení aj stav všetkých variantov tohto tovaru.</strong>`,
          confirmButtonText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          confirmButtonColor: 'primary'
        }
      });

      dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
        if (result && this.currentEntityId && this.currentDodavatelId) {
          const command: UpdateTovarAktivnyCommand = {
            dodavatelId: this.currentDodavatelId,
            tovarId: this.currentEntityId,
            aktivny: newStatus
          };
          this.isSaving = true;
          this.dodavatelTovaryHttpClient.updateAktivny(this.currentDodavatelId, this.currentEntityId, command).pipe(
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
                `Tovar "${entityName}" bol úspešne ${newStatus ? 'aktivovaný' : 'deaktivovaný'}. Táto zmena ovplyvnila aj stav všetkých variantov tohto tovaru.`,
                'check_circle',
                'primary'
              );
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
    });
  }

  confirmDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Vymazať tovar',
        message: `Naozaj chcete natrvalo vymazať tento tovar? <strong>Zároveň sa vymažú aj všetky varianty tohto tovaru.</strong>`,
        confirmButtonText: 'Vymazať',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: boolean) => {
      if (result && this.currentEntityId && this.currentDodavatelId) {
        this.dodavatelTovaryHttpClient.delete(this.currentDodavatelId, this.currentEntityId)
          .subscribe({
            next: () => {
              this.showMessageDialog('Tovar vymazaný', 'Tovar bol úspešne vymazaný vrátane všetkých jeho variantov.', 'check_circle', 'primary');
              this.router.navigate(['/dodavatelia', this.currentDodavatelId]);
            },
            error: (error: any) => {
              console.error('Chyba pri mazaní tovaru:', error);
              let errorMessage = 'Pri mazaní tovaru sa vyskytla chyba.';
              if (error.status === 409) {
                errorMessage = 'Tovar nie je možné vymazať, pretože je použitý v cenových ponukách.';
              }
              else {
                errorMessage += ' Skúste akciu zopakovať alebo kontaktujte administrátora.';
              }
              this.showMessageDialog('Problém pri mazaní', errorMessage, 'error', 'warn');
            }
          });
      } else if (result) {
          console.error("Cannot delete: Missing currentEntityId or currentDodavatelId.");
          this.showMessageDialog('Interná chyba', 'Chýba ID tovaru alebo dodávateľa pre vymazanie.', 'error', 'warn');
      }
    });
  }

  openVariantDialog(variant: VariantDTO | null = null): void {
    if (!this.currentEntityId) {
      this.showMessageDialog('Chyba', 'Pred pridaním variantu musíte najprv uložiť tovar.', 'error', 'warn');
      return;
    }

    const dialogRef = this.dialog.open(VariantDialogComponent, {
      width: '600px',
      data: {
        variant: variant,
        tovarId: this.currentEntityId,
        isNew: !variant
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if (result) {
        if (!this.currentDodavatelId) {
          this.showMessageDialog('Chyba', 'Chýba ID dodávateľa pre uloženie variantu.', 'error', 'warn');
          return;
        }

        if (!variant) {
          const command: CreateVariantTovarCommand = {
            tovarId: this.currentEntityId!,
            velkost: result.velkost,
            farbaHex: result.farbaHex,
            cena: result.cena,
            obrazokURL: null,
            aktivny: true
          };

          this.variantTovaryHttpClient.create(this.currentDodavatelId, this.currentEntityId!, command)
            .pipe(
              switchMap(() => this.loadEntityDetails(this.currentEntityId!)),
              finalize(() => this.isSaving = false),
              takeUntil(this.destroy$)
            )
            .subscribe({
              next: () => {
                this.showMessageDialog('Variant pridaný', 'Nový variant bol úspešne vytvorený.', 'check_circle', 'primary');
              },
              error: (error: any) => {
                console.error('Chyba pri vytváraní variantu:', error);
                let errorMessage = 'Pri vytváraní nového variantu sa vyskytla chyba.';
                if (error.status === 409 || error.status === 400) {
                  errorMessage = 'Variant s touto kombináciou veľkosti a farby už existuje.';
                } else if (error.status === 404) {
                  errorMessage = 'Tovar pre tento variant nebol nájdený.';
                }
                this.showMessageDialog('Problém pri pridávaní', errorMessage, 'error', 'warn');
              }
            });
        } else {
          const command: UpdateVariantTovarCommand = {
            tovarId: this.currentEntityId!,
            variantId: variant.id,
            velkost: result.velkost,
            farbaHex: result.farbaHex,
            cena: result.cena,
            obrazokURL: null
          };

          this.variantTovaryHttpClient.update(this.currentDodavatelId, this.currentEntityId!, variant.id, command)
            .pipe(
              switchMap(() => {
                if (this.currentEntityId) {
                  return this.loadEntityDetails(this.currentEntityId);
                } else {
                  return of(null);
                }
              }),
              takeUntil(this.destroy$)
            )
            .subscribe({
              next: () => {
                this.showMessageDialog('Variant upravený', 'Variant bol úspešne upravený.', 'check_circle', 'primary');
              },
              error: (error) => {
                console.error('Chyba pri úprave variantu:', error);
                let errorMessage = 'Pri úprave variantu sa vyskytla chyba.';
                if (error.status === 409 || error.status === 400) {
                  errorMessage = 'Variant s touto kombináciou veľkosti a farby už existuje.';
                }
                this.showMessageDialog('Problém pri úprave', errorMessage, 'error', 'warn');
              }
            });
        }
      }
    });
  }

  deleteVariant(variant: VariantDTO): void {
    if (!this.currentEntityId || !this.currentDodavatelId) {
      console.warn('Cannot delete variant without entity or supplier ID.');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Vymazať variant',
        message: `Naozaj chcete natrvalo vymazať tento variant tovaru?`,
        confirmButtonText: 'Vymazať',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result && this.currentDodavatelId) {
        this.variantTovaryHttpClient.delete(this.currentDodavatelId, this.currentEntityId!, variant.id)
          .pipe(
            switchMap(() => {
              if (this.currentEntityId) {
                return this.loadEntityDetails(this.currentEntityId);
              } else {
                return of(null);
              }
            }),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: () => {
              this.showMessageDialog('Variant vymazaný', 'Variant bol úspešne vymazaný.', 'check_circle', 'primary');
            },
            error: (error) => {
              console.error('Chyba pri mazaní variantu:', error);
              let errorMessage = 'Pri mazaní variantu sa vyskytla chyba.';
              if (error.status === 409) {
                errorMessage = 'Variant nie je možné vymazať, pretože je použitý v cenových ponukách alebo objednávkach.';
              }
              else {
                errorMessage += ' Skúste akciu zopakovať alebo kontaktujte administrátora.';
              }
              this.showMessageDialog('Problém pri mazaní', errorMessage, 'error', 'warn');
            }
          });
      }
    });
  }

  toggleVariantAktivny(variant: VariantDTO): void {
    if (!this.currentEntityId || !this.currentDodavatelId) {
      console.warn('Cannot toggle variant status without entity or supplier ID.');
      return;
    }

    const newStatus = !variant.aktivny;
    const actionText = newStatus ? 'aktivovať' : 'deaktivovať';

    const command: UpdateVariantTovarAktivnyCommand = {
      tovarId: this.currentEntityId,
      variantId: variant.id,
      aktivny: newStatus
    };

    this.variantTovaryHttpClient.updateAktivny(this.currentDodavatelId, this.currentEntityId, variant.id, command)
      .pipe(
        switchMap(() => {
          if (this.currentEntityId) {
            return this.loadEntityDetails(this.currentEntityId);
          } else {
            return of(null);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.showMessageDialog(
            'Stav aktualizovaný',
            `Variant bol úspešne ${newStatus ? 'aktivovaný' : 'deaktivovaný'}.`,
            'check_circle',
            'primary'
          );
        },
        error: (error) => {
          console.error(`Chyba pri ${actionText} variantu:`, error);
          this.showMessageDialog('Chyba', `Nepodarilo sa ${actionText} variant.`, 'error', 'warn');
        }
      });
  }

  goBack(): void {
    if (this.formChangedSubject.getValue() && !this.isAddMode) {
         const dialogRef = this.dialog.open(ConfirmDialogComponent, {
           data: {
             title: 'Neuložené zmeny',
             message: 'Máte neuložené zmeny. Naozaj chcete opustiť stránku bez uloženia?',
             confirmButtonText: 'Opustiť',
             confirmButtonColor: 'warn'
           }
         });

         dialogRef.afterClosed().subscribe(result => {
           if (result) {
             if (this.currentDodavatelId) {
              this.location.back();
            } else {
                this.location.back();
             }
           }
         });
    } else if (this.isAddMode) {
         if (this.currentDodavatelId) {
          this.location.back();
        } 
    }
    else {
      this.location.back();
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

  getEffectivePrice(variant: VariantDTO): number | null {
    if (variant.cena != null && variant.cena != 0) {
      return variant.cena;
    }
    const details = this.getCurrentDetails();
    if (details && details.cena != null && details.cena != 0) {
      return details.cena;
    }
    return null;
  }

  navigateToSupplier(): void {
    if (this.currentDodavatelId) {
      this.router.navigate(['/dodavatelia', this.currentDodavatelId]);
    } else {
        console.warn("Cannot navigate to supplier, currentDodavatelId is null.");
    }
  }
}
