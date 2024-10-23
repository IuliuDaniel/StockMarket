import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Stock {
  symbol: string;
  price: number;
  companyName: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiKey = 'csbs4ghr01qgt32eoptgcsbs4ghr01qgt32eopu0';

  constructor(private http: HttpClient) { }

  getStocks(symbol: string): Observable<any> {
    const url = `https://cors-anywhere.herokuapp.com/https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.apiKey}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching stock data:', error);
        return of(null);
      })
    );
  }
}
