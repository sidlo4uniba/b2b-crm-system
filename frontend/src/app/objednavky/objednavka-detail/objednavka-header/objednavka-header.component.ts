import { Component, OnInit, ViewChild, OnDestroy, Inject, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
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
import { debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError, take, tap } from 'rxjs/operators';

import { FirmaDetailDTO, FirmaDTO, KontaktnaOsobaDTO, UpdateFirmaCommand, CreateFirmaCommand, PaginatedList, CreatedResponse, AdresaDTO } from '../../../shared/services/http-clients/firmy/firmy-http-client.models';
import { FirmyHttpClientService } from '../../../shared/services/http-clients/firmy/firmy-http-client.service';
import { KontaktneOsobyHttpClientService } from '../../../shared/services/http-clients/kontaktne-osoby/kontaktne-osoby-http-client.service';
import { CreateKontaktnaOsobaCommand, UpdateKontaktnaOsobaCommand, UpdateKontaktnaOsobaAktivnyCommand } from '../../../shared/services/http-clients/kontaktne-osoby/kontaktne-osoby-http-client.models';
import { ObjednavkyHttpClientService } from '../../../shared/services/http-clients/objednavky/objednavky-http-client.service';
import { 
  ObjednavkaDetailDTO, 
  ObjednavkaFaza, 
  ChybaKlienta, 
  PatchObjednavkaCommand 
} from '../../../shared/services/http-clients/objednavky/objednavky-http-client.models';



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
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isNew ? 'Pridať kontaktnú osobu' : 'Upraviť kontaktnú osobu' }}</h2>
    <div mat-dialog-content>
      <form [formGroup]="kontaktnaOsobaForm" class="kontaktna-osoba-form">
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Meno</mat-label>
          <input matInput formControlName="meno" required>
          <mat-error *ngIf="kontaktnaOsobaForm.get('meno')?.hasError('required')">
            Meno je povinné
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Priezvisko</mat-label>
          <input matInput formControlName="priezvisko" required>
          <mat-error *ngIf="kontaktnaOsobaForm.get('priezvisko')?.hasError('required')">
            Priezvisko je povinné
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Telefón</mat-label>
          <input matInput formControlName="telefon" required>
          <mat-error *ngIf="kontaktnaOsobaForm.get('telefon')?.hasError('required')">
            Telefón je povinný
          </mat-error>
          <mat-error *ngIf="kontaktnaOsobaForm.get('telefon')?.hasError('pattern')">
            Telefón musí mať minimálne 9 číslic
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" required>
          <mat-error *ngIf="kontaktnaOsobaForm.get('email')?.hasError('required')">
            Email je povinný
          </mat-error>
          <mat-error *ngIf="kontaktnaOsobaForm.get('email')?.hasError('email')">
            Zadajte platný email
          </mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancelClick()">Zrušiť</button>
      <button mat-button mat-flat-button color="primary" (click)="onSaveClick()" [disabled]="kontaktnaOsobaForm.invalid">Uložiť</button>
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
  selector: 'app-change-kontaktna-osoba-dialog',
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
    <h2 mat-dialog-title>Zmeniť kontaktnú osobu</h2>
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
      <button mat-button mat-flat-button color="primary" (click)="onChangeClick()" [disabled]="!selectedOsobaId">Zmeniť</button>
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
export class ChangeKontaktnaOsobaDialogComponent implements AfterViewInit {
  displayedColumns: string[] = ['select', 'meno', 'priezvisko', 'email', 'telefon'];
  dataSource: MatTableDataSource<KontaktnaOsobaDTO>;
  kontaktneOsoby: KontaktnaOsobaDTO[] = [];
  selectedOsobaId: number | null = null;
  
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialogRef: MatDialogRef<ChangeKontaktnaOsobaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      kontaktneOsoby: KontaktnaOsobaDTO[],
      currentKontaktnaOsobaId: number
    }
  ) {
    this.kontaktneOsoby = this.data.kontaktneOsoby.filter(o => o.aktivny);
    this.selectedOsobaId = this.data.currentKontaktnaOsobaId;
    this.dataSource = new MatTableDataSource(this.kontaktneOsoby);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  isSelected(id: number): boolean {
    return this.selectedOsobaId === id;
  }

  selectRow(row: KontaktnaOsobaDTO): void {
    if (this.selectedOsobaId === row.id) {
      
      return;
    }
    this.selectedOsobaId = row.id;
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onChangeClick(): void {
    if (this.selectedOsobaId) {
      this.dialogRef.close(this.selectedOsobaId);
    }
  }
}

@Component({
  selector: 'app-objednavka-header',
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
  templateUrl: './objednavka-header.component.html',
  styleUrls: ['../../../shared/styles/detail-table-default.css']
})
export class ObjednavkaHeaderComponent implements OnDestroy {
  @Input() orderDetail: ObjednavkaDetailDTO | null = null;
  @Output() orderUpdated = new EventEmitter<void>();

  ObjednavkaFazaEnum = ObjednavkaFaza; 
  ChybaKlientaEnum = ChybaKlienta;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private firmyHttpClient: FirmyHttpClientService,
    private objednavkyHttpClient: ObjednavkyHttpClientService,
    private kontaktneOsobyHttpClient: KontaktneOsobyHttpClientService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToFirma(firmaId: number | undefined): void {
    if (firmaId) {
      this.router.navigate(['/firmy', firmaId]);
    }
  }

  editKontaktnaOsoba(): void {
    if (!this.orderDetail) return;

    
    const kontaktnaOsoba: KontaktnaOsobaDTO = {
      id: this.orderDetail.kontaktnaOsobaId,
      meno: this.orderDetail.kontaktnaOsobaMeno,
      priezvisko: this.orderDetail.kontaktnaOsobaPriezvisko,
      telefon: this.orderDetail.kontaktnaOsobaTelefon,
      email: this.orderDetail.kontaktnaOsobaEmail,
      aktivny: true 
    };

    const dialogRef = this.dialog.open(KontaktnaOsobaDialogComponent, {
      data: {
        kontaktnaOsoba: kontaktnaOsoba,
        firmaId: this.orderDetail.firmaId,
        isNew: false
      },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('[Dialog Closed] Result:', result);
      if (result && this.orderDetail) {
        console.log('[Update Start] Attempting update with:', result);
        
        this.kontaktneOsobyHttpClient.update(
          this.orderDetail.firmaId,
          result.kontaktnaOsobaId,
          result
        )
          .pipe(
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: () => {
              console.log('[Update Subscribe] Received next notification (Update successful)');
              this.showMessageDialog(
                'Úspech',
                'Kontaktná osoba bola úspešne aktualizovaná.',
                'check_circle',
                'primary'
              );
              this.orderUpdated.emit();
            },
            error: (error) => {
              console.error('[Update Subscribe] Received error:', error);
              this.showMessageDialog(
                'Chyba',
                'Nepodarilo sa aktualizovať kontaktnú osobu: ' + (error.message || error.detail || 'Neznáma chyba'),
                'error',
                'warn'
              );
            },
            complete: () => {
              console.log('[Update Subscribe] Stream completed.');
            }
           });
      } else {
        console.log('[Dialog Closed] No result returned or orderDetail missing.');
      }
    });
  }

  changeKontaktnaOsoba(): void {
    if (!this.orderDetail) return;

    
    this.firmyHttpClient.getById(this.orderDetail.firmaId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.showMessageDialog(
            'Chyba',
            'Nepodarilo sa načítať kontaktné osoby firmy: ' + (error.message || 'Neznáma chyba'),
            'error',
            'warn'
          );
          return of(null);
        })
      )
      .subscribe(firmDetail => {
        if (firmDetail && firmDetail.kontaktneOsoby.length > 0 && this.orderDetail) {
          this.openChangeKontaktnaOsobaDialog(
            firmDetail.kontaktneOsoby,
            this.orderDetail.kontaktnaOsobaId
          );
        } else if (firmDetail && firmDetail.kontaktneOsoby.length === 0) {
           this.showMessageDialog(
            'Upozornenie',
            'Firma nemá žiadne aktívne kontaktné osoby. Najprv pridajte alebo aktivujte kontaktné osoby v detaile firmy.',
            'info',
            'accent'
          );
        } else if (!firmDetail) {
           
        } else {
           
           console.error("Order detail became null during changeKontaktnaOsoba");
        }
      });
  }

  openChangeKontaktnaOsobaDialog(kontaktneOsoby: KontaktnaOsobaDTO[], currentKontaktnaOsobaId: number): void {
    const dialogRef = this.dialog.open(ChangeKontaktnaOsobaDialogComponent, {
      data: {
        kontaktneOsoby: kontaktneOsoby,
        currentKontaktnaOsobaId: currentKontaktnaOsobaId
      },
      width: '800px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && typeof result === 'number' && result !== currentKontaktnaOsobaId) {
        
        this.confirmChangeKontaktnaOsoba(result);
      }
    });
  }

  confirmChangeKontaktnaOsoba(newKontaktnaOsobaId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Zmeniť kontaktnú osobu',
        message: 'Ste si istý, že chcete zmeniť kontaktnú osobu pre túto objednávku?',
        confirmButtonText: 'Zmeniť',
        confirmButtonColor: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      
      if (result && this.orderDetail && this.orderDetail.id) {
        const currentObjednavkaId = this.orderDetail.id; 
        const patchCommand: PatchObjednavkaCommand = {
          objednavkaId: currentObjednavkaId,
          kontaktnaOsobaId: newKontaktnaOsobaId
        };

        this.objednavkyHttpClient.patch(currentObjednavkaId, patchCommand)
          .pipe(
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (response) => {
              
              
              this.showMessageDialog(
                'Úspech',
                'Kontaktná osoba bola úspešne zmenená.',
                'check_circle',
                'primary'
              );
              console.log('[Change Kontaktna Osoba] Order updated successfully');
              
              this.orderUpdated.emit();
            },
            error: (error) => {
              console.error('[Change Kontaktna Osoba] Error:', error);
              this.showMessageDialog(
                'Chyba',
                'Nepodarilo sa zmeniť kontaktnú osobu: ' + (error.message || error.detail || 'Neznáma chyba'),
                'error',
                'warn'
              );
            },
            complete: () => {
              console.log('[Change Kontaktna Osoba] Patch operation stream completed.');
            }
          });
      } else if (result) {
          console.error("Cannot change contact person: orderDetail or orderDetail.id is missing.");
          this.showMessageDialog(
            'Chyba',
            'Interná chyba: Chýbajú detaily objednávky pre vykonanie zmeny.',
            'error',
            'warn'
          );
      }
    });
  }

  showMessageDialog(title: string, message: string, icon: string, iconColor: 'primary' | 'accent' | 'warn'): void {
    this.dialog.open(MessageDialogComponent, {
      data: { title, message, icon, iconColor },
      width: '400px'
    });
  }

  getFazaText(faza: ObjednavkaFaza | string | undefined): string {
    if (faza === undefined) return 'Neznáma';
    
    
    const fazaValue = typeof faza === 'string' ? 
      Object.keys(ObjednavkaFaza).indexOf(faza) : 
      Number(faza);
    
    switch (fazaValue) {
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

  getChybaKlientaText(chyba: ChybaKlienta | number | null | undefined): string {
    if (chyba === null || chyba === undefined) return '';
    
    
    const chybaValue = Number(chyba);
    
    switch (chybaValue) {
      case ChybaKlienta.ZrusenaPriVyrobe:
        return 'Zrušená pri výrobe';
      case ChybaKlienta.NezaplatenaNaCas:
        return 'Nezaplatená na čas';
      case ChybaKlienta.ZlaKomunikacia:
        return 'Zlá komunikácia';
      case ChybaKlienta.InyProblem:
        return 'Iný problém';
      default:
        return 'Neznáma';
    }
  }
}
