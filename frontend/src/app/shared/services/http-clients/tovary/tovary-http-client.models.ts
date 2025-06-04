
export interface PaginatedList<T> {
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}


export interface VariantDTO {
    id: number;
    tovarId: number;
    farbaHex: string | null;
    velkost: { code: string } | null; 
    cena: number;
    obrazokURL: string | null;
    aktivny: boolean;
}


export interface TovarDTO {
    id: number;
    dodavatelId: number;
    dodavatelNazovFirmy: string;
    dodavatelEmail: string;
    dodavatelTelefon: string;
    interneId: string;
    nazov: string;
    obrazokURL: string | null;
    kategoriaId: number;
    ean: string | null;
    cena: number;
    aktivny: boolean;
    vytvoreneDna: string; 
    vytvorilUzivatel: string;
    upraveneDna: string; 
    upravilUzivatel: string | null;
}


export interface TovarDetailDTO {
    id: number;
    dodavatelId: number;
    dodavatelNazovFirmy: string;
    dodavatelEmail: string;
    dodavatelTelefon: string;
    interneId: string;
    nazov: string;
    obrazokURL: string | null;
    kategoriaId: number;
    ean: string | null;
    cena: number; 
    aktivny: boolean;
    varianty: VariantDTO[];
    vytvoreneDna: string; 
    vytvorilUzivatel: string;
    upraveneDna: string; 
    upravilUzivatel: string | null;
}
