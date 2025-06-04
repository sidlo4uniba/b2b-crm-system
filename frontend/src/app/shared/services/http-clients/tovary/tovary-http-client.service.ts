import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
    PaginatedList,
    TovarDTO,
    TovarDetailDTO
} from './tovary-http-client.models';

@Injectable({
    providedIn: 'root'
})
export class TovaryHttpClientService {

    private readonly baseApiUrl = `${environment.apiUrl}/api/tovary`;

    constructor(private http: HttpClient) { }

    
    getList(
        pageSize: number,
        page: number,
        orderBy?: string,
        search?: string,
        filterString?: string 
    ): Observable<PaginatedList<TovarDTO>> {

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

        return this.http.get<PaginatedList<TovarDTO>>(url);
    }

    
    getById(id: number): Observable<TovarDetailDTO> {
        const url = `${this.baseApiUrl}/${id}`;
        return this.http.get<TovarDetailDTO>(url);
    }
}
