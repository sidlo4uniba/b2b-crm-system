import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
    PatchCenovaPonukaCommand
} from './objednavky-cenove-ponuky-http-client.models';

@Injectable({
    providedIn: 'root'
})
export class ObjednavkyCenovePonukyHttpClientService {

    
    private getBaseUrl(objednavkaId: number): string {
        return `${environment.apiUrl}/api/objednavky/${objednavkaId}/cenove-ponuky`;
    }

    constructor(private http: HttpClient) { }

    
    patch(objednavkaId: number, ponukaId: number, command: PatchCenovaPonukaCommand): Observable<any> {
        if (objednavkaId !== command.objednavkaId || ponukaId !== command.cenovaPonukaId) {
            throw new Error("IDs in path parameters must match IDs in request body.");
        }
        const url = `${this.getBaseUrl(objednavkaId)}/${ponukaId}`;
        return this.http.patch(url, command, { responseType: 'blob' }); 
    }

    
    downloadCenovaPonuka(objednavkaId: number, ponukaId: number): Observable<Blob> {
        const url = `${this.getBaseUrl(objednavkaId)}/${ponukaId}/download`;
        return this.http.get(url, { responseType: 'blob' });
    }
}
