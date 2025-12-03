//+------------------------------------------------------------------+
//|                                    Brain_AiPro_Connector.mq5      |
//|                        Copyright 2025, Brain AiPro Trader         |
//|                                      https://brainaipro.com       |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, Brain AiPro Trader"
#property link      "https://brainaipro.com"
#property version   "1.00"

#include <Trade\Trade.mqh>
CTrade trade;

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
int accountUpdateInterval = 30;
string connectionStatus = "Disconnected";

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit()
{
   if(StringLen(API_KEY) == 0)
   {
      Alert("ERROR: API Key is required!");
      return(INIT_FAILED);
   }
   
   if(StringFind(WEBHOOK_URL, "yourdomain.com") >= 0)
   {
      Alert("ERROR: Please update WEBHOOK_URL!");
      return(INIT_FAILED);
   }
   
   Log("Brain AiPro Connector MT5 initialized");
   SendHeartbeat();
   connectionStatus = "Connected";
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   connectionStatus = "Disconnected";
   Log("Brain AiPro Connector stopped");
}

//+------------------------------------------------------------------+
//| Expert tick function                                               |
//+------------------------------------------------------------------+
void OnTick()
{
   if(TimeCurrent() - lastHeartbeat >= HEARTBEAT_INTERVAL)
   {
      SendHeartbeat();
      lastHeartbeat = TimeCurrent();
   }
   
   if(TimeCurrent() - lastAccountUpdate >= accountUpdateInterval)
   {
      SendAccountUpdate();
      lastAccountUpdate = TimeCurrent();
   }
   
   if(TimeCurrent() - lastPoll >= POLL_INTERVAL)
   {
      PollInstructions();
      lastPoll = TimeCurrent();
   }
   
   MonitorTrades();
   
   Comment("Brain AiPro Connector MT5\n" +
           "Status: " + connectionStatus + "\n" +
           "Balance: $" + DoubleToString(AccountInfoDouble(ACCOUNT_BALANCE), 2) + "\n" +
           "Equity: $" + DoubleToString(AccountInfoDouble(ACCOUNT_EQUITY), 2) + "\n" +
           "Open Positions: " + IntegerToString(PositionsTotal()));
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
   json += "\"account_id\":" + IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN)) + ",";
   json += "\"platform\":\"MT5\",";
   json += "\"timestamp\":\"" + TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS) + "\",";
   json += "\"ea_version\":\"1.00\",";
   json += "\"status\":\"online\"";
   json += "}";
   
   char post[], result[];
   StringToCharArray(json, post, 0, StringLen(json));
   
   int res = WebRequest("POST", url, headers, 5000, post, result, headers);
   
   connectionStatus = (res == 200) ? "Connected" : "Error " + IntegerToString(res);
}

//+------------------------------------------------------------------+
//| Send Account Update                                                |
//+------------------------------------------------------------------+
void SendAccountUpdate()
{
   string url = WEBHOOK_URL + "/webhook/account-update";
   string headers = "Content-Type: application/json\r\n";
   
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   double margin = AccountInfoDouble(ACCOUNT_MARGIN);
   double marginLevel = (margin > 0) ? (equity / margin * 100) : 0;
   
   string json = "{";
   json += "\"api_key\":\"" + API_KEY + "\",";
   json += "\"account_currency\":\"" + AccountInfoString(ACCOUNT_CURRENCY) + "\",";
   json += "\"balance\":" + DoubleToString(balance, 2) + ",";
   json += "\"equity\":" + DoubleToString(equity, 2) + ",";
   json += "\"leverage\":" + IntegerToString(AccountInfoInteger(ACCOUNT_LEVERAGE)) + ",";
   json += "\"free_margin\":" + DoubleToString(freeMargin, 2) + ",";
   json += "\"margin_level\":" + DoubleToString(marginLevel, 2);
   json += "}";
   
   char post[], result[];
   StringToCharArray(json, post, 0, StringLen(json));
   
   WebRequest("POST", url, headers, 5000, post, result, headers);
}

//+------------------------------------------------------------------+
//| Monitor Trades                                                     |
//+------------------------------------------------------------------+
void MonitorTrades()
{
   for(int i = 0; i < PositionsTotal(); i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket > 0)
      {
         SendTradeUpdate(ticket);
      }
   }
}

//+------------------------------------------------------------------+
//| Send Trade Update                                                  |
//+------------------------------------------------------------------+
void SendTradeUpdate(ulong ticket)
{
   if(!PositionSelectByTicket(ticket))
      return;
   
   string url = WEBHOOK_URL + "/webhook/trade-update";
   string headers = "Content-Type: application/json\r\n";
   
   string symbol = PositionGetString(POSITION_SYMBOL);
   long posType = PositionGetInteger(POSITION_TYPE);
   string type = (posType == POSITION_TYPE_BUY) ? "buy" : "sell";
   double lots = PositionGetDouble(POSITION_VOLUME);
   double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
   double currentPrice = PositionGetDouble(POSITION_PRICE_CURRENT);
   double sl = PositionGetDouble(POSITION_SL);
   double tp = PositionGetDouble(POSITION_TP);
   double profit = PositionGetDouble(POSITION_PROFIT) + PositionGetDouble(POSITION_SWAP);
   
   string json = "{";
   json += "\"api_key\":\"" + API_KEY + "\",";
   json += "\"ticket\":" + IntegerToString(ticket) + ",";
   json += "\"symbol\":\"" + symbol + "\",";
   json += "\"type\":\"" + type + "\",";
   json += "\"lots\":" + DoubleToString(lots, 2) + ",";
   json += "\"entry_price\":" + DoubleToString(openPrice, 5) + ",";
   json += "\"current_price\":" + DoubleToString(currentPrice, 5) + ",";
   json += "\"stop_loss\":" + DoubleToString(sl, 5) + ",";
   json += "\"take_profit\":" + DoubleToString(tp, 5) + ",";
   json += "\"profit\":" + DoubleToString(profit, 2) + ",";
   json += "\"status\":\"open\"";
   json += "}";
   
   char post[], result[];
   StringToCharArray(json, post, 0, StringLen(json));
   
   WebRequest("POST", url, headers, 5000, post, result, headers);
}

//+------------------------------------------------------------------+
//| Poll Instructions                                                  |
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
//| Process Instruction                                                |
//+------------------------------------------------------------------+
void ProcessInstruction(string json)
{
   if(StringFind(json, "\"action\":\"none\"") >= 0)
      return;
   
   if(StringFind(json, "\"action\":\"open\"") >= 0)
      ExecuteOpenTrade(json);
   else if(StringFind(json, "\"action\":\"close\"") >= 0)
      ExecuteCloseTrade(json);
   else if(StringFind(json, "\"action\":\"modify\"") >= 0)
      ExecuteModifyTrade(json);
   else if(StringFind(json, "\"action\":\"breakeven\"") >= 0)
      ExecuteBreakeven(json);
   else if(StringFind(json, "\"action\":\"trail\"") >= 0)
      ExecuteTrail(json);
}

//+------------------------------------------------------------------+
//| Execute Open Trade                                                 |
//+------------------------------------------------------------------+
void ExecuteOpenTrade(string json)
{
   string symbol = ExtractString(json, "\"symbol\":\"", "\"");
   string type = ExtractString(json, "\"type\":\"", "\"");
   double lot = StringToDouble(ExtractString(json, "\"lot\":", ","));
   double sl = StringToDouble(ExtractString(json, "\"stop_loss\":", ","));
   double tp = StringToDouble(ExtractString(json, "\"take_profit\":", ","));
   
   ENUM_ORDER_TYPE orderType = (type == "buy") ? ORDER_TYPE_BUY : ORDER_TYPE_SELL;
   
   if(trade.PositionOpen(symbol, orderType, lot, 0, sl, tp, "Brain AiPro"))
   {
      Log("Trade opened: #" + IntegerToString(trade.ResultOrder()));
   }
   else
   {
      SendError("PositionOpen failed: " + IntegerToString(GetLastError()), 0);
   }
}

//+------------------------------------------------------------------+
//| Execute Close Trade                                                |
//+------------------------------------------------------------------+
void ExecuteCloseTrade(string json)
{
   ulong ticket = StringToInteger(ExtractString(json, "\"ticket\":", ","));
   
   if(trade.PositionClose(ticket))
   {
      Log("Trade closed: #" + IntegerToString(ticket));
   }
   else
   {
      SendError("PositionClose failed: " + IntegerToString(GetLastError()), ticket);
   }
}

//+------------------------------------------------------------------+
//| Execute Modify Trade                                               |
//+------------------------------------------------------------------+
void ExecuteModifyTrade(string json)
{
   ulong ticket = StringToInteger(ExtractString(json, "\"ticket\":", ","));
   double sl = StringToDouble(ExtractString(json, "\"stop_loss\":", ","));
   double tp = StringToDouble(ExtractString(json, "\"take_profit\":", "}"));
   
   if(trade.PositionModify(ticket, sl, tp))
   {
      Log("Trade modified: #" + IntegerToString(ticket));
   }
   else
   {
      SendError("PositionModify failed: " + IntegerToString(GetLastError()), ticket);
   }
}

//+------------------------------------------------------------------+
//| Execute Breakeven                                                  |
//+------------------------------------------------------------------+
void ExecuteBreakeven(string json)
{
   ulong ticket = StringToInteger(ExtractString(json, "\"ticket\":", ","));
   double sl = StringToDouble(ExtractString(json, "\"stop_loss\":", "}"));
   
   if(PositionSelectByTicket(ticket))
   {
      double tp = PositionGetDouble(POSITION_TP);
      trade.PositionModify(ticket, sl, tp);
      Log("Breakeven set: #" + IntegerToString(ticket));
   }
}

//+------------------------------------------------------------------+
//| Execute Trail                                                       |
//+------------------------------------------------------------------+
void ExecuteTrail(string json)
{
   ulong ticket = StringToInteger(ExtractString(json, "\"ticket\":", ","));
   double sl = StringToDouble(ExtractString(json, "\"stop_loss\":", ","));
   
   if(PositionSelectByTicket(ticket))
   {
      double tp = PositionGetDouble(POSITION_TP);
      trade.PositionModify(ticket, sl, tp);
      Log("Trailing stop updated: #" + IntegerToString(ticket));
   }
}

//+------------------------------------------------------------------+
//| Send Error                                                          |
//+------------------------------------------------------------------+
void SendError(string message, ulong ticket)
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
      Print("[Brain AiPro MT5] " + message);
}
//+------------------------------------------------------------------+
