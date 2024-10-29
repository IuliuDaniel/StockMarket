import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Stock {
  symbol: string;
  price: number;
  previousPrice?: number;
  companyName: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  // Finnhub API key
  private apiKey = 'csbs4ghr01qgt32eoptgcsbs4ghr01qgt32eopu0';

  //Alpha Vantage API key
  private apiKey2 = 'ZOWV804YZRPH40CK';


  constructor(private http: HttpClient) { }

  getStocks(symbol: string): Observable<any> {

    const url = `/api/proxy?symbol=${symbol}&token=${this.apiKey}`; // Production URL
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

  getStockHistory(symbol: string): Observable<any> {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey2}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching historical stock data:', error);
        return of(null);
      })
    );
  }

  /* Paid feature
   getStockHistory(symbol: string): Observable<any> {
     // Get the current date and one month ago
     const to = Math.floor(Date.now() / 1000); // Current timestamp
     const from = Math.floor(Date.now() / 1000) - 2 * 24 * 60 * 60; // One month ago in seconds
 
     const url = `https://cors-anywhere.herokuapp.com/https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${this.apiKey}`;
 
     const headers = new HttpHeaders({
       'X-Requested-With': 'XMLHttpRequest', // Add this header
     });
 
     return this.http.get(url).pipe(
       catchError((error) => {
         console.error('Error fetching historical stock data:', error);
         return of(null); // Return null in case of an error
       })
     );
   }
 */


  getCompanyNews(symbol: string, from: string, to: string): Observable<any> {

    const url = `/api/proxy?symbol=${symbol}&from=${from}&to=${to}&token=${this.apiKey}`; // Production URL
    return this.http.get(url).pipe(
      catchError((error) => {
        console.error('Error fetching company news:', error);
        return of(null); // Return null in case of an error
      })
    );
  }

}
