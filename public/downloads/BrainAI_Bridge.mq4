//+------------------------------------------------------------------+
//|                                              BrainAI_Bridge.mq4  |
//|                        Brain Link Tracker AI Integration Bridge  |
//|                                  https://brain-ai-trader.com     |
//+------------------------------------------------------------------+
#property copyright "Brain AI Trader"
#property link      "https://brain-ai-trader.com"
#property version   "2.00"
#property strict

// --- Inputs ---
input string   API_URL = "http://localhost:3000/api/ea/signals?format=csv";
input string   SymbolPrefix = "";
input string   SymbolSuffix = "";
input double   RiskPercent = 1.0;
input double   FixedLot = 0.0;
input int      PollInterval = 5;
input int      MagicNumber = 8888;
input int      Slippage = 10;

// --- Globals ---
string ProcessedIDs[50];
int IDCount = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   Print("BrainAI Bridge PRO (MT4) Initialized. Polling every ", PollInterval, " seconds.");
   EventSetTimer(PollInterval);
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
  }

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
  {
   CheckForSignals();
  }

//+------------------------------------------------------------------+
//| Helpers                                                          |
//+------------------------------------------------------------------+
bool IsProcessed(string id)
{
   for(int i=0; i<IDCount; i++) {
      if(ProcessedIDs[i] == id) return true;
   }
   return false;
}

void MarkProcessed(string id)
{
   if(IDCount < 50) {
      ProcessedIDs[IDCount] = id;
      IDCount++;
   } else {
      // Shift array
      for(int i=0; i<49; i++) ProcessedIDs[i] = ProcessedIDs[i+1];
      ProcessedIDs[49] = id;
   }
}

//+------------------------------------------------------------------+
//| Check API for new signals                                        |
//+------------------------------------------------------------------+
void CheckForSignals()
  {
   char postData[];
   char result[];
   string headers = "Content-Type: text/plain\r\n";
   int timeout = 2000;
   
   ResetLastError();
   // Requires "Allow WebRequest" in Tools -> Options -> Expert Advisors
   int res = WebRequest("GET", API_URL, headers, timeout, postData, result, headers);
   
   if(res == 200) {
      string response = CharArrayToString(result);
      if(StringLen(response) > 0) {
         ProcessResponse(response);
      }
   }
   else {
       int err = GetLastError();
       if(err != 0 && err != 4060) Print("Network Error: ", err);
   }
  }

void ProcessResponse(string csv)
{
   string signals[];
   int count = SplitString(csv, ';', signals);
   
   for(int i=0; i<count; i++) {
      string parts[];
      if(SplitString(signals[i], ',', parts) >= 7) {
         string id = parts[0];
         string rawSymbol = parts[1];
         string type = parts[2];
         double entry = StringToDouble(parts[3]);
         double sl = StringToDouble(parts[4]);
         double tp = StringToDouble(parts[5]);
         double conf = StringToDouble(parts[6]);
         
         if(!IsProcessed(id)) {
            Print("New Signal Detected: ", rawSymbol, " ", type);
            ExecuteTrade(id, rawSymbol, type, entry, sl, tp);
            MarkProcessed(id);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Custom String Split                                              |
//+------------------------------------------------------------------+
int SplitString(string text, int pSep, string &arr[])
{
   int c = 0;
   int size = StringLen(text);
   int last = 0;
   
   // First pass: count parts
   for(int i=0; i<size; i++) {
      if(StringGetCharacter(text, i) == pSep) c++;
   }
   c++;
   ArrayResize(arr, c);
   
   c = 0;
   for(int i=0; i<size; i++) {
      if(StringGetCharacter(text, i) == pSep) {
         arr[c] = StringSubstr(text, last, i-last);
         last = i+1;
         c++;
      }
   }
   arr[c] = StringSubstr(text, last);
   return c+1;
}

//+------------------------------------------------------------------+
//| Execute the trade                                                |
//+------------------------------------------------------------------+
void ExecuteTrade(string id, string rawSymbol, string type, double entry, double sl, double tp)
{
   string symbol = SymbolPrefix + CleanSymbol(rawSymbol) + SymbolSuffix;
   
   // Need to select symbol to get info
   if(!SymbolSelect(symbol, true)) {
      Print("Error: Symbol ", symbol, " not found.");
      return;
   }
   
   double volume = (FixedLot > 0) ? FixedLot : CalculateLotSize(symbol, sl, RiskPercent);
   volume = NormalizeVolume(symbol, volume);
   
   int cmd = -1;
   double price = 0;
   color arrow = clrNONE;
   
   if(type == "BUY") {
      cmd = OP_KEY_BUY;
      price = SymbolInfoDouble(symbol, SYMBOL_ASK);
      arrow = clrBlue;
   }
   else if(type == "SELL") {
      cmd = OP_SELL;
      price = SymbolInfoDouble(symbol, SYMBOL_BID);
      arrow = clrRed;
   }
   
   if(cmd != -1) {
      int ticket = OrderSend(symbol, cmd, volume, price, Slippage, sl, tp, "BrainAI: " + id, MagicNumber, 0, arrow);
      if(ticket > 0) Print("Trade Opened: ", ticket);
      else Print("OrderSend Error: ", GetLastError());
   }
}

//+------------------------------------------------------------------+
//| Utility Functions                                                |
//+------------------------------------------------------------------+
string CleanSymbol(string s) {
   string out = "";
   for(int i=0; i<StringLen(s); i++) {
       ushort c = StringGetCharacter(s, i);
       if(c != '-' && c != '/') out += StringCharToString(c);
   }
   return out;
}

double CalculateLotSize(string pSymbol, double sl, double risk)
{
   // Basic approximation for MT4
   double balance = AccountBalance();
   double riskMoney = balance * (risk / 100.0);
   // Default to 0.01 if calculation hard
   return 0.01; 
}

double NormalizeVolume(string pSymbol, double vol)
{
   double min = MarketInfo(pSymbol, MODE_MINLOT);
   double max = MarketInfo(pSymbol, MODE_MAXLOT);
   double step = MarketInfo(pSymbol, MODE_LOTSTEP);
   
   vol = MathFloor(vol / step) * step;
   
   if(vol < min) vol = min;
   if(vol > max) vol = max;
   
   return vol;
}
