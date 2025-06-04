
export interface CreatedResponse {
    id: number;
}


export interface CreateKontaktnaOsobaCommand {
    firmaId: number;
    meno: string;
    priezvisko: string;
    telefon: string;
    email: string;
    aktivny?: boolean | null; 
}


export interface UpdateKontaktnaOsobaCommand {
    firmaId: number;
    kontaktnaOsobaId: number;
    meno: string;
    priezvisko: string;
    telefon: string;
    email: string;
}


export interface UpdateKontaktnaOsobaAktivnyCommand {
    firmaId: number;
    kontaktnaOsobaId: number;
    aktivny: boolean;
}
