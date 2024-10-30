import { Component, OnInit } from '@angular/core';
import { StockService, Stock } from '../stock.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ElementRef, ViewChild } from '@angular/core';

// Define positive and negative keywords
const positiveKeywords = ['gain', 'success', 'growth', 'profit', 'increase', 'upward', 'improve', 'announce', 'blockbuster', 'expanding', 'secures', 'make money', 'soared', 'milestone'];
const negativeKeywords = ['loss', 'decline', 'decrease', 'down', 'crisis', 'fall', 'drop', 'negative', 'dissatisfaction', 'fired', 'fire', 'downgrade', 'dissatisfaction', 'scam', 'scams', 'reverse', 'restricting', 'restrictions',
                          ];


@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.css'],
  animations: [
    trigger('popupAnimation', [
      state('minimized', style({
        transform: 'scale(0.5)',
        opacity: 0
      })),
      state('maximized', style({
        transform: 'scale(1)',
        opacity: 1
      })),
      transition('minimized => maximized', [
        animate('300ms ease-out')
      ]),
      transition('maximized => minimized', [
        animate('300ms ease-in')
      ])
    ])
  ]
})

export class StockListComponent implements OnInit {
  stocks: Stock[] = [];
  showPopup: boolean = false;

  // Price pop-up properties
  popupContent: string = '';
  currentSymbol: string = '';
  tooltipContent: string = '';

  // Company pop-up properties
  companyPopupSymbols: { [key: string]: boolean } = {}; // Track visibility per symbol


  // Chart properties
  isGraphVisible: boolean = false;
  graphData: number[] = []; // This will hold chart data
  graphLabels: string[] = []; // This will hold chart labels
  companyPopupChartIds: { [key: string]: string } = {}; // Track chart IDs per symbol
  graphDataBySymbol: { [key: string]: { data: number[], labels: string[] } } = {}; // Track graph data and labels per symbol


  // News properties
  companyNews: { [key: string]: any[] } = {}; // Object to store news articles per company symbol

  // Search properties
  @ViewChild('stockList', { static: false }) stockListRef!: ElementRef;
  searchSymbol: string = ''; // To hold the search input value

  // Add a new property for each symbol to track the arrow direction
  arrowDirections: { [key: string]: 'up' | 'down' | 'neutral' } = {};

  // Array with less symbols for testing - less request/page load
// symbols: string[] = ['AAPL', 'MSFT', 'AMZN', 'NVDA', 'GOOGL'];

 
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
    // Fetch historical data for all stock symbols at the start
    this.symbols.forEach(symbol => {
      this.fetchStockHistory(symbol);  // Call to fetch stock data
      this.fetchCompanyNews(symbol);    // Call to fetch company news if needed
      this.companyPopupChartIds[symbol] = `chart-${symbol}-${Date.now()}`; // Unique ID for chart
    });
  }


  // Price pop-up
  togglePopup(symbol: string): void {
    this.showPopup = !this.showPopup; // Toggle visibility
    this.currentSymbol = symbol; // Set the current stock symbol
    this.popupContent = `<p><a href="https://www.etoro.com/markets/${symbol.toLowerCase()}" target="_blank" rel="noopener noreferrer">View on eToro</a> </p>`
      + 'More coming soon...';
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


  //Company pop-up
  toggleCompanyPopup(symbol: string): void {
    this.companyPopupSymbols[symbol] = !this.companyPopupSymbols[symbol]; // Toggle visibility for each symbol
    if (this.companyPopupSymbols[symbol]) {
      this.companyPopupChartIds[symbol] = `chart-${symbol}-${Date.now()}`; // Unique ID based on symbol and timestamp
      //this.fetchStockHistory(symbol); // Fetch historical data when the pop-up opens
      this.fetchCompanyNews(symbol); // Fetch company news for the selected symbol
    }
  }
  closeCompanyPopup(symbol: string): void {
    this.companyPopupSymbols[symbol] = false; // Hide the pop-up for the given symbol
  }


  // Function to analyze sentiment of a news summary
  // Improve by either adding keywords over time or develop another method through API from finnhub(paid) like sources
  // The functionality should be improved by adding a counter for keywords in case both types appear in the same article
  // ^ maybe add more tiers of trust to it (mostly negative/mostly positive etc...)
  analyzeSentiment(summary: string): 'positive' | 'negative' | 'neutral' {
    const summaryLower = summary.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveKeywords.forEach(word => {
      if (summaryLower.includes(word)) positiveCount++;
    });

    negativeKeywords.forEach(word => {
      if (summaryLower.includes(word)) negativeCount++;
    });

    const sentiment = positiveCount > negativeCount ? 'positive' :
      negativeCount > positiveCount ? 'negative' : 'neutral';
    return sentiment;
  }

  // Request for company news - limited to 3 past n days
  fetchCompanyNews(symbol: string): void {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7); // Set to 1 day ago
    const toDate = new Date(); // Set to today

    // Format the dates to YYYY-MM-DD
    const fromDateString = fromDate.toISOString().split('T')[0];
    const toDateString = toDate.toISOString().split('T')[0];

    this.stockService.getCompanyNews(symbol, fromDateString, toDateString).subscribe(
      (data) => {
        if (data && Array.isArray(data)) {
          // Retrieve the company name based on the stock symbol
          const companyName = this.companyNames[this.symbols.indexOf(symbol)];

          // Extract keywords from the company name
          const keywords = companyName.split(' ').map(word => word.toLowerCase());

          // Filter articles to only include those that contain any keyword from the company name
          const filteredArticles = data.filter((article: any) =>
            keywords.some(keyword => article.headline.toLowerCase().includes(keyword))
          );

          // Store articles in the companyNews object for this symbol
          this.companyNews[symbol] = filteredArticles.slice(0, 3).map((article: any) => ({
            ...article,
            sentiment: this.analyzeSentiment(article.summary) // Analyze summary
          }));
        } else {
          console.log('No news available.');
          this.companyNews[symbol] = []; // Ensure it's an empty array if no news
        }
      },
      (error) => {
        console.error('Error fetching company news', error);
        this.companyNews[symbol] = []; // Ensure it's an empty array on error
      }
    );
  }

  // Request for stock history, limited to 25 requests/day - find better alternative
  fetchStockHistory(symbol: string): void {
    this.stockService.getStockHistory(symbol).subscribe(
      (data) => {
        console.log('API Response:', data); // Log the data to check the structure

        if (data && data['Time Series (Daily)']) {
          const timeSeries = data['Time Series (Daily)'];
          const graphLabels = Object.keys(timeSeries).slice(0, 7); // Get the last 7 days
          const graphData = graphLabels.map(date => parseFloat(timeSeries[date]['4. close']));

          // Store the data in the graphDataBySymbol object
          this.graphDataBySymbol[symbol] = { data: graphData.reverse(), labels: graphLabels.reverse() };
        } else {
          console.error('Error fetching historical data for ' + symbol);
        }
      },
      (error) => {
        console.error('Error fetching historical data for ' + symbol, error);
      }
    );
  }
  
  // Request for recent stock data
  fetchStockData(): void {
    this.stocks = []; // Clear stocks array to ensure fresh data each time

    const fetchPromises = this.symbols.map((symbol, index) =>
      new Promise<void>((resolve) => {
        this.stockService.getStocks(symbol).subscribe(
          (data) => {
            if (data) {
              this.stocks.push({
                symbol: symbol,
                price: data.c, // 'c' for current price
                previousPrice: data.pc, // 'pc' for previous close price
                companyName: this.companyNames[index]
              });
            }
            resolve();
          },
          (error) => {
            console.error('Error fetching stock data for ' + symbol, error);
            resolve();
          }
        );
      })
    );

    Promise.all(fetchPromises).then(() => {
      // Sort stocks by symbol after all data has been fetched
      this.stocks.sort((a, b) => a.symbol.localeCompare(b.symbol));
    });
  }
}

