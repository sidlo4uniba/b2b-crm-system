
export interface PaginatedList<T> {
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}


export interface CreatedResponse {
    id: number;
}


export interface AdresaDTO {
    ulica: string;
    mesto?: string; 
    psc?: string;   
    krajina: string | null;
}


export enum ObjednavkaFaza {
    Nacenenie = 0,
    NacenenieCaka = 1,
    VyrobaNeriesene = 2,
    VyrobaNemozna = 3,
    VyrobaCaka = 4,
    OdoslanieCaka = 5,
    PlatbaCaka = 6,
    Vybavene = 7
}


export interface FirmaDTO {
    id: number;
    nazov: string;
    ico: string;
    adresa: AdresaDTO; 
    icDph: string | null;
    skoreSpolahlivosti: number;
    hodnotaObjednavok: number;
    vytvoreneDna: string; 
    vytvorilUzivatel: string;
    upraveneDna: string; 
    upravilUzivatel: string | null;
}


export interface KontaktnaOsobaDTO {
    id: number;
    meno: string;
    priezvisko: string;
    telefon: string;
    email: string;
    aktivny: boolean;
}


export interface ObjednavkaSimpleDTO {
    id: number;
    firmaId: number;
    kontaktnaOsobaId: number;
    kontaktnaOsobaMeno: string;
    kontaktnaOsobaPriezvisko: string;
    kontaktnaOsobaTelefon: string;
    kontaktnaOsobaEmail: string;
    faza: ObjednavkaFaza | number; 
    poznamka: string | null;
    chybaKlienta: number | null; 
    ocakavanyDatumDorucenia: string | null; 
    naplanovanyDatumVyroby: string | null; 
    zrusene: boolean;
    zaplatene: boolean;
    poslednaCenovaPonukaId: number | null;
    vytvoreneDna: string; 
    vytvorilUzivatel: string;
    upraveneDna: string; 
    upravilUzivatel: string | null;
}


export interface FirmaDetailDTO {
    id: number;
    nazov: string;
    ico: string;
    adresa: AdresaDTO; 
    icDph: string | null;
    skoreSpolahlivosti: number;
    hodnotaObjednavok: number;
    kontaktneOsoby: KontaktnaOsobaDTO[];
    objednavky: ObjednavkaSimpleDTO[];
    vytvoreneDna: string; 
    vytvorilUzivatel: string;
    upraveneDna: string; 
    upravilUzivatel: string | null;
}


export interface CreateFirmaCommand {
    nazov: string;
    ico: string;
    adresa: AdresaDTO;
    icDph?: string | null;
}


export interface UpdateFirmaCommand {
    id: number;
    nazov: string;
    ico: string;
    adresa: AdresaDTO;
    icDph?: string | null;
}
