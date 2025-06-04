
export interface Adresa {
  ulica: string;
  mesto: string;
  psc: string;
  krajina: string | null;
}


export interface DodavatelDTO {
  nazovFirmy: string;
  email: string;
  telefon: string;
  adresa: Adresa | null;
  poznamka: string | null;
  aktivny: boolean;
  vytvoreneDna: string; 
  vytvorilUzivatel: string | null;
  upraveneDna: string | null; 
  upravilUzivatel: string | null;
}


export interface KategoriaProduktovShortDTO {
    nazov: string;
}


export interface TovarShortDTO {
  interneId: string;
  nazov: string;
  obrazokURL: string | null;
  kategoria: KategoriaProduktovShortDTO;
  kategoriaId: number;
  ean: string | null;
  cena: number;
  dodavatelId: number;
  aktivny: boolean;
  vytvoreneDna: string; 
  vytvorilUzivatel: string | null;
  upraveneDna: string | null; 
  upravilUzivatel: string | null;
}


export interface DodavatelDetailDTO extends Omit<DodavatelDTO, 'adresa'> { 
  adresa: Adresa | null; 
  tovary: TovarShortDTO[];
}



export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}




export interface CreateDodavatelCommand {
  nazovFirmy: string;
  email: string;
  telefon: string;
  adresa?: Adresa | null; 
  poznamka?: string | null;
  aktivny?: boolean | null; 
}


export interface CreateDodavatelResponse {
    id: number;
}



export interface UpdateDodavatelCommand {
  id: number; 
  nazovFirmy: string;
  email: string;
  telefon: string;
  adresa: Adresa | null; 
  poznamka: string | null; 
}


export interface UpdateDodavatelAktivnyCommand {
    id: number; 
    aktivny: boolean;
} 