import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
    PaginatedList,
    ObjednavkaDTO,
    ObjednavkaDetailDTO,
    CreateObjednavkaCommand,
    PatchObjednavkaCommand,
    UpdateObjednavkaFazaCommand,
    UpdateObjednavkaNaplanovanyDatumVyrobyCommand,
    UpdateObjednavkaOcakavanyDatumDoruceniaCommand,
    UpdateObjednavkaChybaKlientaCommand,
    CreatedResponse,
    ObjednavkaFaza, 
    ChybaKlienta
} from './objednavky-http-client.models';

@Injectable({
    providedIn: 'root'
})
export class ObjednavkyHttpClientService {

    private readonly baseApiUrl = `${environment.apiUrl}/api/objednavky`;

    constructor(private http: HttpClient) { }

    
    getList(
        pageSize: number,
        page: number,
        orderBy?: string,
        search?: string,
        filterString?: string 
    ): Observable<PaginatedList<ObjednavkaDTO>> {

        let params = new HttpParams()
            .set('pageSize', pageSize.toString())
            .set('page', page.toString());

        if (orderBy) {
            params = params.set('sortBy', orderBy);
        }
        if (search) {
            params = params.set('search', search);
        }

        let url = this.baseApiUrl;
        const standardParams = params.toString();

        if (standardParams) {
            url += `?${standardParams}`;
        }

        if (filterString) {
            url += standardParams ? '&' : '?';
            url += filterString; 
        }

        return this.http.get<PaginatedList<ObjednavkaDTO>>(url);
    }

    
    getById(id: number): Observable<ObjednavkaDetailDTO> {
        const url = `${this.baseApiUrl}/${id}`;
        return this.http.get<ObjednavkaDetailDTO>(url);
    }

    
    create(command: CreateObjednavkaCommand): Observable<CreatedResponse> {
        return this.http.post<CreatedResponse>(this.baseApiUrl, command);
    }

    
    patch(id: number, command: PatchObjednavkaCommand): Observable<any> {
        if (id !== command.objednavkaId) {
            throw new Error("ID in path parameter must match objednavkaId in request body.");
        }
        const url = `${this.baseApiUrl}/${id}`;
        return this.http.patch(url, command, { responseType: 'blob' }); 
    }

    
    delete(id: number): Observable<any> {
        const url = `${this.baseApiUrl}/${id}`;
        return this.http.delete(url, { responseType: 'blob' }); 
    }

    
    updateFaza(id: number, command: UpdateObjednavkaFazaCommand): Observable<any> {
        if (id !== command.objednavkaId) {
            throw new Error("ID in path parameter must match objednavkaId in request body.");
        }
        const url = `${this.baseApiUrl}/${id}/faza`;
        return this.http.put(url, command, { responseType: 'blob' }); 
    }

    
    updateDatumVyroby(id: number, command: UpdateObjednavkaNaplanovanyDatumVyrobyCommand): Observable<any> {
        if (id !== command.objednavkaId) {
            throw new Error("ID in path parameter must match objednavkaId in request body.");
        }
        const url = `${this.baseApiUrl}/${id}/datum-vyroby`;
        return this.http.put(url, command, { responseType: 'blob' }); 
    }

    
    updateOcakavanyDatumDorucenia(id: number, command: UpdateObjednavkaOcakavanyDatumDoruceniaCommand): Observable<any> {
        if (id !== command.objednavkaId) {
            throw new Error("ID in path parameter must match objednavkaId in request body.");
        }
        const url = `${this.baseApiUrl}/${id}/ocakavany-datum-dorucenia`;
        return this.http.put(url, command, { responseType: 'blob' }); 
    }

    
    updateChybaKlienta(id: number, command: UpdateObjednavkaChybaKlientaCommand): Observable<any> {
        if (id !== command.objednavkaId) {
            throw new Error("ID in path parameter must match objednavkaId in request body.");
        }
        const url = `${this.baseApiUrl}/${id}/chyba-klienta`;
        return this.http.put(url, command, { responseType: 'blob' }); 
    }
}
