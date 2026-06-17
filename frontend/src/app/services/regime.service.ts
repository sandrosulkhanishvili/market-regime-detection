import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegimeDay } from '../models/regime.model';

@Injectable({ providedIn: 'root' })
export class RegimeService {
  private readonly apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getRegimes(): Observable<RegimeDay[]> {
    return this.http.get<RegimeDay[]>(`${this.apiUrl}/regimes`);
  }
}
