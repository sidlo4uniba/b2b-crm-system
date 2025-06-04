import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  KategoriaProduktuDTO,
  CreateKategorieProduktovCommand,
  UpdateKategorieProduktovCommand,
  CreatedResponse
} from './kategorie-produktov-http-client.models';

@Injectable({
  providedIn: 'root'
})
export class KategorieProduktovHttpClientService {

  private readonly baseApiUrl = `${environment.apiUrl}/api/kategorie-produktov`;

  constructor(private http: HttpClient) { }

  
  getList(): Observable<KategoriaProduktuDTO[]> {
    return this.http.get<KategoriaProduktuDTO[]>(this.baseApiUrl);
  }

  
  create(command: CreateKategorieProduktovCommand): Observable<CreatedResponse> {
    return this.http.post<CreatedResponse>(this.baseApiUrl, command);
  }

  
  update(id: number, command: UpdateKategorieProduktovCommand): Observable<void> {
    
    if (id !== command.id) {
      throw new Error("ID in path parameter must match ID in request body.");
      
    }
    const url = `${this.baseApiUrl}/${id}`;
    
    return this.http.put<void>(url, command);
  }

  
  delete(id: number): Observable<void> {
    const url = `${this.baseApiUrl}/${id}`;
    
    return this.http.delete<void>(url);
  }
}
