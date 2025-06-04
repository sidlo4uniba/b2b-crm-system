import { Component, Input, Output, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ObjednavkyHttpClientService } from '../../../shared/services/http-clients/objednavky/objednavky-http-client.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { 
  UpdateObjednavkaChybaKlientaCommand,
  PatchObjednavkaCommand,
  ObjednavkaDetailDTO,
  ObjednavkaFaza
} from '../../../shared/services/http-clients/objednavky/objednavky-http-client.models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ChybaKlienta } from '../../../shared/services/http-clients/objednavky/objednavky-http-client.models';


@Component({
  selector: 'app-client-error-dialog',
  template: `
    <div class="client-error-dialog-container">
      <h2 mat-dialog-title>Nastaviť chybu klienta</h2>
      <div mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Vyberte dôvod</mat-label>
          <mat-select [ngModel]="selectedError" (ngModelChange)="selectedError = $event">
            <mat-option *ngFor="let error of chybaKlientaOptions" [value]="error.value">
              {{ error.label }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div mat-dialog-actions align="end">
        <button mat-button (click)="onCancelClick()">Zrušiť</button>
        <button mat-flat-button color="accent" [disabled]="selectedError === undefined" (click)="onConfirmClick()">Potvrdiť</button>
      </div>
    </div>
  `,
  styles: [`
    .client-error-dialog-container {
      min-width: 400px;
    }
    .full-width {
      width: 100%;
    }
  `],
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ]
})
export class ClientErrorDialogComponent {
  selectedError: ChybaKlienta | null | undefined = undefined;
  chybaKlientaOptions = [
    { value: null, label: 'Žiadna chyba' },
    { value: ChybaKlienta.ZrusenaPriVyrobe, label: 'Zrušená pri výrobe' },
    { value: ChybaKlienta.NezaplatenaNaCas, label: 'Nezaplatená na čas' },
    { value: ChybaKlienta.ZlaKomunikacia, label: 'Zlá komunikácia' },
    { value: ChybaKlienta.InyProblem, label: 'Iný problém' }
  ];

  constructor(
    public dialogRef: MatDialogRef<ClientErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentChybaKlienta: ChybaKlienta | null | undefined }
  ) {
    
    this.selectedError = data.currentChybaKlienta;
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onConfirmClick(): void {
    this.dialogRef.close(this.selectedError);
  }
}


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
  selector: 'app-objednavka-titlebar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './objednavka-titlebar.component.html',
  styleUrls: [
    '../../../shared/styles/detail-table-default.css'
  ]
})
export class ObjednavkaTitlebarComponent implements OnDestroy {
  @Input() objednavkaDetailData: ObjednavkaDetailDTO | null = null;
  @Output() orderUpdated = new EventEmitter<void>();
  
  
  get isOrderCancelled(): boolean {
    return this.objednavkaDetailData?.zrusene ?? false;
  }

  
  get isOrderInVybavenePhase(): boolean {
    return this.objednavkaDetailData?.faza === ObjednavkaFaza.Vybavene;
  }
  
  isLoadingAction = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private objednavkyService: ObjednavkyHttpClientService,
    private location: Location
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
  goBack(): void {
    this.location.back();
  }

  
  setClientError(): void {
    if (!this.objednavkaDetailData?.id) {
      this.errorMessage = 'Chýba ID objednávky pre nastavenie chyby klienta';
      return;
    }

    const dialogRef = this.dialog.open(ClientErrorDialogComponent, {
      data: {
        currentChybaKlienta: this.objednavkaDetailData.chybaKlienta
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.isLoadingAction = true;
        
        const command: UpdateObjednavkaChybaKlientaCommand = {
          objednavkaId: this.objednavkaDetailData!.id,
          chybaKlienta: result
        };

        this.objednavkyService.updateChybaKlienta(this.objednavkaDetailData!.id, command)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.isLoadingAction = false)
          )
          .subscribe({
            next: () => {
              console.log('Client error set successfully');
              const message = result === null 
                ? 'Chyba klienta bola úspešne odstránená.' 
                : 'Chyba klienta bola úspešne nastavená.';
              this.showMessageDialog(
                'Úspech',
                message,
                'check_circle',
                'primary'
              );
              
              this.orderUpdated.emit();
            },
            error: (error) => {
              console.error('Error setting client error', error);
              this.errorMessage = `Nastala chyba pri nastavovaní chyby klienta: ${error.message || 'Neznáma chyba'}`;
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

  
  toggleOrderCancellation(): void {
    if (!this.objednavkaDetailData?.id) {
      this.errorMessage = 'Chýba ID objednávky pre zrušenie/obnovenie';
      return;
    }

    const action = this.isOrderCancelled ? 'obnoviť' : 'zrušiť';
    const dialogTitle = this.isOrderCancelled ? 'Obnovenie objednávky' : 'Zrušenie objednávky';
    let dialogMessage = `Naozaj chcete ${action} túto objednávku?`;
    const confirmButtonText = this.isOrderCancelled ? 'Obnoviť' : 'Zrušiť objednávku';
    const confirmButtonColor = this.isOrderCancelled ? 'primary' : 'warn';

    if(!this.isOrderCancelled) {
      dialogMessage += ` <b>Táto akcia nie je trvalá.</b> Zrušenú objednávku môžete vrátiť do pôvodného stavu tým, že ju obnovíte.`;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: dialogTitle,
        message: dialogMessage,
        confirmButtonText: confirmButtonText,
        confirmButtonColor: confirmButtonColor
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoadingAction = true;
        
        
        const patchCommand: PatchObjednavkaCommand = {
          objednavkaId: this.objednavkaDetailData!.id,
          zrusene: !this.isOrderCancelled 
        };
        
        this.objednavkyService.patch(this.objednavkaDetailData!.id, patchCommand)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.isLoadingAction = false)
          )
          .subscribe({
            next: () => {
              const statusMessage = !this.isOrderCancelled 
                ? 'Objednávka bola úspešne zrušená.' 
                : 'Objednávka bola úspešne obnovená.';
              
              this.showMessageDialog(
                'Úspech',
                statusMessage,
                'check_circle',
                'primary'
              );
              
              
              this.orderUpdated.emit();
            },
            error: (error) => {
              console.error('Error updating order cancellation status', error);
              this.errorMessage = `Nastala chyba pri ${action} objednávky: ${error.message || 'Neznáma chyba'}`;
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

  
  confirmDelete(): void {
    if (!this.objednavkaDetailData?.id) {
      this.errorMessage = 'Chýba ID objednávky pre odstránenie';
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Potvrdiť vymazanie',
        message: 'Naozaj chcete vymazať túto objednávku? <strong>Táto akcia je trvalá a nevratná</strong>, na rozdiel od zrušenia objednávky. Odstráni všetky súvisiace údaje.',
        confirmButtonText: 'Vymazať',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoadingAction = true;
        
        this.objednavkyService.delete(this.objednavkaDetailData!.id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.isLoadingAction = false)
          )
          .subscribe({
            next: () => {
              console.log('Order successfully deleted');
              this.showMessageDialog(
                'Úspech',
                'Objednávka bola úspešne odstránená.',
                'check_circle',
                'primary'
              );
              
              this.router.navigate(['/objednavky']);
            },
            error: (error) => {
              console.error('Error deleting order', error);
              this.errorMessage = `Nastala chyba pri vymazávaní objednávky: ${error.message || 'Neznáma chyba'}`;
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

  showMessageDialog(title: string, message: string, icon: string, iconColor: 'primary' | 'accent' | 'warn'): void {
    this.dialog.open(MessageDialogComponent, {
      data: { title, message, icon, iconColor },
      width: '400px'
    });
  }
} 