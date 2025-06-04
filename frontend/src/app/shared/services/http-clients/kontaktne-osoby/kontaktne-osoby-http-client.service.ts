import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
    CreatedResponse,
    CreateKontaktnaOsobaCommand,
    UpdateKontaktnaOsobaCommand,
    UpdateKontaktnaOsobaAktivnyCommand
} from './kontaktne-osoby-http-client.models';

@Injectable({
    providedIn: 'root'
})
export class KontaktneOsobyHttpClientService {

    
    private getBaseUrl(firmaId: number): string {
        return `${environment.apiUrl}/api/firmy/${firmaId}/kontaktne-osoby`;
    }

    constructor(private http: HttpClient) { }

    
    create(firmaId: number, command: CreateKontaktnaOsobaCommand): Observable<CreatedResponse> {
        if (firmaId !== command.firmaId) {
            throw new Error("firmaId in path parameter must match firmaId in request body.");
        }
        const url = this.getBaseUrl(firmaId);
        return this.http.post<CreatedResponse>(url, command);
    }

    
    update(firmaId: number, osobaId: number, command: UpdateKontaktnaOsobaCommand): Observable<any> {
        if (firmaId !== command.firmaId || osobaId !== command.kontaktnaOsobaId) {
            throw new Error("IDs in path parameters must match IDs in request body.");
        }
        const url = `${this.getBaseUrl(firmaId)}/${osobaId}`;
        return this.http.put(url, command, { responseType: 'blob' }); 
    }

    
    delete(firmaId: number, osobaId: number): Observable<any> {
        const url = `${this.getBaseUrl(firmaId)}/${osobaId}`;
        return this.http.delete(url, { responseType: 'blob' }); 
    }

    
    updateAktivny(firmaId: number, osobaId: number, command: UpdateKontaktnaOsobaAktivnyCommand): Observable<any> {
        if (firmaId !== command.firmaId || osobaId !== command.kontaktnaOsobaId) {
            throw new Error("IDs in path parameters must match IDs in request body.");
        }
        const url = `${this.getBaseUrl(firmaId)}/${osobaId}/aktivny`;
        return this.http.put(url, command, { responseType: 'blob' }); 
    }
}
