//+------------------------------------------------------------------+
//|                                              BrainAI_Bridge.mq5  |
//|                        Brain Link Tracker AI Integration Bridge  |
//|                                  https://brain-ai-trader.com     |
//+------------------------------------------------------------------+
#property copyright "Brain AI Trader"
#property link      "https://brain-ai-trader.com"
#property version   "2.00"
#property strict

#include <Trade\Trade.mqh>
#include <Arrays\ArrayString.mqh>

CTrade trade;

// --- Inputs ---
input string   API_URL = "http://localhost:3000/api/ea/signals?format=csv"; // Endpoint
input string   SymbolPrefix = ""; // e.g., "m." for "m.EURUSD"
input string   SymbolSuffix = ""; // e.g., ".pro"
input double   RiskPercent = 1.0; // Risk per trade %
input double   FixedLot = 0.0;    // If > 0, use this instead of %
input int      PollInterval = 5;  // Seconds
input int      MagicNumber = 8888;
input int      Slippage = 10;
input bool     UseLocalTime = true;

// --- Globals ---
string ProcessedIDs[]; // Cache of processed Signal IDs to avoid duplicates

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints(Slippage);
   
   // Allow WebRequest check
   if(!TerminalInfoInteger(TERMINAL_DLLS_ALLOWED) && MQLInfoInteger(MQL_DLLS_ALLOWED)) {
       // Just a warning, we mostly need WebRequest permission in Options
   }
   
   Print("BrainAI Bridge PRO Initialized. Polling every ", PollInterval, " seconds.");
   
   EventSetTimer(PollInterval);
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
   ArrayFree(ProcessedIDs);
  }

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
  {
   CheckForSignals();
  }

//+------------------------------------------------------------------+
//| Helper: Check if ID is processed                                 |
//+------------------------------------------------------------------+
bool IsProcessed(string id)
{
   for(int i=0; i<ArraySize(ProcessedIDs); i++) {
      if(ProcessedIDs[i] == id) return true;
   }
   return false;
}

//+------------------------------------------------------------------+
//| Helper: Mark ID as processed                                     |
//+------------------------------------------------------------------+
void MarkProcessed(string id)
{
   int size = ArraySize(ProcessedIDs);
   ArrayResize(ProcessedIDs, size+1);
   ProcessedIDs[size] = id;
   
   // Keep cache size manageable (last 50 signals)
   if(size > 50) {
      ArrayRemove(ProcessedIDs, 0, 1);
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
   string url = API_URL;
   
   ResetLastError();
   int res = WebRequest("GET", url, headers, 2000, postData, result, headers);
   
   if(res == 200) {
      string response = CharArrayToString(result);
      if(StringLen(response) > 0) {
         ProcessResponse(response);
      }
   }
   else {
      // 4061 = Send Mail Failed, 5200+ = Web request errors
      int err = GetLastError();
      if(err != 0) Print("Network Error: ", err);
   }
  }

//+------------------------------------------------------------------+
//| Parse CSV Response: ID,SYMBOL,TYPE,ENTRY,SL,TP,CONFIDENCE        |
//+------------------------------------------------------------------+
void ProcessResponse(string csv)
{
   string signals[];
   int count = StringSplit(csv, ';', signals);
   
   for(int i=0; i<count; i++) {
      string parts[];
      if(StringSplit(signals[i], ',', parts) >= 7) {
         string id = parts[0];
         string symbol = parts[1];
         string type = parts[2];
         double entry = StringToDouble(parts[3]);
         double sl = StringToDouble(parts[4]);
         double tp = StringToDouble(parts[5]);
         double conf = StringToDouble(parts[6]);
         
         if(!IsProcessed(id)) {
            Print("New Signal Detected: ", symbol, " ", type);
            ExecuteTrade(id, symbol, type, entry, sl, tp);
            MarkProcessed(id);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Execute the trade                                                |
//+------------------------------------------------------------------+
void ExecuteTrade(string id, string rawSymbol, string type, double entry, double sl, double tp)
{
   string symbol = SymbolPrefix + CleanSymbol(rawSymbol) + SymbolSuffix;
   
   if(!SymbolSelect(symbol, true)) {
      Print("Error: Symbol ", symbol, " not found in Market Watch.");
      return;
   }
   
   // Recalculate Volume
   double volume = (FixedLot > 0) ? FixedLot : CalculateLotSize(symbol, sl, RiskPercent);
   volume = NormalizeVolume(symbol, volume);
   
   if(volume <= 0) {
      Print("Error: Calculated volume is invalid.");
      return;
   }
   
   bool res = false;
   if(type == "BUY") {
      res = trade.Buy(volume, symbol, 0, sl, tp, "BrainAI: " + id);
   }
   else if(type == "SELL") {
      res = trade.Sell(volume, symbol, 0, sl, tp, "BrainAI: " + id);
   }
   
   if(res) {
      Print("Trade Executed Successfully: ", symbol);
   } else {
      Print("Trade Failed: ", trade.ResultRetcode(), " Desc: ", trade.ResultRetcodeDescription());
   }
}

//+------------------------------------------------------------------+
//| Utility Functions                                                |
//+------------------------------------------------------------------+
string CleanSymbol(string s) {
   // Map common variations if needed (e.g. BTC-USD -> BTCUSD)
   StringReplace(s, "-", "");
   StringReplace(s, "/", "");
   return s;
}

double CalculateLotSize(string pSymbol, double sl, double risk)
{
   double tickValue = SymbolInfoDouble(pSymbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSize = SymbolInfoDouble(pSymbol, SYMBOL_TRADE_TICK_SIZE);
   double accountBalance = AccountInfoDouble(ACCOUNT_BALANCE);
   
   if(sl == 0 || tickSize == 0 || tickValue == 0) return 0.01;
   
   double currentPrice = SymbolInfoDouble(pSymbol, SYMBOL_BID);
   double lossPoints = MathAbs(currentPrice - sl) / tickSize;
   double lossMoney = lossPoints * tickValue;
   
   double riskMoney = accountBalance * (risk / 100.0);
   
   if(lossMoney == 0) return 0.01;
   
   return riskMoney / lossMoney;
}

double NormalizeVolume(string pSymbol, double vol)
{
   double min = SymbolInfoDouble(pSymbol, SYMBOL_VOLUME_MIN);
   double max = SymbolInfoDouble(pSymbol, SYMBOL_VOLUME_MAX);
   double step = SymbolInfoDouble(pSymbol, SYMBOL_VOLUME_STEP);
   
   vol = MathFloor(vol / step) * step;
   
   if(vol < min) vol = min;
   if(vol > max) vol = max;
   
   return vol;
}
//+------------------------------------------------------------------+
