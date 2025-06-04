import { Component, Input, OnChanges, SimpleChanges, OnInit, OnDestroy, Inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BehaviorSubject, Subject, forkJoin, of } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import {
  ObjednavkaDetailDTO,
  PatchObjednavkaCommand,
  UpdateObjednavkaNaplanovanyDatumVyrobyCommand,
  UpdateObjednavkaOcakavanyDatumDoruceniaCommand,
} from '../../../shared/services/http-clients/objednavky/objednavky-http-client.models';
import { ObjednavkyHttpClientService } from '../../../shared/services/http-clients/objednavky/objednavky-http-client.service';


@Component({
  selector: 'app-message-dialog',
  template: `
    <div class="message-dialog-container">
      <h1
        mat-dialog-title
        class="message-title"
        [style.color]="getIconColor()"
      >
        <mat-icon [color]="data.iconColor">{{ data.icon }}</mat-icon>
        {{ data.title }}
      </h1>
      <div mat-dialog-content>
        <p>{{ data.message }}</p>
      </div>
      <div mat-dialog-actions align="end">
        <button
          mat-flat-button
          [color]="data.iconColor"
          (click)="onCloseClick()"
        >
          Zavrieť
        </button>
      </div>
    </div>
  `,
  styles: [
    `
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
    `,
  ],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, CommonModule],
})
export class MessageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { title: string; message: string; icon: string; iconColor: 'primary' | 'accent' | 'warn' }
  ) {}

  onCloseClick(): void {
    this.dialogRef.close();
  }

  getIconColor(): string {
    switch (this.data.iconColor) {
      case 'primary':
        return 'var(--primary-color)';
      case 'accent':
        return 'var(--accent-color)';
      case 'warn':
        return '#f44336';
      default:
        return 'inherit';
    }
  }
}


@Component({
  selector: 'app-objednavka-form',
  standalone: true,
  templateUrl: './objednavka-form.component.html',
  styleUrls: ['../../../shared/styles/detail-table-default.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MessageDialogComponent,
  ],
})
export class ObjednavkaFormComponent
  implements OnInit, OnChanges, OnDestroy
{
  
  @Input() orderDetailData!: ObjednavkaDetailDTO | null;
  @Output() orderUpdated = new EventEmitter<void>();

  
  detailForm!: FormGroup;
  isSaving = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();
  private originalData: ObjednavkaDetailDTO | null = null;

  private formChangedSubject = new BehaviorSubject<boolean>(false);
  formChanged$ = this.formChangedSubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private objednavkyHttp: ObjednavkyHttpClientService,
    private dialog: MatDialog
  ) {
    this.buildForm();
  }

  
  ngOnInit(): void {
    
    this.detailForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.formChangedSubject.next(!this.detailForm.pristine);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderDetailData'] && this.orderDetailData) {
      this.originalData = { ...this.orderDetailData };
      this.patchForm(this.orderDetailData);
      this.resetFormChangeState();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
  private buildForm(): void {
    this.detailForm = this.fb.group({
      ocakavanyDatumDorucenia: [null],
      naplanovanyDatumVyroby: [null],
      poznamka: [''],
    });
  }

  private patchForm(data: ObjednavkaDetailDTO): void {
    this.detailForm.patchValue({
      ocakavanyDatumDorucenia: data.ocakavanyDatumDorucenia
        ? new Date(data.ocakavanyDatumDorucenia)
        : null,
      naplanovanyDatumVyroby: data.naplanovanyDatumVyroby
        ? new Date(data.naplanovanyDatumVyroby)
        : null,
      poznamka: data.poznamka ?? '',
    });
    this.detailForm.markAsPristine();
    this.detailForm.markAsUntouched();
  }

  resetForm(): void {
    if (this.originalData) {
      this.patchForm(this.originalData);
    } else {
      this.detailForm.reset();
    }
    this.resetFormChangeState();
  }

  private resetFormChangeState(): void {
    this.formChangedSubject.next(false);
  }

  
  saveForm(): void {
    this.detailForm.markAllAsTouched();
    if (this.detailForm.invalid || !this.originalData) {
      return;
    }

    const id = this.originalData.id;
    const formValue = this.detailForm.getRawValue();

    const newOcakavany =
      formValue.ocakavanyDatumDorucenia instanceof Date
        ? this.dateToIso(formValue.ocakavanyDatumDorucenia)
        : null;

    const newNaplanovany =
      formValue.naplanovanyDatumVyroby instanceof Date
        ? this.dateToIso(formValue.naplanovanyDatumVyroby)
        : null;

    const requests = [];

    
    if (newOcakavany !== this.originalData.ocakavanyDatumDorucenia) {
      const cmd: UpdateObjednavkaOcakavanyDatumDoruceniaCommand = {
        objednavkaId: id,
        ocakavanyDatumDorucenia: newOcakavany,
      };
      requests.push(this.objednavkyHttp.updateOcakavanyDatumDorucenia(id, cmd));
    }

    
    if (newNaplanovany !== this.originalData.naplanovanyDatumVyroby) {
      const cmd: UpdateObjednavkaNaplanovanyDatumVyrobyCommand = {
        objednavkaId: id,
        naplanovanyDatumVyroby: newNaplanovany,
      };
      requests.push(this.objednavkyHttp.updateDatumVyroby(id, cmd));
    }

    
    if ((formValue.poznamka || '') !== (this.originalData.poznamka || '')) {
      const cmd: PatchObjednavkaCommand = {
        objednavkaId: id,
        poznamka: formValue.poznamka || null,
      };
      requests.push(this.objednavkyHttp.patch(id, cmd));
    }

    if (requests.length === 0) {
      this.showMessageDialog(
        'Žiadne zmeny',
        'Neboli zistené žiadne úpravy.',
        'info',
        'accent'
      );
      return;
    }

    this.isSaving = true;

    forkJoin(requests)
      .pipe(
        finalize(() => (this.isSaving = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.orderUpdated.emit();
          
          if (this.originalData) {
            this.originalData.ocakavanyDatumDorucenia = newOcakavany;
            this.originalData.naplanovanyDatumVyroby = newNaplanovany;
            this.originalData.poznamka = formValue.poznamka || null;
          }
          this.resetForm();
          this.showMessageDialog(
            'Úspešne uložené',
            'Objednávka bola uložená.',
            'check_circle',
            'primary'
          );
        },
        error: () => {
          this.showMessageDialog(
            'Chyba',
            'Pri ukladaní nastala chyba.',
            'error',
            'warn'
          );
        },
      });
  }

  
  private dateToIso(d: Date | null): string | null {
    return d ? d.toISOString().split('T')[0] : null; 
  }

  private showMessageDialog(
    title: string,
    message: string,
    icon: string,
    iconColor: 'primary' | 'accent' | 'warn'
  ): void {
    this.dialog.open(MessageDialogComponent, {
      data: { title, message, icon, iconColor },
    });
  }
}
