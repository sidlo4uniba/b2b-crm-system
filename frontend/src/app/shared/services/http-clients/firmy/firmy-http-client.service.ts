import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
    PaginatedList,
    FirmaDTO,
    FirmaDetailDTO,
    CreateFirmaCommand,
    UpdateFirmaCommand,
    CreatedResponse
} from './firmy-http-client.models';

@Injectable({
    providedIn: 'root'
})
export class FirmyHttpClientService {

    private readonly baseApiUrl = `${environment.apiUrl}/api/firmy`;

    constructor(private http: HttpClient) { }

    
    getList(
        pageSize: number,
        page: number,
        orderBy?: string,
        search?: string,
        filterString?: string 
    ): Observable<PaginatedList<FirmaDTO>> {

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

        return this.http.get<PaginatedList<FirmaDTO>>(url);
    }

    
    getById(id: number): Observable<FirmaDetailDTO> {
        const url = `${this.baseApiUrl}/${id}`;
        return this.http.get<FirmaDetailDTO>(url);
    }

    
    create(command: CreateFirmaCommand): Observable<CreatedResponse> {
        return this.http.post<CreatedResponse>(this.baseApiUrl, command);
    }

    
    update(id: number, command: UpdateFirmaCommand): Observable<any> {
        if (id !== command.id) {
            throw new Error("ID in path parameter must match ID in request body.");
        }
        const url = `${this.baseApiUrl}/${id}`;
        return this.http.put(url, command, { responseType: 'blob' }); 
    }

    
    delete(id: number): Observable<any> {
        const url = `${this.baseApiUrl}/${id}`;
        return this.http.delete(url, { responseType: 'blob' }); 
    }
}
