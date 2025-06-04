
export interface CenovaPonukaTovarCommandDto {
    tovarId: number;
    variantTovarId?: number | null;
    mnozstvo: number;
}


export interface PatchCenovaPonukaCommand {
    objednavkaId: number;
    cenovaPonukaId: number;
    finalnaCena?: number | null;
    polozky?: CenovaPonukaTovarCommandDto[] | null;
}
