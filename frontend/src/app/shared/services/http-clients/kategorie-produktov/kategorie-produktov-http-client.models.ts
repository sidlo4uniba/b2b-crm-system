
export interface CreatedResponse {
  id: number;
}


export interface KategoriaProduktuDTO {
  id: number;
  nazov: string;
  createdOn: string; 
  createdBy: string;
  lastModifiedOn: string; 
  lastModifiedBy: string | null;
}


export interface CreateKategorieProduktovCommand {
  nazov: string;
}


export interface UpdateKategorieProduktovCommand {
  id: number;
  nazov: string;
}
