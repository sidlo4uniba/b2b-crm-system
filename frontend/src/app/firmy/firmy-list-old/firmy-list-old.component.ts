import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

export interface FirmaData {
  id: number;
  nazov: string;
  ico: string;
  email: string;
  telefon: string;
  skoreSpolahlivosti: number;
  hodnotaObjednavok: number;
  farba: string;
}

export interface FirmyResponse {
  items: FirmaData[];
  totalCount: number;
}

@Component({
  selector: 'app-firmy-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatExpansionModule,
    HttpClientModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './firmy-list-old.component.html',
  styleUrls: [
    '../../shared/styles/detail-table-default.css'
  ]
})
export class FirmyListOldComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['nazov', 'ico', 'email', 'telefon', 'skoreSpolahlivosti', 'hodnotaObjednavok', 'farba', 'akcie'];
  dataSource: FirmaData[] = [];
  totalItems = 0;
  pageSize = 25;
  pageSizeOptions: number[] = [25, 50, 100];
  
  searchValue = '';
  isFilterExpanded = false;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FirmaData>;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  filterForm!: FormGroup;
  private apiUrl = 'api/firmy';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.loadTableData();
    
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchValue = value;
      this.loadTableData();
    });

    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    ).subscribe(() => {
        if (this.isFilterExpanded) {
            this.loadTableData();
        }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTableData(page = 0, pageSize = this.pageSize): void {
    const filterParams = this.buildFilterQueryParams();
    
    this.getFirmy(
      page, 
      pageSize, 
      this.sort?.active ? { active: this.sort.active, direction: this.sort.direction } : undefined,
      this.searchValue,
      filterParams
    ).subscribe(result => {
      this.dataSource = result.items;
      this.totalItems = result.totalCount;
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

    return str.split('').map(char => 
      diacriticsMap[char] || char
    ).join('').toLowerCase();
  }

  applyTableSearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(this.normalizeString(filterValue.trim()));
  }

  initFilterForm(): void {
    this.filterForm = this.formBuilder.group({
      minSkore: [0],
      maxSkore: [100],
      minHodnota: [0],
      maxHodnota: [null],
      datumOd: [null],
      datumDo: [null],
      stav: [[]],
      aktivny: ['aktivne']
    });
  }

  buildFilterQueryParams(): any {
    const formValues = this.filterForm.value;
    const params: any = {};

    if (formValues.minSkore > 0) params.minSkore = formValues.minSkore;
    if (formValues.maxSkore < 100) params.maxSkore = formValues.maxSkore;
    if (formValues.minHodnota > 0) params.minHodnota = formValues.minHodnota;
    if (formValues.maxHodnota != null) params.maxHodnota = formValues.maxHodnota;
    if (formValues.datumOd) params.datumOd = formValues.datumOd;
    if (formValues.datumDo) params.datumDo = formValues.datumDo;
    if (formValues.stav && formValues.stav.length) params.stav = formValues.stav.join(',');
    if (formValues.aktivny) params.aktivny = formValues.aktivny;

    return params;
  }

  getFilterValues(): any {
    return this.filterForm.value;
  }

  resetFilters(): void {
    this.filterForm.reset({
        minSkore: 0,
        maxSkore: 100,
        minHodnota: 0,
        maxHodnota: null,
        datumOd: null,
        datumDo: null,
        stav: [],
        aktivny: 'aktivne'
    }, { emitEvent: false });
    this.loadTableData();
  }

  clearStavFilters(): void {
    this.filterForm.get('stav')?.setValue([], { emitEvent: false });
  }

  onTablePageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.loadTableData(event.pageIndex, event.pageSize);
  }

  onTableSortChange(sort: Sort): void {
    console.log('Sort changed:', sort);
    this.loadTableData();
  }

  editFirma(id: number): void {
    this.router.navigate(['/firmy/detail', id]);
  }

  deleteFirma(id: number): Observable<any> {
    console.warn(`Attempting to delete firma with ID: ${id}`);
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addFirma(): void {
    this.router.navigate(['/firmy/nova']);
  }

  get isEmpty(): boolean {
    return this.dataSource.length === 0;
  }

  toggleFilterPanel(isExpanded: boolean): void {
    this.isFilterExpanded = isExpanded;
  }

  getFirmy(
    page: number,
    pageSize: number,
    sort?: { active: string, direction: string },
    searchValue?: string,
    filterParams?: any
  ): Observable<FirmyResponse> {
    let filteredData = this.dataSource;

    if (searchValue) {
        const normalizedSearch = this.normalizeString(searchValue);
        filteredData = filteredData.filter(item =>
            this.normalizeString(item.nazov).includes(normalizedSearch) ||
            this.normalizeString(item.ico).includes(normalizedSearch) ||
            this.normalizeString(item.email).includes(normalizedSearch) ||
            this.normalizeString(item.telefon).includes(normalizedSearch)
        );
    }

    if (filterParams) {
        filteredData = filteredData.filter(item => {
            let match = true;
            if (filterParams.minSkore != null) match &&= item.skoreSpolahlivosti >= filterParams.minSkore;
            if (filterParams.maxSkore != null) match &&= item.skoreSpolahlivosti <= filterParams.maxSkore;
            if (filterParams.minHodnota != null) match &&= item.hodnotaObjednavok >= filterParams.minHodnota;
            if (filterParams.maxHodnota != null) match &&= item.hodnotaObjednavok <= filterParams.maxHodnota;
            return match;
        });
    }

    if (sort && sort.active && sort.direction) {
        filteredData.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'nazov': return compare(a.nazov, b.nazov, isAsc);
                case 'ico': return compare(a.ico, b.ico, isAsc);
                case 'email': return compare(a.email, b.email, isAsc);
                case 'telefon': return compare(a.telefon, b.telefon, isAsc);
                case 'skoreSpolahlivosti': return compare(a.skoreSpolahlivosti, b.skoreSpolahlivosti, isAsc);
                case 'hodnotaObjednavok': return compare(a.hodnotaObjednavok, b.hodnotaObjednavok, isAsc);
                default: return 0;
            }
        });
    }

    const startIndex = page * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    return of({
      items: paginatedData,
      totalCount: filteredData.length
    });
  }

  applyTableFilters(): void {
    console.log('Filters applied manually (if button exists):', this.getFilterValues());
    this.loadTableData();
  }

  resetTableFilters(): void {
    this.resetFilters();
  }

  clearTableStavFilters(): void {
    this.clearStavFilters();
    this.loadTableData();
  }

  confirmDeleteFirma(id: number): void {
    if (confirm(`Naozaj chcete vymazať firmu s ID: ${id}?`)) {
      this.deleteFirma(id).subscribe({
        next: () => {
          console.log(`Firma s ID: ${id} bola vymazaná.`);
          this.loadTableData(this.paginator.pageIndex, this.paginator.pageSize);
        },
        error: (err) => {
          console.error(`Chyba pri mazaní firmy s ID: ${id}`, err);
        }
      });
    }
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
} 