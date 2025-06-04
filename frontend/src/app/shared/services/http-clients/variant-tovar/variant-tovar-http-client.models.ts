
export interface CreatedResponse {
    id: number;
}


export interface VelkostDTO {
    code: string; 
}


export interface CreateVariantTovarCommand {
    tovarId: number;
    farbaHex?: string | null;
    velkost?: VelkostDTO | null;
    cena: number;
    obrazokURL?: string | null;
    aktivny?: boolean | null; 
}


export interface UpdateVariantTovarCommand {
    tovarId: number;
    variantId: number;
    farbaHex?: string | null;
    velkost?: VelkostDTO | null;
    cena: number;
    obrazokURL?: string | null;
}


export interface UpdateVariantTovarAktivnyCommand {
    tovarId: number;
    variantId: number;
    aktivny: boolean;
}
