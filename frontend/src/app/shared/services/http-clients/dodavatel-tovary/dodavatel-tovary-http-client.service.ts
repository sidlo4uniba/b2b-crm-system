import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
    CreateTovarCommand,
    UpdateTovarCommand,
    UpdateTovarAktivnyCommand,
    CreatedResponse
} from './dodavatel-tovary-http-client.models';

@Injectable({
    providedIn: 'root'
})
export class DodavatelTovaryHttpClientService {

    
    private getBaseUrl(dodavatelId: number): string {
        return `${environment.apiUrl}/api/dodavatelia/${dodavatelId}/tovary`;
    }

    constructor(private http: HttpClient) { }

    
    create(dodavatelId: number, command: CreateTovarCommand): Observable<CreatedResponse> {
        
        if (dodavatelId !== command.dodavatelId) {
            throw new Error("dodavatelId in path parameter must match dodavatelId in request body.");
        }
        const url = this.getBaseUrl(dodavatelId);
        return this.http.post<CreatedResponse>(url, command);
    }

    
    update(dodavatelId: number, tovarId: number, command: UpdateTovarCommand): Observable<any> {
        if (dodavatelId !== command.dodavatelId || tovarId !== command.tovarId) {
            throw new Error("IDs in path parameters must match IDs in request body.");
        }
        const url = `${this.getBaseUrl(dodavatelId)}/${tovarId}`;
        return this.http.put(url, command, { responseType: 'blob' }); 
    }

    
    delete(dodavatelId: number, tovarId: number): Observable<any> {
        const url = `${this.getBaseUrl(dodavatelId)}/${tovarId}`;
        return this.http.delete(url, { responseType: 'blob' }); 
    }

    
    updateAktivny(dodavatelId: number, tovarId: number, command: UpdateTovarAktivnyCommand): Observable<any> {
        if (dodavatelId !== command.dodavatelId || tovarId !== command.tovarId) {
            throw new Error("IDs in path parameters must match IDs in request body.");
        }
        const url = `${this.getBaseUrl(dodavatelId)}/${tovarId}/aktivny`;
        return this.http.put(url, command, { responseType: 'blob' }); 
    }
}
