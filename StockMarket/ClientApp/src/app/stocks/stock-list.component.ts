import { Component, OnInit } from '@angular/core';
import { StockService, Stock } from '../stock.service';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.css']
})
export class StockListComponent implements OnInit {
  stocks: Stock[] = [];
  showPopup: boolean = false;
  popupContent: string = '';
  currentSymbol: string = '';
  tooltipContent: string = '';
  symbols: string[] = ['AAPL', 'MSFT', 'AMZN', 'NVDA', 'GOOGL', 'TSLA', 'GOOG', 'BRK.B', 'META', 'UNH', 'XOM', 'LLY', 'JPM', 'JNJ',
                       'V', 'PG', 'MA', 'AVGO', 'HD', 'CVX', 'MRK', 'ABBV', 'COST', 'PEP', 'ADBE'];
  companyNames: string[] = [
    'Apple Inc.',
    'Microsoft Corp.',
    'Amazon.com Inc.',
    'NVIDIA Corp.',
    'Alphabet Inc. (GOOGL)',
    'Tesla Inc.',
    'Alphabet Inc. (GOOG)',
    'Berkshire Hathaway Inc.',
    'Meta Platforms Inc.',
    'UnitedHealth Group Inc.',
    'Exxon Mobil Corp.',
    'Eli Lilly and Company',
    'JPMorgan Chase & Co.',
    'Johnson & Johnson',
    'Visa Inc.',
    'Procter & Gamble Co.',
    'Mastercard Inc.',
    'Broadcom Inc.',
    'Home Depot Inc.',
    'Chevron Corp.',
    'Merck & Co., Inc.',
    'AbbVie Inc.',
    'Costco Wholesale Corp.',
    'PepsiCo Inc.',
    'Adobe Inc.'
  ];

  constructor(private stockService: StockService) { }

  ngOnInit(): void {
    this.fetchStockData();
  }

  togglePopup(symbol: string): void {
    this.showPopup = !this.showPopup; // Toggle visibility
    this.currentSymbol = symbol; // Set the current stock symbol
    this.popupContent = ` <p><a href="https://www.etoro.com/markets/${symbol.toLowerCase()}" target="_blank" rel="noopener noreferrer">View on eToro</a> </p>`;
  }

  // Close the pop-up when "X" is clicked
  closePopup(): void {
    this.showPopup = false; // Hide the pop-up
  }

  // Getter for comparing prices
  isPriceUp(stock: Stock): boolean {
    return stock.previousPrice !== undefined && stock.price > stock.previousPrice;
  }

  isPriceDown(stock: Stock): boolean {
    return stock.previousPrice !== undefined && stock.price < stock.previousPrice;
  }

  fetchStockData(): void {
    this.symbols.forEach((symbol, index) => {
      this.stockService.getStocks(symbol).subscribe(
        (data) => {
          if (data) {
            this.stocks.push({
              symbol: symbol,
              price: data.c, // Using 'c' for current price
              previousPrice: data.pc, // Using 'pc;
              companyName: this.companyNames[index]
            });
          }
        },
        (error) => {
          console.error('Error fetching stock data for ' + symbol, error);
        }
      );
    });
  }
}
