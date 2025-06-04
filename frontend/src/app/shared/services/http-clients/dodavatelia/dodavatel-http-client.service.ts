import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    PaginatedList,
    DodavatelDTO,
    DodavatelDetailDTO,
    CreateDodavatelCommand,
    CreateDodavatelResponse,
    UpdateDodavatelCommand,
    UpdateDodavatelAktivnyCommand
} from './dodavatel-http-client.models';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DodavatelHttpClientService {

  private readonly baseApiUrl = `${environment.apiUrl}/api/dodavatelia`; 

  constructor(private http: HttpClient) { }

  
  getList(
    pageSize: number,
    page: number,
    orderBy?: string,
    search?: string,
    filterString?: string 
  ): Observable<PaginatedList<DodavatelDTO>> {

    
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


    return this.http.get<PaginatedList<DodavatelDTO>>(url); 
  }

  
  getById(id: number): Observable<DodavatelDetailDTO> {
    
    return this.http.get<DodavatelDetailDTO>(`${this.baseApiUrl}/${id}`);
  }

  
  create(command: CreateDodavatelCommand): Observable<CreateDodavatelResponse> {
    return this.http.post<CreateDodavatelResponse>(this.baseApiUrl, command);
  }

  
  update(id: number, command: UpdateDodavatelCommand): Observable<any> {
    if (command.id !== id) {
        console.error("Mismatch between ID in path and ID in command body for PUT request.");
    }
    return this.http.put<any>(`${this.baseApiUrl}/${id}`, command);
  }

  
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseApiUrl}/${id}`);
  }

  
  updateAktivny(id: number, command: UpdateDodavatelAktivnyCommand): Observable<any> {
     if (command.id !== id) {
        console.error("Mismatch between ID in path and ID in command body for PUT /aktivny request.");
    }
    return this.http.put<any>(`${this.baseApiUrl}/${id}/aktivny`, command);
  }
} 