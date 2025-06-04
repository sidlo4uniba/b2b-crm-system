
export interface CreatedResponse {
    id: number;
}


export interface CreateTovarCommand {
    dodavatelId: number;
    interneId: string;
    nazov: string;
    kategoriaId: number;
    cena: number;
    obrazokURL?: string | null;
    ean?: string | null;
    aktivny?: boolean | null; 
}


export interface UpdateTovarCommand {
    dodavatelId: number;
    tovarId: number;
    interneId: string;
    nazov: string;
    kategoriaId: number;
    cena: number;
    obrazokURL?: string | null;
    ean?: string | null;
}


export interface UpdateTovarAktivnyCommand {
    dodavatelId: number;
    tovarId: number;
    aktivny: boolean;
}
