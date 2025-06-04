import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VyberTovaruComponent } from './vyber-tovaru/vyber-tovaru.component';
import { TovaryCenovaPonukaComponent } from './tovary-cenova-ponuka/tovary-cenova-ponuka.component';
import { SelectedTovarItem } from './tovary-cenova-ponuka/tovary-cenova-ponuka.component';
import { ObjednavkaHeaderComponent } from './objednavka-header/objednavka-header.component';
import { ObjednavkaTitlebarComponent } from './objednavka-titlebar/objednavka-titlebar.component';
import { ObjednavkaFormComponent } from './objednavka-form/objednavka-form.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ObjednavkyHttpClientService } from '../../shared/services/http-clients/objednavky/objednavky-http-client.service';
import { ObjednavkyCenovePonukyHttpClientService } from '../../shared/services/http-clients/objednavky-cenove-ponuky/objednavky-cenove-ponuky-http-client.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ObjednavkaDetailDTO, CenovaPonukaDTO } from '../../shared/services/http-clients/objednavky/objednavky-http-client.models';
import { ObjednavkaFaza, StavCenovejPonuky } from '../../shared/services/http-clients/objednavky/objednavky-http-client.models';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { CenovaPonukaTovarCommandDto, PatchCenovaPonukaCommand } from '../../shared/services/http-clients/objednavky-cenove-ponuky/objednavky-cenove-ponuky-http-client.models';
import { UpdateObjednavkaFazaCommand } from '../../shared/services/http-clients/objednavky/objednavky-http-client.models';
import { PatchObjednavkaCommand } from '../../shared/services/http-clients/objednavky/objednavky-http-client.models';



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


@Component({
  selector: 'app-objednavka-detail',
  standalone: true,
  imports: [
    VyberTovaruComponent,
    TovaryCenovaPonukaComponent,
    ObjednavkaHeaderComponent,
    ObjednavkaTitlebarComponent,
    ObjednavkaFormComponent,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule
  ],
  templateUrl: './objednavka-detail.component.html',
  styleUrls: [
    '../../shared/styles/detail-table-default.css'
  ]
})
export class ObjednavkaDetailComponent implements OnInit, OnDestroy {
  
  ObjednavkaFaza = ObjednavkaFaza;
  
  
  selectedItems: SelectedTovarItem[] = [];
  
  originalSelectedItems: SelectedTovarItem[] = [];
  
  
  objednavkaId: number | null = null;

  
  orderDetailData: ObjednavkaDetailDTO | null = null;

  
  adjustedPrice: number | null = null;
  isLoadingAction = false;
  isSavingChanges = false;
  isLoadingSend = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  
  constructor(
    private route: ActivatedRoute,
    private objednavkyService: ObjednavkyHttpClientService,
    private cenovePonukyService: ObjednavkyCenovePonukyHttpClientService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    
    const idParam = this.route.snapshot.paramMap.get('id');
    
    this.objednavkaId = idParam ? +idParam : null;
    
    
    if (this.objednavkaId) {
      this.loadOrderDetails();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
  loadOrderDetails(): void {
    if (!this.objednavkaId) return;

    this.isLoadingAction = true;
    this.orderDetailData = null; 
    this.selectedItems = []; 
    this.originalSelectedItems = []; 
    
    this.objednavkyService.getById(this.objednavkaId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingAction = false)
      )
      .subscribe({
        next: (response) => {
          
          this.orderDetailData = response;
          
          
          this.populateSelectedItemsFromCenovaPonuka(response);
          
          
          this.originalSelectedItems = this.deepCloneSelectedItems(this.selectedItems);
          
          
          if (this.orderDetailData && this.orderDetailData.faza === ObjednavkaFaza.Nacenenie) {
            this.adjustedPrice = this.calculateTotalPrice();
          }
        },
        error: (error) => {
          console.error('Error loading order details', error);
          this.errorMessage = `Nastala chyba pri načítaní objednávky: ${error.message || 'Neznáma chyba'}`;
          this.showErrorDialog('Chyba pri načítaní', this.errorMessage);
        }
      });
  }

  
  private deepCloneSelectedItems(items: SelectedTovarItem[]): SelectedTovarItem[] {
    return items.map(item => ({...item}));
  }

  
  private populateSelectedItemsFromCenovaPonuka(orderDetail: ObjednavkaDetailDTO): void {
    if (!orderDetail || !orderDetail.poslednaCenovaPonukaId) {
      return;
    }

    
    const lastCenovaPonuka = orderDetail.cenovePonuky.find(
      cp => cp.id === orderDetail.poslednaCenovaPonukaId
    );
    
    if (lastCenovaPonuka && lastCenovaPonuka.polozky && lastCenovaPonuka.polozky.length > 0) {
      
      this.selectedItems = lastCenovaPonuka.polozky.map(polozka => ({
        id: polozka.id,
        tovarId: polozka.tovarId,
        variantTovarId: polozka.variantTovarId,
        nazovTovaru: polozka.nazovTovaru,
        interneId: polozka.interneId,
        kategoriaId: polozka.kategoriaId,
        mnozstvo: polozka.mnozstvo,
        cena: polozka.cena,
        jeVariantTovaru: polozka.jeVariantTovaru,
        velkost: polozka.velkost?.code || null,
        farbaHex: polozka.farbaHex
      }));
    }
  }

  
  shouldShowVyberTovaru(): boolean {
    if (!this.orderDetailData) return false;
    
    return this.orderDetailData.faza === ObjednavkaFaza.Nacenenie && !this.orderDetailData.zrusene;
  }

  
  shouldShowActionButtons(): boolean {
    if (!this.orderDetailData) return false;
    
    return (
      this.orderDetailData.faza === ObjednavkaFaza.Nacenenie && 
      !this.orderDetailData.zrusene && 
      this.orderDetailData.poslednaCenovaPonukaId !== null
    );
  }

  
  hasChangesInSelectedItems(): boolean {
    
    if (this.selectedItems.length !== this.originalSelectedItems.length) {
      return true;
    }
    
    
    for (let i = 0; i < this.selectedItems.length; i++) {
      const current = this.selectedItems[i];
      const original = this.originalSelectedItems[i];
      
      
      if (
        current.tovarId !== original.tovarId ||
        current.mnozstvo !== original.mnozstvo ||
        ((current.variantTovarId || null) !== (original.variantTovarId || null))
      ) {
        return true;
      }
    }
    
    return false;
  }

  
  cancelChangesInSelectedItems(): void {
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Zrušiť zmeny',
        message: 'Ste si istí, že chcete zrušiť všetky vykonané zmeny v cenovej ponuke?',
        confirmButtonText: 'Áno, zrušiť zmeny',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
        this.selectedItems = this.deepCloneSelectedItems(this.originalSelectedItems);
      }
    });
  }

  
  saveSelectedItemChanges(): void {
    
    if (!this.objednavkaId || !this.orderDetailData?.poslednaCenovaPonukaId) {
      this.showErrorDialog(
        'Chyba pri ukladaní', 
        'Nemožno uložiť zmeny: Chýba ID objednávky alebo cenovej ponuky'
      );
      return;
    }
    
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Uložiť zmeny',
        message: 'Ste si istí, že chcete uložiť zmeny v cenovej ponuke?',
        confirmButtonText: 'Áno, uložiť zmeny',
        confirmButtonColor: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.executeSaveSelectedItems();
      }
    });
  }

  
  private executeSaveSelectedItems(): void {
    
    const finalnaCena = this.calculateFinalPrice();
    
    
    const polozky: CenovaPonukaTovarCommandDto[] = this.selectedItems.map(item => ({
      tovarId: item.tovarId,
      variantTovarId: item.variantTovarId || null,
      mnozstvo: item.mnozstvo
    }));
    
    
    const command: PatchCenovaPonukaCommand = {
      objednavkaId: this.objednavkaId as number,
      cenovaPonukaId: this.orderDetailData?.poslednaCenovaPonukaId as number,
      finalnaCena: finalnaCena,
      polozky: polozky
    };
    
    
    this.isSavingChanges = true;
    
    
    this.cenovePonukyService.patch(
      this.objednavkaId as number,
      this.orderDetailData?.poslednaCenovaPonukaId as number,
      command
    )
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isSavingChanges = false)
    )
    .subscribe({
      next: () => {
        
        this.loadOrderDetails();
        
        
        this.showSuccessDialog('Zmeny uložené', 'Cenová ponuka bola úspešne aktualizovaná.');
      },
      error: (error) => {
        console.error('Error saving price quote changes', error);
        
        
        this.showErrorDialog(
          'Chyba pri ukladaní', 
          `Nastala chyba pri ukladaní zmien v cenovej ponuke.`
        );
      }
    });
  }

  
  private calculateFinalPrice(): number {
    if (!this.selectedItems || this.selectedItems.length === 0) {
      return 0;
    }
    
    return this.selectedItems.reduce((total, item) => {
      return total + (item.cena * item.mnozstvo);
    }, 0);
  }

  
  calculateTotalPrice(): number {
    if (!this.selectedItems || this.selectedItems.length === 0) {
      return 0;
    }
    
    return this.selectedItems.reduce((total, item) => {
      return total + (item.cena * item.mnozstvo);
    }, 0);
  }

  
  getFinalPrice(): number {
    
    if (this.orderDetailData && 
        this.orderDetailData.faza !== ObjednavkaFaza.Nacenenie && 
        this.orderDetailData.poslednaCenovaPonukaId) {
      
      
      const lastQuote = this.orderDetailData.cenovePonuky.find(
        quote => quote.id === this.orderDetailData?.poslednaCenovaPonukaId
      );
      
      
      if (lastQuote) {
        return lastQuote.finalnaCena;
      }
    }
    
    
    return this.calculateTotalPrice();
  }

  
  hasOriginalItems(): boolean {
    return this.originalSelectedItems && this.originalSelectedItems.length > 0;
  }

  
  sendPriceQuote(): void {
    if (!this.objednavkaId || !this.orderDetailData) {
      this.showErrorDialog(
        'Chyba pri odosielaní', 
        'Nemožno odoslať cenovú ponuku: Chýba ID objednávky'
      );
      return;
    }

    
    if (!this.hasOriginalItems()) {
      this.showErrorDialog(
        'Prázdna cenová ponuka', 
        'Nemôžete odoslať prázdnu cenovú ponuku. Pridajte aspoň jednu položku.'
      );
      return;
    }

    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Odoslať cenovú ponuku',
        message: 'Ste si istí, že chcete odoslať cenovú ponuku klientovi? Po odoslaní nebude možné ponuku upraviť bez jej zrušenia. <strong>Táto akcia je nevratná.</strong>',
        confirmButtonText: 'Áno, odoslať ponuku',
        confirmButtonColor: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.executeSendPriceQuote();
      }
    });
  }

  
  private executeSendPriceQuote(): void {
    if (!this.objednavkaId || !this.orderDetailData) return;

    
    if (this.adjustedPrice !== null && this.adjustedPrice !== this.calculateTotalPrice()) {
      this.executeSaveAdjustedPrice(() => {
        this.updateOrderFazaToNacenenieCaka();
      });
    } else {
      this.updateOrderFazaToNacenenieCaka();
    }
  }

  
  private executeSaveAdjustedPrice(onSuccess: () => void): void {
    if (!this.objednavkaId || !this.orderDetailData?.poslednaCenovaPonukaId || this.adjustedPrice === null) {
      return;
    }

    
    const polozky: CenovaPonukaTovarCommandDto[] = this.selectedItems.map(item => ({
      tovarId: item.tovarId,
      variantTovarId: item.variantTovarId || null,
      mnozstvo: item.mnozstvo
    }));
    
    
    const command: PatchCenovaPonukaCommand = {
      objednavkaId: this.objednavkaId as number,
      cenovaPonukaId: this.orderDetailData?.poslednaCenovaPonukaId as number,
      finalnaCena: this.adjustedPrice,
      polozky: polozky
    };
    
    
    this.cenovePonukyService.patch(
      this.objednavkaId as number,
      this.orderDetailData?.poslednaCenovaPonukaId as number,
      command
    )
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: () => {
        
        onSuccess();
      },
      error: (error) => {
        console.error('Error saving adjusted price', error);
        this.isLoadingSend = false;
        this.showErrorDialog(
          'Chyba pri ukladaní upravenej ceny', 
          `Nastala chyba pri ukladaní upravenej ceny. Cenová ponuka nebola odoslaná.`
        );
      }
    });
  }

  
  private updateOrderFazaToNacenenieCaka(): void {
    if (!this.objednavkaId) return;

    
    const command: UpdateObjednavkaFazaCommand = {
      objednavkaId: this.objednavkaId,
      faza: ObjednavkaFaza.NacenenieCaka
    };

    this.isLoadingSend = true;

    
    this.objednavkyService.updateFaza(this.objednavkaId, command)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingSend = false)
      )
      .subscribe({
        next: () => {
          
          this.loadOrderDetails();
          this.showSuccessDialog(
            'Cenová ponuka odoslaná', 
            'Cenová ponuka bola úspešne odoslaná klientovi.'
          );
        },
        error: (error) => {
          console.error('Error sending price quote', error);
          this.showErrorDialog(
            'Chyba pri odosielaní', 
            `Nastala chyba pri odosielaní cenovej ponuky. Kontaktujte administrátora alebo skúste odoslať cenovú ponuku neskôr.`
          );
        }
      });
  }

  
  downloadPdf(): void {
    if (!this.objednavkaId || !this.orderDetailData?.poslednaCenovaPonukaId) {
      this.showErrorDialog(
        'Chyba pri sťahovaní', 
        'Nemožno stiahnuť PDF: Chýba ID objednávky alebo cenovej ponuky'
      );
      return;
    }

    this.isLoadingAction = true;
    
    this.cenovePonukyService.downloadCenovaPonuka(this.objednavkaId, this.orderDetailData.poslednaCenovaPonukaId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingAction = false)
      )
      .subscribe({
        next: (blob: Blob) => {
          
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cenova-ponuka-${this.objednavkaId}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error downloading PDF:', error);
          this.showErrorDialog(
            'Chyba pri sťahovaní', 
            'Nepodarilo sa stiahnuť PDF cenovej ponuky. Skúste to prosím znova.'
          );
        }
      });
  }

  
  approvePriceQuote(): void {
    if (!this.objednavkaId || !this.orderDetailData) {
      this.showErrorDialog(
        'Chyba pri schvaľovaní', 
        'Nemožno schváliť cenovú ponuku: Chýba ID objednávky'
      );
      return;
    }

    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Schváliť cenovú ponuku',
        message: 'Ste si istí, že chcete schváliť cenovú ponuku? Objednávka prejde do fázy výroby. <strong>Táto akcia je nevratná.</strong>',
        confirmButtonText: 'Áno, schváliť ponuku',
        confirmButtonColor: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.executeApprovePriceQuote();
      }
    });
  }

  
  private executeApprovePriceQuote(): void {
    if (!this.objednavkaId) return;

    
    const command: UpdateObjednavkaFazaCommand = {
      objednavkaId: this.objednavkaId,
      faza: ObjednavkaFaza.VyrobaNeriesene
    };

    this.isLoadingAction = true;

    
    this.objednavkyService.updateFaza(this.objednavkaId, command)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingAction = false)
      )
      .subscribe({
        next: () => {
          
          this.loadOrderDetails();
          this.showSuccessDialog(
            'Cenová ponuka schválená', 
            'Cenová ponuka bola úspešne schválená. Objednávka prejde do fázy výroby.'
          );
        },
        error: (error) => {
          console.error('Error approving price quote', error);
          this.showErrorDialog(
            'Chyba pri schvaľovaní', 
            `Nastala chyba pri schvaľovaní cenovej ponuky. Kontaktujte administrátora alebo skúste schváliť cenovú ponuku neskôr.`
          );
        }
      });
  }

  
  rejectPriceQuote(): void {
    if (!this.objednavkaId || !this.orderDetailData) {
      this.showErrorDialog(
        'Chyba pri zrušení', 
        'Nemožno zrušiť cenovú ponuku: Chýba ID objednávky'
      );
      return;
    }

    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Zrušiť cenovú ponuku',
        message: 'Ste si istí, že chcete zrušiť cenovú ponuku? Aktuálna ponuka bude zrušená. <strong>Táto akcia je nevratná.</strong>',
        confirmButtonText: 'Áno, zrušiť ponuku',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.executeRejectPriceQuote();
      }
    });
  }

  
  private executeRejectPriceQuote(): void {
    if (!this.objednavkaId) return;

    
    const command: UpdateObjednavkaFazaCommand = {
      objednavkaId: this.objednavkaId,
      faza: ObjednavkaFaza.Nacenenie
    };

    this.isLoadingAction = true;

    
    this.objednavkyService.updateFaza(this.objednavkaId, command)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingAction = false)
      )
      .subscribe({
        next: () => {
          
          this.loadOrderDetails();
          this.showSuccessDialog(
            'Cenová ponuka zrušená', 
            'Cenová ponuka bola úspešne zrušená. Objednávka sa vrátila do fázy nacenenia a bola vytvorená nová prázdna cenová ponuka.'
          );
        },
        error: (error) => {
          console.error('Error rejecting price quote', error);
          this.showErrorDialog(
            'Chyba pri zrušení', 
            `Nastala chyba pri zrušení cenovej ponuky. Kontaktujte administrátora alebo skúste zrušiť cenovú ponuku neskôr.`
          );
        }
      });
  }

  
  private showErrorDialog(title: string, message: string): void {
    this.dialog.open(MessageDialogComponent, {
      data: {
        title: title,
        message: message,
        icon: 'error',
        iconColor: 'warn'
      }
    });
  }

  
  private showSuccessDialog(title: string, message: string): void {
    this.dialog.open(MessageDialogComponent, {
      data: {
        title: title,
        message: message,
        icon: 'check_circle',
        iconColor: 'primary'
      }
    });
  }

  
  private showInfoDialog(title: string, message: string): void {
    this.dialog.open(MessageDialogComponent, {
      data: {
        title: title,
        message: message,
        icon: 'info',
        iconColor: 'primary'
      }
    });
  }

  
  getFazaText(faza: ObjednavkaFaza | number): string {
    switch (faza) {
      case ObjednavkaFaza.Nacenenie:
        return 'Nacenenie';
      case ObjednavkaFaza.NacenenieCaka:
        return 'Čaká sa na nacenenie';
      case ObjednavkaFaza.VyrobaNeriesene:
        return 'Výroba - neriešené';
      case ObjednavkaFaza.VyrobaNemozna:
        return 'Výroba nie je možná';
      case ObjednavkaFaza.VyrobaCaka:
        return 'Výroba - čaká sa';
      case ObjednavkaFaza.OdoslanieCaka:
        return 'Čaká sa na odoslanie';
      case ObjednavkaFaza.PlatbaCaka:
        return 'Čaká sa na platbu';
      case ObjednavkaFaza.Vybavene:
        return 'Vybavené';
      default:
        return 'Neznámy stav';
    }
  }

  
  changePhase(newPhase: ObjednavkaFaza): void {
    if (!this.objednavkaId || !this.orderDetailData) {
      this.showErrorDialog(
        'Chyba pri zmene fázy', 
        'Nemožno zmeniť fázu objednávky: Chýba ID objednávky'
      );
      return;
    }

    
    if (this.orderDetailData.zrusene) {
      this.showErrorDialog(
        'Zrušená objednávka', 
        'Nemožno zmeniť fázu zrušenej objednávky'
      );
      return;
    }

    
    if (newPhase === ObjednavkaFaza.VyrobaCaka && !this.orderDetailData.naplanovanyDatumVyroby) {
      this.showErrorDialog(
        'Chýba dátum výroby',
        'Pre nastavenie fázy "Výroba - čaká sa" musí byť nastavený plánovaný dátum výroby. Nastavte dátum v hlavičke objednávky.'
      );
      return;
    }

    
    if (newPhase === ObjednavkaFaza.PlatbaCaka && this.orderDetailData.zaplatene) {
      this.showErrorDialog(
        'Objednávka už zaplatená',
        'Nemôžete nastaviť fázu "Čaká sa na platbu", keď je objednávka už zaplatená.'
      );
      return;
    }
    
    
    if (newPhase === ObjednavkaFaza.Vybavene && !this.orderDetailData.zaplatene) {
      this.showErrorDialog(
        'Objednávka nie je zaplatená',
        'Nemôžete označiť objednávku ako vybavenú, pokiaľ nie je zaplatená. Najprv označte objednávku ako zaplatenú.'
      );
      return;
    }

    
    let confirmationMessage = `Ste si istí, že chcete zmeniť fázu z "${this.getFazaText(this.orderDetailData.faza)}" na "${this.getFazaText(newPhase)}"?`;
    
    
    if (newPhase === ObjednavkaFaza.Vybavene) {
      confirmationMessage += '<br><br><strong>Upozornenie:</strong> Táto akcia označí objednávku ako úplne vybavenú!';
    }

    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Zmeniť fázu objednávky',
        message: confirmationMessage,
        confirmButtonText: 'Áno, zmeniť fázu',
        confirmButtonColor: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.executePhaseChange(newPhase);
      }
    });
  }

  
  private executePhaseChange(newPhase: ObjednavkaFaza): void {
    if (!this.objednavkaId) return;

    
    const command: UpdateObjednavkaFazaCommand = {
      objednavkaId: this.objednavkaId,
      faza: newPhase
    };

    this.isLoadingAction = true;

    
    this.objednavkyService.updateFaza(this.objednavkaId, command)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingAction = false)
      )
      .subscribe({
        next: () => {
          
          this.loadOrderDetails();
          this.showSuccessDialog(
            'Fáza zmenená', 
            `Fáza objednávky bola úspešne zmenená na "${this.getFazaText(newPhase)}".`
          );
        },
        error: (error) => {
          console.error('Error changing order phase', error);
          this.showErrorDialog(
            'Chyba pri zmene fázy', 
            `Nastala chyba pri zmene fázy objednávky: ${error.message || 'Neznáma chyba'}`
          );
        }
      });
  }

  
  togglePaymentStatus(event: MatSlideToggleChange): void {
    
    if (!this.objednavkaId || !this.orderDetailData) {
      this.showErrorDialog(
        'Chyba pri zmene stavu platby', 
        'Nemožno zmeniť stav platby: Chýba ID objednávky'
      );
      
      if (event.source) {
        event.source.checked = this.orderDetailData?.zaplatene || false;
      }
      return;
    }

    
    if (this.orderDetailData.zrusene) {
      this.showErrorDialog(
        'Zrušená objednávka', 
        'Nemožno zmeniť stav platby zrušenej objednávky'
      );
      
      if (event.source) {
        event.source.checked = this.orderDetailData.zaplatene;
      }
      return;
    }

    
    if (this.orderDetailData.zaplatene && 
        !event.checked && 
        this.orderDetailData.faza === ObjednavkaFaza.Vybavene) {
      this.showErrorDialog(
        'Nemožno označiť ako nezaplatené', 
        'Objednávku nemožno nastaviť ako nezaplatenú, keď je vybavená.'
      );
      
      if (event.source) {
        event.source.checked = true;
      }
      return;
    }

    
    const newStatus = event.checked;
    const confirmationMessage = newStatus 
      ? 'Ste si istí, že chcete označiť objednávku ako zaplatenú?' 
      : 'Ste si istí, že chcete označiť objednávku ako nezaplatenú?';

    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Zmeniť stav platby',
        message: confirmationMessage,
        confirmButtonText: 'Áno, zmeniť',
        confirmButtonColor: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.executePaymentStatusChange(newStatus);
      } else {
        
        if (event.source && this.orderDetailData) {
          event.source.checked = this.orderDetailData.zaplatene;
        }
      }
    });
  }

  
  private executePaymentStatusChange(isPaid: boolean): void {
    if (!this.objednavkaId) return;

    
    const command: PatchObjednavkaCommand = {
      objednavkaId: this.objednavkaId,
      zaplatene: isPaid
    };

    this.isLoadingAction = true;

    
    this.objednavkyService.patch(this.objednavkaId, command)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingAction = false)
      )
      .subscribe({
        next: () => {
          
          this.loadOrderDetails();
          
          const message = isPaid 
            ? 'Objednávka bola označená ako zaplatená.' 
            : 'Objednávka bola označená ako nezaplatená.';
          
          this.showSuccessDialog('Stav platby zmenený', message);
        },
        error: (error) => {
          console.error('Error changing payment status', error);
          this.showErrorDialog(
            'Chyba pri zmene stavu platby', 
            `Nastala chyba pri zmene stavu platby: ${error.message || 'Neznáma chyba'}`
          );
        }
      });
  }
} 