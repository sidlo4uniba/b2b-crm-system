import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
    CreatedResponse,
    CreateVariantTovarCommand,
    UpdateVariantTovarCommand,
    UpdateVariantTovarAktivnyCommand
} from './variant-tovar-http-client.models';

@Injectable({
    providedIn: 'root'
})
export class VariantTovarHttpClientService {

    
    private getBaseUrl(dodavatelId: number, tovarId: number): string {
        return `${environment.apiUrl}/api/dodavatelia/${dodavatelId}/tovary/${tovarId}/varianty`;
    }

    constructor(private http: HttpClient) { }

    
    create(dodavatelId: number, tovarId: number, command: CreateVariantTovarCommand): Observable<CreatedResponse> {
        if (tovarId !== command.tovarId) {
            throw new Error("tovarId in path parameter must match tovarId in request body.");
        }
        const url = this.getBaseUrl(dodavatelId, tovarId);
        return this.http.post<CreatedResponse>(url, command);
    }

    
    update(dodavatelId: number, tovarId: number, variantId: number, command: UpdateVariantTovarCommand): Observable<any> {
        if (tovarId !== command.tovarId || variantId !== command.variantId) {
            throw new Error("IDs in path parameters must match IDs in request body.");
        }
        const url = `${this.getBaseUrl(dodavatelId, tovarId)}/${variantId}`;
        return this.http.put(url, command, { responseType: 'blob' }); 
    }

    
    delete(dodavatelId: number, tovarId: number, variantId: number): Observable<any> {
        const url = `${this.getBaseUrl(dodavatelId, tovarId)}/${variantId}`;
        return this.http.delete(url, { responseType: 'blob' }); 
    }

    
    updateAktivny(dodavatelId: number, tovarId: number, variantId: number, command: UpdateVariantTovarAktivnyCommand): Observable<any> {
        if (tovarId !== command.tovarId || variantId !== command.variantId) {
            throw new Error("IDs in path parameters must match IDs in request body.");
        }
        const url = `${this.getBaseUrl(dodavatelId, tovarId)}/${variantId}/aktivny`;
        return this.http.put(url, command, { responseType: 'blob' }); 
    }
}
