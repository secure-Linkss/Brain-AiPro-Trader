//+------------------------------------------------------------------+
//|                                    Brain_AiPro_Connector.mq4      |
//|                        Copyright 2025, Brain AiPro Trader         |
//|                                      https://brainaipro.com       |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, Brain AiPro Trader"
#property link      "https://brainaipro.com"
#property version   "1.00"
#property strict

// Input Parameters
input string API_KEY = "";  // Your API Key from Dashboard
input string WEBHOOK_URL = "https://yourdomain.com/api/mt4";  // Your Platform URL
input int HEARTBEAT_INTERVAL = 10;  // Heartbeat interval in seconds
input int POLL_INTERVAL = 5;  // Poll instructions interval in seconds
input bool ENABLE_LOGS = true;  // Enable console logging

// Global Variables
datetime lastHeartbeat = 0;
datetime lastPoll = 0;
datetime lastAccountUpdate = 0;
int accountUpdateInterval = 30;  // Update account every 30 seconds
string connectionStatus = "Disconnected";

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit()
{
   // Validate inputs
   if(StringLen(API_KEY) == 0)
   {
      Alert("ERROR: API Key is required! Please enter your API key in EA settings.");
      return(INIT_FAILED);
   }
   
   if(StringFind(WEBHOOK_URL, "yourdomain.com") >= 0)
   {
      Alert("ERROR: Please update WEBHOOK_URL with your actual platform URL!");
      return(INIT_FAILED);
   }
   
   // Check WebRequest permissions
   if(!TerminalInfoInteger(TERMINAL_DLLS_ALLOWED))
   {
      Alert("ERROR: DLL imports must be allowed! Enable in Tools > Options > Expert Advisors");
      return(INIT_FAILED);
   }
   
   Log("Brain AiPro Connector initialized");
   Log("API Key: " + StringSubstr(API_KEY, 0, 10) + "...");
   Log("Webhook URL: " + WEBHOOK_URL);
   
   // Send initial heartbeat
   SendHeartbeat();
   
   connectionStatus = "Connected";
   Comment("Brain AiPro Connector\nStatus: " + connectionStatus + "\nAPI Key: " + StringSubstr(API_KEY, 0, 15) + "...");
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   connectionStatus = "Disconnected";
   Comment("");
   Log("Brain AiPro Connector stopped. Reason: " + IntegerToString(reason));
}

//+------------------------------------------------------------------+
//| Expert tick function                                               |
//+------------------------------------------------------------------+
void OnTick()
{
   // Send heartbeat
   if(TimeCurrent() - lastHeartbeat >= HEARTBEAT_INTERVAL)
   {
      SendHeartbeat();
      lastHeartbeat = TimeCurrent();
   }
   
   // Send account update
   if(TimeCurrent() - lastAccountUpdate >= accountUpdateInterval)
   {
      SendAccountUpdate();
      lastAccountUpdate = TimeCurrent();
   }
   
   // Poll for instructions
   if(TimeCurrent() - lastPoll >= POLL_INTERVAL)
   {
      PollInstructions();
      lastPoll = TimeCurrent();
   }
   
   // Monitor open trades
   MonitorTrades();
   
   // Update comment
   Comment("Brain AiPro Connector\n" +
           "Status: " + connectionStatus + "\n" +
           "Balance: $" + DoubleToString(AccountBalance(), 2) + "\n" +
           "Equity: $" + DoubleToString(AccountEquity(), 2) + "\n" +
           "Open Trades: " + IntegerToString(OrdersTotal()));
}

//+------------------------------------------------------------------+
//| Send Heartbeat                                                     |
//+------------------------------------------------------------------+
void SendHeartbeat()
{
   string url = WEBHOOK_URL + "/webhook/heartbeat";
   string headers = "Content-Type: application/json\r\n";
   
   string json = "{";
   json += "\"api_key\":\"" + API_KEY + "\",";
   json += "\"account_id\":" + IntegerToString(AccountNumber()) + ",";
   json += "\"platform\":\"MT4\",";
   json += "\"timestamp\":\"" + TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS) + "\",";
   json += "\"ea_version\":\"1.00\",";
   json += "\"status\":\"online\"";
   json += "}";
   
   char post[], result[];
   StringToCharArray(json, post, 0, StringLen(json));
   
   int res = WebRequest("POST", url, headers, 5000, post, result, headers);
   
   if(res == 200)
   {
      connectionStatus = "Connected";
   }
   else
   {
      connectionStatus = "Error " + IntegerToString(res);
      Log("Heartbeat failed: " + IntegerToString(res));
   }
}

//+------------------------------------------------------------------+
//| Send Account Update                                                |
//+------------------------------------------------------------------+
void SendAccountUpdate()
{
   string url = WEBHOOK_URL + "/webhook/account-update";
   string headers = "Content-Type: application/json\r\n";
   
   string json = "{";
   json += "\"api_key\":\"" + API_KEY + "\",";
   json += "\"account_currency\":\"" + AccountCurrency() + "\",";
   json += "\"balance\":" + DoubleToString(AccountBalance(), 2) + ",";
   json += "\"equity\":" + DoubleToString(AccountEquity(), 2) + ",";
   json += "\"leverage\":" + IntegerToString(AccountLeverage()) + ",";
   json += "\"free_margin\":" + DoubleToString(AccountFreeMargin(), 2) + ",";
   json += "\"margin_level\":" + DoubleToString(AccountEquity() / AccountMargin() * 100, 2);
   json += "}";
   
   char post[], result[];
   StringToCharArray(json, post, 0, StringLen(json));
   
   WebRequest("POST", url, headers, 5000, post, result, headers);
}

//+------------------------------------------------------------------+
//| Monitor Trades and Send Updates                                    |
//+------------------------------------------------------------------+
void MonitorTrades()
{
   for(int i = 0; i < OrdersTotal(); i++)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         SendTradeUpdate(OrderTicket());
      }
   }
}

//+------------------------------------------------------------------+
//| Send Trade Update                                                  |
//+------------------------------------------------------------------+
void SendTradeUpdate(int ticket)
{
   if(!OrderSelect(ticket, SELECT_BY_TICKET))
      return;
   
   string url = WEBHOOK_URL + "/webhook/trade-update";
   string headers = "Content-Type: application/json\r\n";
   
   string type = (OrderType() == OP_BUY) ? "buy" : "sell";
   string status = "open";
   
   string json = "{";
   json += "\"api_key\":\"" + API_KEY + "\",";
   json += "\"ticket\":" + IntegerToString(OrderTicket()) + ",";
   json += "\"symbol\":\"" + OrderSymbol() + "\",";
   json += "\"type\":\"" + type + "\",";
   json += "\"lots\":" + DoubleToString(OrderLots(), 2) + ",";
   json += "\"entry_price\":" + DoubleToString(OrderOpenPrice(), 5) + ",";
   json += "\"current_price\":" + DoubleToString(OrderClosePrice(), 5) + ",";
   json += "\"stop_loss\":" + DoubleToString(OrderStopLoss(), 5) + ",";
   json += "\"take_profit\":" + DoubleToString(OrderTakeProfit(), 5) + ",";
   json += "\"profit\":" + DoubleToString(OrderProfit() + OrderSwap() + OrderCommission(), 2) + ",";
   json += "\"status\":\"" + status + "\"";
   json += "}";
   
   char post[], result[];
   StringToCharArray(json, post, 0, StringLen(json));
   
   WebRequest("POST", url, headers, 5000, post, result, headers);
}

//+------------------------------------------------------------------+
//| Poll for Instructions                                              |
//+------------------------------------------------------------------+
void PollInstructions()
{
   string url = WEBHOOK_URL + "/poll/instructions?api_key=" + API_KEY;
   string headers = "";
   char result[];
   string resultHeaders;
   
   int res = WebRequest("GET", url, headers, 5000, NULL, result, resultHeaders);
   
   if(res == 200)
   {
      string response = CharArrayToString(result);
      ProcessInstruction(response);
   }
}

//+------------------------------------------------------------------+
//| Process Instruction from Server                                    |
//+------------------------------------------------------------------+
void ProcessInstruction(string json)
{
   // Parse JSON (simple parsing for demonstration)
   if(StringFind(json, "\"action\":\"none\"") >= 0)
   {
      return;  // No action needed
   }
   
   if(StringFind(json, "\"action\":\"open\"") >= 0)
   {
      ExecuteOpenTrade(json);
   }
   else if(StringFind(json, "\"action\":\"close\"") >= 0)
   {
      ExecuteCloseTrade(json);
   }
   else if(StringFind(json, "\"action\":\"modify\"") >= 0)
   {
      ExecuteModifyTrade(json);
   }
   else if(StringFind(json, "\"action\":\"breakeven\"") >= 0)
   {
      ExecuteBreakeven(json);
   }
   else if(StringFind(json, "\"action\":\"trail\"") >= 0)
   {
      ExecuteTrail(json);
   }
}

//+------------------------------------------------------------------+
//| Execute Open Trade                                                 |
//+------------------------------------------------------------------+
void ExecuteOpenTrade(string json)
{
   // Parse values from JSON
   string symbol = ExtractString(json, "\"symbol\":\"", "\"");
   string type = ExtractString(json, "\"type\":\"", "\"");
   double lot = StringToDouble(ExtractString(json, "\"lot\":", ","));
   double sl = StringToDouble(ExtractString(json, "\"stop_loss\":", ","));
   double tp = StringToDouble(ExtractString(json, "\"take_profit\":", ","));
   
   int cmd = (type == "buy") ? OP_BUY : OP_SELL;
   double price = (cmd == OP_BUY) ? Ask : Bid;
   
   int ticket = OrderSend(symbol, cmd, lot, price, 3, sl, tp, "Brain AiPro", 0, 0, clrGreen);
   
   if(ticket > 0)
   {
      Log("Trade opened: #" + IntegerToString(ticket));
   }
   else
   {
      SendError("OrderSend failed: " + IntegerToString(GetLastError()), ticket);
   }
}

//+------------------------------------------------------------------+
//| Execute Close Trade                                                |
//+------------------------------------------------------------------+
void ExecuteCloseTrade(string json)
{
   int ticket = StringToInteger(ExtractString(json, "\"ticket\":", ","));
   
   if(OrderSelect(ticket, SELECT_BY_TICKET))
   {
      double price = (OrderType() == OP_BUY) ? Bid : Ask;
      bool closed = OrderClose(ticket, OrderLots(), price, 3, clrRed);
      
      if(closed)
      {
         Log("Trade closed: #" + IntegerToString(ticket));
      }
      else
      {
         SendError("OrderClose failed: " + IntegerToString(GetLastError()), ticket);
      }
   }
}

//+------------------------------------------------------------------+
//| Execute Modify Trade                                               |
//+------------------------------------------------------------------+
void ExecuteModifyTrade(string json)
{
   int ticket = StringToInteger(ExtractString(json, "\"ticket\":", ","));
   double sl = StringToDouble(ExtractString(json, "\"stop_loss\":", ","));
   double tp = StringToDouble(ExtractString(json, "\"take_profit\":", "}"));
   
   if(OrderSelect(ticket, SELECT_BY_TICKET))
   {
      bool modified = OrderModify(ticket, OrderOpenPrice(), sl, tp, 0, clrBlue);
      
      if(modified)
      {
         Log("Trade modified: #" + IntegerToString(ticket));
      }
      else
      {
         SendError("OrderModify failed: " + IntegerToString(GetLastError()), ticket);
      }
   }
}

//+------------------------------------------------------------------+
//| Execute Breakeven                                                  |
//+------------------------------------------------------------------+
void ExecuteBreakeven(string json)
{
   int ticket = StringToInteger(ExtractString(json, "\"ticket\":", ","));
   double sl = StringToDouble(ExtractString(json, "\"stop_loss\":", "}"));
   
   if(OrderSelect(ticket, SELECT_BY_TICKET))
   {
      bool modified = OrderModify(ticket, OrderOpenPrice(), sl, OrderTakeProfit(), 0, clrGreen);
      
      if(modified)
      {
         Log("Breakeven set: #" + IntegerToString(ticket));
      }
   }
}

//+------------------------------------------------------------------+
//| Execute Trail                                                       |
//+------------------------------------------------------------------+
void ExecuteTrail(string json)
{
   int ticket = StringToInteger(ExtractString(json, "\"ticket\":", ","));
   double sl = StringToDouble(ExtractString(json, "\"stop_loss\":", ","));
   
   if(OrderSelect(ticket, SELECT_BY_TICKET))
   {
      bool modified = OrderModify(ticket, OrderOpenPrice(), sl, OrderTakeProfit(), 0, clrYellow);
      
      if(modified)
      {
         Log("Trailing stop updated: #" + IntegerToString(ticket));
      }
   }
}

//+------------------------------------------------------------------+
//| Send Error to Server                                               |
//+------------------------------------------------------------------+
void SendError(string message, int ticket)
{
   string url = WEBHOOK_URL + "/webhook/error";
   string headers = "Content-Type: application/json\r\n";
   
   string json = "{";
   json += "\"api_key\":\"" + API_KEY + "\",";
   json += "\"error_type\":\"OrderError\",";
   json += "\"message\":\"" + message + "\",";
   json += "\"error_code\":" + IntegerToString(GetLastError()) + ",";
   json += "\"ticket\":" + IntegerToString(ticket) + ",";
   json += "\"timestamp\":\"" + TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS) + "\"";
   json += "}";
   
   char post[], result[];
   StringToCharArray(json, post, 0, StringLen(json));
   
   WebRequest("POST", url, headers, 5000, post, result, headers);
}

//+------------------------------------------------------------------+
//| Extract String from JSON                                           |
//+------------------------------------------------------------------+
string ExtractString(string json, string start, string end)
{
   int startPos = StringFind(json, start);
   if(startPos < 0) return "";
   
   startPos += StringLen(start);
   int endPos = StringFind(json, end, startPos);
   if(endPos < 0) endPos = StringLen(json);
   
   return StringSubstr(json, startPos, endPos - startPos);
}

//+------------------------------------------------------------------+
//| Log Function                                                        |
//+------------------------------------------------------------------+
void Log(string message)
{
   if(ENABLE_LOGS)
   {
      Print("[Brain AiPro] " + message);
   }
}
//+------------------------------------------------------------------+
