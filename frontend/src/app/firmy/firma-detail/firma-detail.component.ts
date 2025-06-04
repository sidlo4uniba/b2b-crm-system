import { Component, OnInit, ViewChild, OnDestroy, Inject, AfterViewInit } from '@angular/core';
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

import { FirmaDetailDTO, FirmaDTO, KontaktnaOsobaDTO, UpdateFirmaCommand, CreateFirmaCommand, PaginatedList, CreatedResponse, AdresaDTO, ObjednavkaSimpleDTO } from '../../shared/services/http-clients/firmy/firmy-http-client.models';
import { FirmyHttpClientService } from '../../shared/services/http-clients/firmy/firmy-http-client.service';
import { KontaktneOsobyHttpClientService } from '../../shared/services/http-clients/kontaktne-osoby/kontaktne-osoby-http-client.service';
import { CreateKontaktnaOsobaCommand, UpdateKontaktnaOsobaCommand, UpdateKontaktnaOsobaAktivnyCommand } from '../../shared/services/http-clients/kontaktne-osoby/kontaktne-osoby-http-client.models';
import { ObjednavkyHttpClientService } from '../../shared/services/http-clients/objednavky/objednavky-http-client.service';
import { ObjednavkaFaza, ChybaKlienta, PatchObjednavkaCommand, CreateObjednavkaCommand } from '../../shared/services/http-clients/objednavky/objednavky-http-client.models';


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


export interface KontaktnaOsobaDialogData {
  kontaktnaOsoba: KontaktnaOsobaDTO | null;
  firmaId: number;
  isNew: boolean;
}

@Component({
  selector: 'app-kontaktna-osoba-dialog',
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
    MatSlideToggleModule
  ],
  template: `
    <div class="kontaktna-osoba-dialog-container">
      <h2 mat-dialog-title>{{ data.isNew ? 'Pridať novú kontaktnú osobu' : 'Upraviť kontaktnú osobu' }}</h2>
      <form [formGroup]="kontaktnaOsobaForm">
        <div mat-dialog-content>
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Meno</mat-label>
              <input matInput formControlName="meno" required>
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="kontaktnaOsobaForm.get('meno')?.hasError('required')">
                Meno je povinné
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Priezvisko</mat-label>
              <input matInput formControlName="priezvisko" required>
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="kontaktnaOsobaForm.get('priezvisko')?.hasError('required')">
                Priezvisko je povinné
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" required type="email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="kontaktnaOsobaForm.get('email')?.hasError('required')">
                Email je povinný
              </mat-error>
              <mat-error *ngIf="kontaktnaOsobaForm.get('email')?.hasError('email')">
                Neplatný formát emailu
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Telefón</mat-label>
              <input matInput formControlName="telefon" required>
              <mat-icon matSuffix>phone</mat-icon>
              <mat-error *ngIf="kontaktnaOsobaForm.get('telefon')?.hasError('required')">
                Telefón je povinný
              </mat-error>
              <mat-error *ngIf="kontaktnaOsobaForm.get('telefon')?.hasError('pattern')">
                Neplatný formát telefónneho čísla
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row" *ngIf="data.isNew">
            <mat-slide-toggle formControlName="aktivny">Aktívna osoba</mat-slide-toggle>
          </div>
        </div>
        
        <div mat-dialog-actions align="end">
          <button mat-button (click)="onCancelClick()">Zrušiť</button>
          <button mat-flat-button color="primary" (click)="onSaveClick()">
            {{ data.isNew ? 'Pridať' : 'Uložiť' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .kontaktna-osoba-dialog-container {
      min-width: 450px;
    }
    
    .form-row {
      margin-bottom: 16px;
    }
    
    .form-field {
      width: 100%;
    }
    
    div[mat-dialog-actions] {
      margin-top: 16px;
    }
  `]
})
export class KontaktnaOsobaDialogComponent {
  kontaktnaOsobaForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<KontaktnaOsobaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: KontaktnaOsobaDialogData
  ) {
    this.kontaktnaOsobaForm = this.formBuilder.group({
      meno: [data.kontaktnaOsoba?.meno || '', [Validators.required]],
      priezvisko: [data.kontaktnaOsoba?.priezvisko || '', [Validators.required]],
      email: [data.kontaktnaOsoba?.email || '', [Validators.required, Validators.email]],
      telefon: [data.kontaktnaOsoba?.telefon || '', [Validators.required, Validators.pattern(/^\+?[\d\s-]{9,15}$/)]],
      aktivny: [data.kontaktnaOsoba?.aktivny !== undefined ? data.kontaktnaOsoba.aktivny : true]
    });
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.kontaktnaOsobaForm.valid) {
      const formValue = this.kontaktnaOsobaForm.value;
      let result: CreateKontaktnaOsobaCommand | UpdateKontaktnaOsobaCommand;
      
      if (this.data.isNew) {
        
        result = {
          firmaId: this.data.firmaId,
          meno: formValue.meno,
          priezvisko: formValue.priezvisko,
          email: formValue.email,
          telefon: formValue.telefon,
          aktivny: formValue.aktivny
        };
      } else {
        
        result = {
          firmaId: this.data.firmaId,
          kontaktnaOsobaId: this.data.kontaktnaOsoba!.id,
          meno: formValue.meno,
          priezvisko: formValue.priezvisko,
          email: formValue.email,
          telefon: formValue.telefon
        };
      }
      
      this.dialogRef.close(result);
    }
  }
}


@Component({
  selector: 'app-add-objednavka-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Vybrať kontaktnú osobu pre novú objednávku</h2>
    <div mat-dialog-content>
      <div class="mat-elevation-z8 table-container">
        <table mat-table [dataSource]="dataSource" matSort class="kontaktne-osoby-table">
          
          
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let element">
              <mat-icon [color]="isSelected(element.id) ? 'primary' : ''" class="selection-status-icon">
                {{ isSelected(element.id) ? 'check_circle' : 'radio_button_unchecked' }}
              </mat-icon>
            </td>
          </ng-container>

          
          <ng-container matColumnDef="meno">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Meno</th>
            <td mat-cell *matCellDef="let element">{{ element.meno }}</td>
          </ng-container>

          
          <ng-container matColumnDef="priezvisko">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Priezvisko</th>
            <td mat-cell *matCellDef="let element">{{ element.priezvisko }}</td>
          </ng-container>

          
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let element">{{ element.email }}</td>
          </ng-container>

          
          <ng-container matColumnDef="telefon">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Telefón</th>
            <td mat-cell *matCellDef="let element">{{ element.telefon }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
              (click)="selectRow(row)" 
              [class.selected-row]="isSelected(row.id)"></tr>
        </table>

        <div *ngIf="!kontaktneOsoby.length" class="empty-table-message">
          <p>Táto firma nemá žiadne dostupné kontaktné osoby.</p>
        </div>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancelClick()">Zrušiť</button>
      <button mat-button mat-flat-button color="primary" (click)="onCreateClick()" [disabled]="!selectedOsobaId">
        Vytvoriť objednávku
      </button>
    </div>
  `,
  styles: [`
    .table-container {
      max-height: 400px;
      overflow: auto;
      margin-bottom: 16px;
    }
    .kontaktne-osoby-table {
      width: 100%;
    }
    .empty-table-message {
      padding: 20px;
      text-align: center;
      color: rgba(0, 0, 0, 0.54);
    }
    .selection-status-icon {
      margin-right: 8px;
    }
    .selected-row {
      background-color: rgba(0, 0, 0, 0.04);
    }
    tr.mat-row {
      cursor: pointer;
    }
    tr.mat-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class AddObjednavkaDialogComponent implements AfterViewInit {
  displayedColumns: string[] = ['select', 'meno', 'priezvisko', 'email', 'telefon'];
  dataSource: MatTableDataSource<KontaktnaOsobaDTO>;
  kontaktneOsoby: KontaktnaOsobaDTO[] = [];
  selectedOsobaId: number | null = null;
  
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialogRef: MatDialogRef<AddObjednavkaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      kontaktneOsoby: KontaktnaOsobaDTO[],
      firmaId: number
    }
  ) {
    this.kontaktneOsoby = this.data.kontaktneOsoby.filter(o => o.aktivny);
    this.dataSource = new MatTableDataSource(this.kontaktneOsoby);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  isSelected(id: number): boolean {
    return this.selectedOsobaId === id;
  }

  selectRow(row: KontaktnaOsobaDTO): void {
    this.selectedOsobaId = row.id;
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onCreateClick(): void {
    if (this.selectedOsobaId) {
      this.dialogRef.close({
        firmaId: this.data.firmaId,
        kontaktnaOsobaId: this.selectedOsobaId
      });
    }
  }
}

@Component({
  selector: 'app-firma-detail',
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
    MatCheckboxModule,
    AddObjednavkaDialogComponent
  ],
  templateUrl: './firma-detail.component.html',
  styleUrls: [
    '../../shared/styles/detail-table-default.css'
  ]
})
export class FirmaDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  
  currentEntityId: number | null = null;
  isAddMode = false;
  pageTitle = 'Detail firmy';
  isSaving = false;
  isLoadingData = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  
  detailForm!: FormGroup;
  private formChangedSubject = new BehaviorSubject<boolean>(false);
  formChanged$ = this.formChangedSubject.asObservable();
  private detailsSubject = new BehaviorSubject<FirmaDetailDTO | null>(null);
  details$ = this.detailsSubject.asObservable();

  
  kontaktneOsobyDisplayedColumns: string[] = ['meno', 'email', 'telefon', 'aktivny', 'akcie'];
  kontaktneOsobyDataSource = new MatTableDataSource<KontaktnaOsobaDTO>([]);
  isLoadingTable = false;
  @ViewChild('kontaktneOsobySort') kontaktneOsobySort!: MatSort;

  
  objednavkyDisplayedColumns: string[] = ['faza', 'zrusene', 'zaplatene', 'chybaKlienta', 'kontaktnaOsoba', 'telefon', 'naplanovanyDatumVyroby', 'ocakavanyDatumDorucenia', 'akcie'];
  objednavkyDataSource = new MatTableDataSource<ObjednavkaSimpleDTO>([]);
  isLoadingObjednavkyTable = false;
  @ViewChild('objednavkySort') objednavkySort!: MatSort;
  @ViewChild('objednavkyPaginator') objednavkyPaginator!: MatPaginator;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private firmyHttpClient: FirmyHttpClientService,
    private kontaktneOsobyHttpClient: KontaktneOsobyHttpClientService,
    private objednavkyHttpClient: ObjednavkyHttpClientService,
    private location: Location
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.isLoadingData = true; 

    
    this.formChanged$.pipe(takeUntil(this.destroy$)).subscribe();

    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const idParam = params.get('id');

        if (idParam === 'pridat') {
          this.isAddMode = true;
          this.currentEntityId = null;
          this.pageTitle = 'Nová firma';
          this.resetForm();
          this.updateKontaktneOsobyTable([]); 
          this.isLoadingData = false; 
          return of(null); 
        } else if (idParam) {
          const id = +idParam;
          if (!isNaN(id)) {
            this.isAddMode = false;
            this.currentEntityId = id;
            this.pageTitle = 'Detail firmy';
            
            return this.loadEntityDetails(id).pipe(
              catchError(err => {
                console.error('Error loading entity details in ngOnInit:', err);
                this.showMessageDialog(
                  'Chyba pri načítaní dát',
                  `Nepodarilo sa načítať údaje firmy (ID: ${id}). Skúste obnoviť stránku alebo kontaktujte administrátora.`,
                  'error',
                  'warn'
                );
                this.router.navigate(['/firmy']); 
                return of(null);
              })
            );
          } else {
            console.error(`Invalid ID parameter: ${idParam}`);
            this.showMessageDialog('Chyba', 'Neplatné ID firmy v URL adrese.', 'error', 'warn');
            this.router.navigate(['/firmy']);
            this.isLoadingData = false;
            return of(null);
          }
        } else {
           console.error('Missing ID parameter');
           this.showMessageDialog('Chyba', 'Chýba ID firmy v URL adrese.', 'error', 'warn');
           this.router.navigate(['/firmy']);
           this.isLoadingData = false;
           return of(null);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(details => {
        
        
    });
  }

  ngAfterViewInit(): void {
    
    this.setupKontaktneOsobyTable();
    this.setupObjednavkyTable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.detailForm = this.formBuilder.group({
      nazov: ['', Validators.required],
      ico: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      adresa: this.formBuilder.group({
        ulica: ['', [Validators.required, Validators.pattern(/.*\d.*/)]],
        mesto: ['', Validators.required],
        psc: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        krajina: ['Slovensko', Validators.required]
      }),
      icDph: ['', Validators.pattern(/^\d{10}$/)],
    });

    this.detailForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (!this.isAddMode) {
        const currentDetails = this.getCurrentDetails();
        if (currentDetails) {
          const formValuesChanged = this.isFormDifferentFromEntity(this.detailForm.value, currentDetails);
          this.formChangedSubject.next(formValuesChanged);
        }
      }
    });
  }

  isFormDifferentFromEntity(formValues: any, entity: FirmaDetailDTO): boolean {
    return formValues.nazov !== entity.nazov ||
      formValues.ico !== entity.ico ||
      formValues.adresa.ulica !== entity.adresa.ulica ||
      formValues.adresa.mesto !== entity.adresa.mesto ||
      formValues.adresa.psc !== entity.adresa.psc ||
      formValues.adresa.krajina !== entity.adresa.krajina ||
      formValues.icDph !== entity.icDph;
  }

  loadEntityDetails(id: number): Observable<FirmaDetailDTO | null> {
    this.isLoadingData = true;
    this.errorMessage = '';
    this.isLoadingTable = true; 
    this.isLoadingObjednavkyTable = true; 

    return this.firmyHttpClient.getById(id).pipe(
      tap(details => {
        if (details) {
          this.detailsSubject.next(details);
          this.detailForm.patchValue({
            nazov: details.nazov,
            ico: details.ico,
            adresa: {
              ulica: details.adresa?.ulica || '',
              mesto: details.adresa?.mesto || '',
              psc: details.adresa?.psc || '',
              krajina: details.adresa?.krajina || 'Slovensko'
            },
            icDph: details.icDph,
          });
          this.updateKontaktneOsobyTable(details.kontaktneOsoby || []);
          this.updateObjednavkyTable(details.objednavky || []);
          this.resetFormChangeState();
          this.detailForm.markAsPristine();
          this.detailForm.markAsUntouched();
        } else {
          console.warn(`No details returned for Firma ID: ${id}`);
          this.errorMessage = 'Nepodarilo sa načítať detaily firmy.';
          this.detailsSubject.next(null);
          this.updateKontaktneOsobyTable([]);
          this.updateObjednavkyTable([]);
          this.resetForm(); 
        }
      }),
      catchError(error => {
        console.error('Error loading firm details', error);
        this.errorMessage = `Nastala chyba pri načítaní detailov firmy: ${error.message || 'Neznáma chyba'}`;
        this.detailsSubject.next(null);
        this.updateKontaktneOsobyTable([]);
        this.updateObjednavkyTable([]);
        this.resetForm(); 
        
        
        this.showMessageDialog(
          'Chyba pri načítaní dát',
          `Nastala chyba pri načítaní detailov firmy: ${error.message || 'Neznáma chyba'}`,
          'error',
          'warn'
        );
        
        return of(null);
      }),
      finalize(() => {
        this.isLoadingData = false;
        this.isLoadingTable = false; 
        this.isLoadingObjednavkyTable = false; 
        
        
        setTimeout(() => {
          this.setupKontaktneOsobyTable();
          this.setupObjednavkyTable();
        });
      })
    );
  }

  resetFormChangeState(): void {
    this.formChangedSubject.next(false);
  }

  getCurrentDetails(): FirmaDetailDTO | null {
    return this.detailsSubject.value;
  }

  resetForm(): void {
    if (this.isAddMode) {
      
      this.detailForm.reset({
        nazov: '',
        ico: '',
        adresa: {
          ulica: '',
          mesto: '',
          psc: '',
          krajina: 'Slovensko' 
        },
        icDph: '',
      });
    } else {
      
      const currentDetails = this.getCurrentDetails();
      if (currentDetails) {
        this.detailForm.patchValue({
          nazov: currentDetails.nazov,
          ico: currentDetails.ico,
          adresa: {
            ulica: currentDetails.adresa?.ulica || '',
            mesto: currentDetails.adresa?.mesto || '',
            psc: currentDetails.adresa?.psc || '',
            krajina: currentDetails.adresa?.krajina || 'Slovensko'
          },
          icDph: currentDetails.icDph,
        });
      } else {
        
        console.warn('Attempted to reset form in edit mode, but no current details were found. Resetting to blank.');
        this.detailForm.reset({
          nazov: '',
          ico: '',
          adresa: {
            ulica: '',
            mesto: '',
            psc: '',
            krajina: 'Slovensko'
          },
          icDph: '',
        });
      }
    }
    
    this.resetFormChangeState();
    this.detailForm.markAsPristine();
    this.detailForm.markAsUntouched();
  }

  saveForm(): void {
    if (this.detailForm.invalid) {
      
      Object.keys(this.detailForm.controls).forEach(key => {
        const control = this.detailForm.get(key);
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(subKey => {
            control.get(subKey)?.markAsTouched();
          });
        } else {
          control?.markAsTouched();
        }
      });
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const formValue = this.detailForm.value;

    if (this.isAddMode) {
      
      const createCommand: CreateFirmaCommand = {
        nazov: formValue.nazov,
        ico: formValue.ico,
        adresa: {
          ulica: formValue.adresa.ulica,
          mesto: formValue.adresa.mesto,
          psc: formValue.adresa.psc,
          krajina: formValue.adresa.krajina
        },
        icDph: formValue.icDph || null
      };

      this.firmyHttpClient.create(createCommand).pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSaving = false;
        })
      ).subscribe({
        next: (response: CreatedResponse) => {
          console.log('Firma successfully created with ID:', response.id);
          this.showMessageDialog(
            'Úspech',
            'Firma bola úspešne vytvorená.',
            'check_circle',
            'primary'
          );
          
          
          this.router.navigate(['/firmy', response.id]);
        },
        error: (error) => {
          console.error('Error creating firm', error);
          
          if (error.status === 409) {
            
            let errorMsg: string;
            if (error.error?.errors?.ico) {
              errorMsg = `Firma s IČO ${formValue.ico} už existuje.`;
            } else if (error.error?.errors?.icDph) {
              errorMsg = `Firma s IČ DPH ${formValue.icDph} už existuje.`;
            } else {
              errorMsg = 'Firma s týmito údajmi už existuje.';
            }
            
            this.errorMessage = errorMsg;
            this.showMessageDialog(
              'Konflikt údajov',
              errorMsg,
              'error',
              'warn'
            );
          } else {
            const errorMsg = `Nastala chyba pri vytváraní firmy: ${error.message || 'Neznáma chyba'}`;
            this.errorMessage = errorMsg;
            this.showMessageDialog(
              'Chyba',
              errorMsg,
              'error',
              'warn'
            );
          }
        }
      });
    } else {
      
      if (!this.currentEntityId) {
        const errorMsg = 'Chýba ID firmy pre aktualizáciu';
        this.errorMessage = errorMsg;
        this.showMessageDialog(
          'Chyba',
          errorMsg,
          'error',
          'warn'
        );
        this.isSaving = false;
        return;
      }

      const updateCommand: UpdateFirmaCommand = {
        id: this.currentEntityId,
        nazov: formValue.nazov,
        ico: formValue.ico,
        adresa: {
          ulica: formValue.adresa.ulica,
          mesto: formValue.adresa.mesto,
          psc: formValue.adresa.psc,
          krajina: formValue.adresa.krajina
        },
        icDph: formValue.icDph || null
      };

      this.firmyHttpClient.update(this.currentEntityId, updateCommand).pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSaving = false;
        })
      ).subscribe({
        next: () => {
          console.log('Firma successfully updated');
          this.loadEntityDetails(this.currentEntityId!).subscribe();
          this.showMessageDialog(
            'Úspech',
            'Firma bola úspešne aktualizovaná.',
            'check_circle',
            'primary'
          );
        },
        error: (error) => {
          console.error('Error updating firm', error);
          
          if (error.status === 409) {
            
            let errorMsg: string;
            if (error.error?.errors?.ico) {
              errorMsg = `Firma s IČO ${formValue.ico} už existuje.`;
            } else if (error.error?.errors?.icDph) {
              errorMsg = `Firma s IČ DPH ${formValue.icDph} už existuje.`;
            } else {
              errorMsg = 'Firma s týmito údajmi už existuje.';
            }
            
            this.errorMessage = errorMsg;
            this.showMessageDialog(
              'Konflikt údajov',
              errorMsg,
              'error',
              'warn'
            );
          } else {
            const errorMsg = `Nastala chyba pri aktualizácii firmy: ${error.message || 'Neznáma chyba'}`;
            this.errorMessage = errorMsg;
            this.showMessageDialog(
              'Chyba',
              errorMsg,
              'error',
              'warn'
            );
          }
        }
      });
    }
  }

  updateKontaktneOsobyTable(data: KontaktnaOsobaDTO[]): void {
    this.kontaktneOsobyDataSource.data = data;
    
  }

  updateObjednavkyTable(data: ObjednavkaSimpleDTO[]): void {
    this.objednavkyDataSource.data = data;
  }

  toggleAktivnyStatus(): void {
    
    
    this.showMessageDialog(
      'Informácia',
      'Firmy nemajú možnosť aktivácie/deaktivácie.',
      'info',
      'primary'
    );
  }

  confirmDelete(): void {
    if (!this.currentEntityId) {
      const errorMsg = 'Chýba ID firmy pre odstránenie';
      this.errorMessage = errorMsg;
      this.showMessageDialog(
        'Chyba',
        errorMsg,
        'error',
        'warn'
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Potvrdiť vymazanie',
        message: 'Naozaj chcete vymazať túto firmu? Táto akcia je nevratná a odstráni všetky súvisiace údaje.',
        confirmButtonText: 'Vymazať',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.firmyHttpClient.delete(this.currentEntityId!).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            console.log('Firma successfully deleted');
            this.showMessageDialog(
              'Úspech',
              'Firma bola úspešne vymazaná.',
              'check_circle',
              'primary'
            );
            this.router.navigate(['../'], { relativeTo: this.route });
          },
          error: (error) => {
            console.error('Error deleting firm', error);
            
            if (error.status === 409) {
              
              this.showMessageDialog(
                'Vymazanie nebolo možné',
                'Túto firmu nie je možné vymazať, pretože existujú objednávky alebo iné záznamy, ktoré sa na ňu odkazujú.',
                'error',
                'warn'
              );
            } else {
              const errorMsg = `Nastala chyba pri vymazávaní firmy: ${error.message || 'Neznáma chyba'}`;
              this.errorMessage = errorMsg;
              this.showMessageDialog(
                'Chyba',
                errorMsg,
                'error',
                'warn'
              );
            }
          }
        });
      }
    });
  }

  openKontaktnaOsobaDialog(kontaktnaOsoba: KontaktnaOsobaDTO | null = null): void {
    if (!this.currentEntityId) {
      const errorMsg = 'Najprv uložte firmu pre pridanie kontaktných osôb';
      this.errorMessage = errorMsg;
      this.showMessageDialog(
        'Upozornenie',
        errorMsg,
        'warning',
        'warn'
      );
      return;
    }

    const dialogRef = this.dialog.open(KontaktnaOsobaDialogComponent, {
      data: {
        kontaktnaOsoba: kontaktnaOsoba,
        firmaId: this.currentEntityId,
        isNew: !kontaktnaOsoba
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (kontaktnaOsoba) {
        
        const updateCommand: UpdateKontaktnaOsobaCommand = result as UpdateKontaktnaOsobaCommand;
        
        this.kontaktneOsobyHttpClient.update(
          this.currentEntityId!, 
          kontaktnaOsoba.id, 
          updateCommand
        ).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            console.log('Kontaktná osoba successfully updated');
            this.loadEntityDetails(this.currentEntityId!).subscribe();
            this.showMessageDialog(
              'Úspech',
              'Kontaktná osoba bola úspešne aktualizovaná.',
              'check_circle',
              'primary'
            );
          },
          error: (error) => {
            console.error('Error updating contact person', error);
            const errorMsg = `Nastala chyba pri aktualizácii kontaktnej osoby: ${error.message || 'Neznáma chyba'}`;
            this.errorMessage = errorMsg;
            this.showMessageDialog(
              'Chyba',
              errorMsg,
              'error',
              'warn'
            );
          }
        });
      } else {
        
        const createCommand: CreateKontaktnaOsobaCommand = result as CreateKontaktnaOsobaCommand;
        
        this.kontaktneOsobyHttpClient.create(this.currentEntityId!, createCommand).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (response: CreatedResponse) => {
            console.log('Kontaktná osoba successfully created with ID:', response.id);
            this.loadEntityDetails(this.currentEntityId!).subscribe();
            this.showMessageDialog(
              'Úspech',
              'Kontaktná osoba bola úspešne vytvorená.',
              'check_circle',
              'primary'
            );
          },
          error: (error) => {
            console.error('Error creating contact person', error);
            const errorMsg = `Nastala chyba pri vytváraní kontaktnej osoby: ${error.message || 'Neznáma chyba'}`;
            this.errorMessage = errorMsg;
            this.showMessageDialog(
              'Chyba',
              errorMsg,
              'error',
              'warn'
            );
          }
        });
      }
    });
  }

  deleteKontaktnaOsoba(kontaktnaOsoba: KontaktnaOsobaDTO): void {
    if (!this.currentEntityId) {
      const errorMsg = 'Chýba ID firmy';
      this.errorMessage = errorMsg;
      this.showMessageDialog(
        'Chyba',
        errorMsg,
        'error',
        'warn'
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Potvrdiť vymazanie',
        message: `Naozaj chcete vymazať kontaktnú osobu ${kontaktnaOsoba.meno} ${kontaktnaOsoba.priezvisko}? Táto akcia je nevratná.`,
        confirmButtonText: 'Vymazať',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.kontaktneOsobyHttpClient.delete(this.currentEntityId!, kontaktnaOsoba.id).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            console.log('Kontaktná osoba successfully deleted');
            this.loadEntityDetails(this.currentEntityId!).subscribe();
            this.showMessageDialog(
              'Úspech',
              'Kontaktná osoba bola úspešne vymazaná.',
              'check_circle',
              'primary'
            );
          },
          error: (error) => {
            console.error('Error deleting contact person', error);
            
            if (error.status === 409) {
              
              this.showMessageDialog(
                'Vymazanie nebolo možné',
                'Túto kontaktnú osobu nie je možné vymazať, pretože existujú objednávky alebo iné záznamy, ktoré sa na ňu odkazujú.',
                'error',
                'warn'
              );
            } else {
              this.errorMessage = `Nastala chyba pri vymazávaní kontaktnej osoby: ${error.message || 'Neznáma chyba'}`;
              this.showMessageDialog(
                'Chyba',
                this.errorMessage,
                'error',
                'warn'
              );
            }
          }
        });
      }
    });
  }

  toggleKontaktnaOsobaAktivny(kontaktnaOsoba: KontaktnaOsobaDTO): void {
    if (!this.currentEntityId) {
      const errorMsg = 'Chýba ID firmy';
      this.errorMessage = errorMsg;
      this.showMessageDialog(
        'Chyba',
        errorMsg,
        'error',
        'warn'
      );
      return;
    }

    const newStatus = !kontaktnaOsoba.aktivny;
    const actionText = newStatus ? 'aktiváciu' : 'deaktiváciu';
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Potvrdiť ${actionText}`,
        message: `Naozaj chcete ${newStatus ? 'aktivovať' : 'deaktivovať'} kontaktnú osobu ${kontaktnaOsoba.meno} ${kontaktnaOsoba.priezvisko}?`,
        confirmButtonText: newStatus ? 'Aktivovať' : 'Deaktivovať',
        confirmButtonColor: newStatus ? 'primary' : 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const command: UpdateKontaktnaOsobaAktivnyCommand = {
          firmaId: this.currentEntityId!,
          kontaktnaOsobaId: kontaktnaOsoba.id,
          aktivny: newStatus
        };

        this.kontaktneOsobyHttpClient.updateAktivny(this.currentEntityId!, kontaktnaOsoba.id, command).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            console.log(`Kontaktná osoba successfully ${newStatus ? 'activated' : 'deactivated'}`);
            this.loadEntityDetails(this.currentEntityId!).subscribe();
            this.showMessageDialog(
              'Úspech',
              `Kontaktná osoba bola úspešne ${newStatus ? 'aktivovaná' : 'deaktivovaná'}.`,
              'check_circle',
              'primary'
            );
          },
          error: (error) => {
            console.error(`Error ${newStatus ? 'activating' : 'deactivating'} contact person`, error);
            this.errorMessage = `Nastala chyba pri ${actionText} kontaktnej osoby: ${error.message || 'Neznáma chyba'}`;
            this.showMessageDialog(
              'Chyba',
              this.errorMessage,
              'error',
              'warn'
            );
          }
        });
      }
    });
  }

  goBack(): void {
    if (this.formChangedSubject.getValue() && !this.isAddMode) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Neuložené zmeny',
          message: 'Máte neuložené zmeny. Naozaj chcete opustiť túto stránku?',
          confirmButtonText: 'Áno, opustiť',
          confirmButtonColor: 'primary'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.location.back();
        }
      });
    } else {
      this.location.back();
    }
  }

  get isEmptyTable(): boolean {
    return this.kontaktneOsobyDataSource.data.length === 0;
  }

  showMessageDialog(title: string, message: string, icon: string, iconColor: 'primary' | 'accent' | 'warn'): void {
    this.dialog.open(MessageDialogComponent, {
      data: { title, message, icon, iconColor }
    });
  }

  setupKontaktneOsobyTable(): void {
    
    if (this.kontaktneOsobySort && this.kontaktneOsobyDataSource) {
        this.kontaktneOsobyDataSource.sort = this.kontaktneOsobySort;

        
        
        
        this.kontaktneOsobyDataSource.sortingDataAccessor = (item: KontaktnaOsobaDTO, property: string): string | number => {
            switch (property) {
                
                case 'aktivny': return item.aktivny ? 1 : 0;
                case 'meno': return `${item.meno} ${item.priezvisko}`.toLowerCase(); 
                
                default:
                    const value = (item as any)[property];
                    
                    return typeof value === 'string' ? value.toLowerCase() : (value ?? 0);
            }
        };

        
        
        if (!this.kontaktneOsobySort.active || this.kontaktneOsobySort.direction === '') {
            this.kontaktneOsobySort.active = 'aktivny';
            
            this.kontaktneOsobySort.direction = 'desc';
            
            
            setTimeout(() => {
                this.kontaktneOsobySort.sortChange.emit({ active: this.kontaktneOsobySort.active, direction: this.kontaktneOsobySort.direction });
            });
        }
    } else if (!this.kontaktneOsobyDataSource) {
        console.warn('KontaktneOsoby DataSource is not available for sorting setup.');
    }
     
     
     
  }

  
  setupObjednavkyTable(): void {
    if (this.objednavkySort && this.objednavkyDataSource) {
      this.objednavkyDataSource.sort = this.objednavkySort;

      
      this.objednavkyDataSource.sortingDataAccessor = (item: ObjednavkaSimpleDTO, property: string): string | number => {
        switch (property) {
          case 'faza': 
            
            return item.faza;
          case 'kontaktnaOsoba': 
            
            return `${item.kontaktnaOsobaMeno} ${item.kontaktnaOsobaPriezvisko}`.toLowerCase();
          case 'naplanovanyDatumVyroby':
            
            return item.naplanovanyDatumVyroby ? new Date(item.naplanovanyDatumVyroby).getTime() : 0;
          case 'ocakavanyDatumDorucenia':
            
            return item.ocakavanyDatumDorucenia ? new Date(item.ocakavanyDatumDorucenia).getTime() : 0;
          case 'zrusene':
            
            return item.zrusene ? 0 : 1;
          case 'zaplatene':
            
            return item.zaplatene ? 1 : 0;
          case 'chybaKlienta':
            
            return item.chybaKlienta !== null ? item.chybaKlienta : -1;
          case 'telefon':
            
            return item.kontaktnaOsobaTelefon ? item.kontaktnaOsobaTelefon.toLowerCase() : '';
          default:
            
            const value = (item as any)[property];
            return typeof value === 'string' ? value.toLowerCase() : (value ?? 0);
        }
      };

      
      if (!this.objednavkySort.active || this.objednavkySort.direction === '') {
        this.objednavkySort.active = 'zrusene';
        this.objednavkySort.direction = 'desc'; 
        
        setTimeout(() => {
          if (this.objednavkySort) {
            this.objednavkySort.sortChange.emit({ 
              active: this.objednavkySort.active, 
              direction: this.objednavkySort.direction 
            });
          }
        });
      }
    }

    
    if (this.objednavkyPaginator && this.objednavkyDataSource) {
      this.objednavkyDataSource.paginator = this.objednavkyPaginator;
    }
  }

  
  getCurrentFirmName(): string {
    const details = this.detailsSubject.value;
    return details?.nazov || '';
  }

  
  editObjednavka(objednavkaId: number): void {
    if (objednavkaId) {
      this.router.navigate(['/objednavky', objednavkaId]);
    } else {
      console.error("Cannot navigate to edit Objednavka: Missing Objednavka ID");
      this.showMessageDialog('Chyba', 'Chýba ID objednávky pre navigáciu na detail.', 'error', 'warn');
    }
  }

  
  toggleObjednavkaCancellation(objednavkaId: number, currentStatus: boolean): void {
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
        
        this.objednavkyHttpClient.patch(objednavkaId, patchCommand)
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
              
              
              if (this.currentEntityId) {
                this.loadEntityDetails(this.currentEntityId).subscribe();
              }
            },
            error: (error: unknown) => {
              console.error('Error updating order cancellation status', error);
              const errorMsg = `Nastala chyba pri ${action} objednávky.`;
              this.showMessageDialog(
                'Chyba',
                errorMsg,
                'error',
                'warn'
              );
            }
          });
      }
    });
  }

  
  deleteObjednavka(objednavkaId: number, firmaNazov: string): void {
    if (!objednavkaId) {
      console.error('Cannot delete: Missing objednavkaId.');
      this.showMessageDialog('Interná chyba', 'Chýba ID objednávky pre vymazanie.', 'error', 'warn');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Vymazať objednávku',
        message: `Naozaj chcete natrvalo vymazať objednávku pre firmu "${firmaNazov}"? <strong>Táto akcia je trvalá a nevratná</strong>, na rozdiel od zrušenia objednávky. Odstráni všetky súvisiace údaje.`,
        confirmButtonText: 'Vymazať',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: boolean) => {
      if (result) {
        this.objednavkyHttpClient.delete(objednavkaId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showMessageDialog('Objednávka vymazaná', `Objednávka bola úspešne vymazaná.`, 'check_circle', 'primary');
              
              
              if (this.currentEntityId) {
                this.loadEntityDetails(this.currentEntityId).subscribe();
              }
            },
            error: (error: unknown) => {
              console.error('Chyba pri mazaní objednávky:', error);
              let errorMsg = `Pri mazaní objednávky sa vyskytla chyba.`;
              if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
                errorMsg = 'Objednávku nie je možné vymazať, pretože je referovaná v inej časti systému.';
              } else {
                errorMsg += ' Skúste akciu zopakovať alebo kontaktujte administrátora.';
              }
              this.showMessageDialog('Problém pri mazaní', errorMsg, 'error', 'warn');
            }
          });
      }
    });
  }

  getErrorName(chyba: number | null): string {
    if (chyba === null) return '';
    
    switch (chyba) {
      case ChybaKlienta.ZrusenaPriVyrobe: return 'Zrušená pri výrobe';
      case ChybaKlienta.NezaplatenaNaCas: return 'Nezaplatená na čas';
      case ChybaKlienta.ZlaKomunikacia: return 'Zlá komunikácia';
      case ChybaKlienta.InyProblem: return 'Iný problém';
      default: return 'Neznáma chyba';
    }
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('sk-SK');
  }

  get isEmptyObjednavkyTable(): boolean {
    return this.objednavkyDataSource.data.length === 0;
  }

  
  openAddObjednavkaDialog(): void {
    if (!this.currentEntityId) {
      this.errorMessage = 'Chýba ID firmy pre vytvorenie objednávky';
      
      
      this.showMessageDialog(
        'Chyba',
        'Chýba ID firmy pre vytvorenie objednávky',
        'error',
        'warn'
      );
      return;
    }

    const currentDetails = this.getCurrentDetails();
    if (!currentDetails || !currentDetails.kontaktneOsoby || currentDetails.kontaktneOsoby.length === 0) {
      this.showMessageDialog(
        'Upozornenie',
        'Pre vytvorenie objednávky je potrebné najprv pridať kontaktnú osobu.',
        'warning',
        'warn'
      );
      return;
    }

    const dialogRef = this.dialog.open(AddObjednavkaDialogComponent, {
      width: '700px',
      data: {
        kontaktneOsoby: currentDetails.kontaktneOsoby,
        firmaId: this.currentEntityId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createNewObjednavka(result);
      }
    });
  }

  
  private createNewObjednavka(data: { firmaId: number, kontaktnaOsobaId: number }): void {
    const createCommand: CreateObjednavkaCommand = {
      firmaId: data.firmaId,
      kontaktnaOsobaId: data.kontaktnaOsobaId
    };

    this.objednavkyHttpClient.create(createCommand)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CreatedResponse) => {
          console.log('Objednávka successfully created with ID:', response.id);
          this.showMessageDialog(
            'Úspech',
            'Objednávka bola úspešne vytvorená.',
            'check_circle',
            'primary'
          );
          
          
          this.router.navigate(['/objednavky', response.id]);
        },
        error: (error) => {
          console.error('Error creating order', error);
          this.errorMessage = `Nastala chyba pri vytváraní objednávky: ${error.message || 'Neznáma chyba'}`;
          this.showMessageDialog(
            'Chyba',
            this.errorMessage,
            'error',
            'warn'
          );
        }
      });
  }

  
  getPhaseClassName(faza: ObjednavkaFaza | number | string): string {
    
    const fazaNum = typeof faza === 'number' ? faza : this.getFazaNumber(faza);
    
    switch (fazaNum) {
      case ObjednavkaFaza.Nacenenie: return 'phase-nacenenie';
      case ObjednavkaFaza.NacenenieCaka: return 'phase-nacenenie-caka';
      case ObjednavkaFaza.VyrobaNeriesene: return 'phase-vyroba-neriesene';
      case ObjednavkaFaza.VyrobaNemozna: return 'phase-vyroba-nemozna';
      case ObjednavkaFaza.VyrobaCaka: return 'phase-vyroba-caka';
      case ObjednavkaFaza.OdoslanieCaka: return 'phase-odoslanie-caka';
      case ObjednavkaFaza.PlatbaCaka: return 'phase-platba-caka';
      case ObjednavkaFaza.Vybavene: return 'phase-vybavene';
      default: return '';
    }
  }

  
  getPhaseName(faza: ObjednavkaFaza | number | string): string {
    
    const fazaNum = typeof faza === 'number' ? faza : this.getFazaNumber(faza);
    
    switch (fazaNum) {
      case ObjednavkaFaza.Nacenenie: return 'Nacenenie';
      case ObjednavkaFaza.NacenenieCaka: return 'Nacenenie čaká';
      case ObjednavkaFaza.VyrobaNeriesene: return 'Výroba neriešené';
      case ObjednavkaFaza.VyrobaNemozna: return 'Výroba nemožná';
      case ObjednavkaFaza.VyrobaCaka: return 'Výroba čaká';
      case ObjednavkaFaza.OdoslanieCaka: return 'Odoslanie čaká';
      case ObjednavkaFaza.PlatbaCaka: return 'Platba čaká';
      case ObjednavkaFaza.Vybavene: return 'Vybavené';
      default: return 'Neznáma';
    }
  }

  
  private getFazaNumber(faza: ObjednavkaFaza | number | string): number {
    
    if (typeof faza === 'number') {
      return faza;
    }
    
    
    switch (faza) {
      case 'Nacenenie': return ObjednavkaFaza.Nacenenie;
      case 'NacenenieCaka': return ObjednavkaFaza.NacenenieCaka;
      case 'VyrobaNeriesene': return ObjednavkaFaza.VyrobaNeriesene;
      case 'VyrobaNemozna': return ObjednavkaFaza.VyrobaNemozna;
      case 'VyrobaCaka': return ObjednavkaFaza.VyrobaCaka;
      case 'OdoslanieCaka': return ObjednavkaFaza.OdoslanieCaka;
      case 'PlatbaCaka': return ObjednavkaFaza.PlatbaCaka;
      case 'Vybavene': return ObjednavkaFaza.Vybavene;
      default: return -1;
    }
  }
}
