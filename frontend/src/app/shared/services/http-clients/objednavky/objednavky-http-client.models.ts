
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


export enum ChybaKlienta {
    ZrusenaPriVyrobe = 0,
    NezaplatenaNaCas = 1,
    ZlaKomunikacia = 2,
    InyProblem = 3
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


export enum StavCenovejPonuky {
    Neriesene = 0,
    Poslane = 1,
    Schvalene = 2,
    Zrusene = 3
}


export interface ObjednavkaDTO {
    id: number;
    firmaId: number;
    firmaNazov: string;
    firmaICO: string;
    kontaktnaOsobaId: number;
    kontaktnaOsobaMeno: string;
    kontaktnaOsobaPriezvisko: string;
    kontaktnaOsobaTelefon: string;
    kontaktnaOsobaEmail: string;
    faza: ObjednavkaFaza | number;
    poznamka: string | null;
    chybaKlienta: ChybaKlienta | number | null;
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


export interface CenovaPonukaTovarDTO {
    id: number;
    tovarId: number;
    variantTovarId?: number | null;
    nazovTovaru: string;
    interneId: string;
    kategoriaId: number;
    mnozstvo: number;
    cena: number;
    jeVariantTovaru: boolean;
    velkost?: { code: string } | null;
    farbaHex?: string | null;
}

export interface CenovaPonukaDTO {
    id: number;
    finalnaCena: number;
    stav: StavCenovejPonuky | number;
    polozky: CenovaPonukaTovarDTO[];
}


export interface ObjednavkaDetailDTO {
    id: number; 
    firmaId: number;
    firmaNazov: string;
    firmaICO: string;
    kontaktnaOsobaId: number;
    kontaktnaOsobaMeno: string;
    kontaktnaOsobaPriezvisko: string;
    kontaktnaOsobaTelefon: string;
    kontaktnaOsobaEmail: string;
    faza: ObjednavkaFaza | number; 
    poznamka: string | null;
    chybaKlienta: ChybaKlienta | number | null; 
    ocakavanyDatumDorucenia: string | null; 
    naplanovanyDatumVyroby: string | null; 
    zrusene: boolean;
    zaplatene: boolean;
    poslednaCenovaPonukaId: number | null;
    cenovePonuky: CenovaPonukaDTO[];
    vytvoreneDna: string; 
    vytvorilUzivatel: string;
    upraveneDna: string; 
    upravilUzivatel: string | null;
}


export interface CreateObjednavkaCommand {
    firmaId: number;
    kontaktnaOsobaId: number;
    ocakavanyDatumDorucenia?: string | null; 
    poznamka?: string | null;
}


export interface PatchObjednavkaCommand {
    objednavkaId: number;
    kontaktnaOsobaId?: number | null;
    zaplatene?: boolean | null;
    zrusene?: boolean | null;
    poznamka?: string | null;
}


export interface UpdateObjednavkaFazaCommand {
    objednavkaId: number;
    faza: ObjednavkaFaza | number; 
}


export interface UpdateObjednavkaNaplanovanyDatumVyrobyCommand {
    objednavkaId: number;
    naplanovanyDatumVyroby?: string | null; 
}


export interface UpdateObjednavkaOcakavanyDatumDoruceniaCommand {
    objednavkaId: number;
    ocakavanyDatumDorucenia?: string | null; 
}


export interface UpdateObjednavkaChybaKlientaCommand {
    objednavkaId: number;
    chybaKlienta?: ChybaKlienta | number | null; 
}
