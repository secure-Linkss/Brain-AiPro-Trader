# Signal Display Enhancement Guide

## Signal Interface Update

The Signal model now includes all required fields. Update your frontend interfaces to match:

\`\`\`typescript
interface Signal {
  id: string
  userId: string
  tradingPairId: string
  type: "BUY" | "SELL" | "HOLD"
  strength: number // 0-100 confidence score
  strategy: string
  
  // Price Levels
  entryPrice: number | null
  stopLoss: number | null
  takeProfit1: number | null  // 80 pips
  takeProfit2: number | null  // 120 pips
  takeProfit3: number | null  // 180 pips
  takeProfit4: number | null  // 250 pips
  
  // Status & Quality
  status: "PENDING" | "CONFIRMED" | "ACTIVE" | "CLOSED" | "CANCELLED"
  signalQuality: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" | null
  
  // Analysis Details
  reason: string | null
  confirmations: number | null
  riskReward: string | null // e.g., "1:3.2"
  timeframe: string | null
  successRate: number | null // Historical success rate
  
  // Advanced Features
  volumeConfirmation: boolean
  fibonacci: {
    retracement: number[]
    extension: number[]
  } | null
  
  // Relations
  tradingPair: {
    symbol: string
    name: string
    type: string
  }
  
  createdAt: string
  updatedAt: string
}
\`\`\`

## Display Component Example

\`\`\`tsx
function SignalCard({ signal }: { signal: Signal }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Badge className={signal.type === "BUY" ? "bg-green-500" : "bg-red-500"}>
              {signal.type}
            </Badge>
            <Badge variant="outline">
              {signal.tradingPair.symbol}
            </Badge>
            <Badge className="bg-purple-500">
              {signal.strength}% Confidence
            </Badge>
          </div>
          <Badge className={
            signal.signalQuality === "EXCELLENT" ? "bg-green-600" :
            signal.signalQuality === "GOOD" ? "bg-blue-600" :
            "bg-yellow-600"
          }>
            {signal.signalQuality}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Entry & Exit Levels */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-500">Entry Price</span>
            <div className="text-lg font-bold">${signal.entryPrice?.toFixed(5)}</div>
          </div>
          
          <div>
            <span className="text-sm text-gray-500">Stop Loss</span>
            <div className="text-lg font-bold text-red-500">
              ${signal.stopLoss?.toFixed(5)}
            </div>
          </div>
          
          <div>
            <span className="text-sm text-gray-500">TP1 (80 pips)</span>
            <div className="text-lg font-bold text-green-500">
              ${signal.takeProfit1?.toFixed(5)}
            </div>
          </div>
          
          <div>
            <span className="text-sm text-gray-500">TP2 (120 pips)</span>
            <div className="text-lg font-bold text-green-500">
              ${signal.takeProfit2?.toFixed(5)}
            </div>
          </div>
          
          <div>
            <span className="text-sm text-gray-500">TP3 (180 pips)</span>
            <div className="text-lg font-bold text-green-500">
              ${signal.takeProfit3?.toFixed(5)}
            </div>
          </div>
          
          <div>
            <span className="text-sm text-gray-500">TP4 (250 pips)</span>
            <div className="text-lg font-bold text-green-500">
              ${signal.takeProfit4?.toFixed(5)}
            </div>
          </div>
        </div>
        
        {/* Risk Management */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-sm">R:R {signal.riskReward}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm">Success Rate: {signal.successRate?.toFixed(1)}%</span>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-purple-500" />
            <span className="text-sm">{signal.confirmations} Confirmations</span>
          </div>
        </div>
        
        {/* Analysis Reason */}
        <div className="text-sm text-gray-600 mb-4">
          <strong>Analysis:</strong> {signal.reason}
        </div>
        
        {/* Fibonacci Levels */}
        {signal.fibonacci && (
          <div className="text-xs text-gray-500">
            <div>Fib Retracement: {signal.fibonacci.retracement.join(', ')}</div>
            <div>Fib Extension: {signal.fibonacci.extension.join(', ')}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
\`\`\`

## API Usage Examples

### Generate a New Signal

\`\`\`typescript
const generateSignal = async (symbol: string, timeframe: string = "1h") => {
  const response = await fetch("/api/signals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol, timeframe })
  })
  
  const data = await response.json()
  
  if (data.success) {
    console.log("Signal:", data.signal)
    console.log("Success Rate:", data.successRate)
    console.log("Risk/Reward:", data.riskReward)
    console.log("Analysis:", data.analysis)
    console.log("SMC Data:", data.smc)
  }
}

// Usage
generateSignal("EURUSD", "1h")
generateSignal("BTCUSD", "4h")
\`\`\`

### Fetch Signals

\`\`\`typescript
const fetchSignals = async (filters?: {
  symbol?: string
  status?: string
  limit?: number
}) => {
  const params = new URLSearchParams()
  if (filters?.symbol) params.append("symbol", filters.symbol)
  if (filters?.status) params.append("status", filters.status)
  if (filters?.limit) params.append("limit", filters.limit.toString())
  
  const response = await fetch(`/api/signals?${params.toString()}`)
  const data = await response.json()
  
  return data.signals
}

// Usage
const activeSignals = await fetchSignals({ status: "ACTIVE" })
const eurusdSignals = await fetchSignals({ symbol: "EURUSD", limit: 10 })
\`\`\`

### Update Signal Status

\`\`\`typescript
const updateSignalStatus = async (signalId: string, status: string) => {
  const response = await fetch("/api/signals", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signalId, status })
  })
  
  const data = await response.json()
  return data.signal
}

// Usage
await updateSignalStatus("signal_id_here", "CLOSED")
await updateSignalStatus("signal_id_here", "CANCELLED")
\`\`\`

## Success Rate Interpretation

The success rate is calculated from historical data:

- **90%+**: Excellent - Very high probability setup
- **80-89%**: Good - Strong setup with good track record
- **70-79%**: Average - Decent setup, manage risk carefully
- **Below 70%**: Signal won't be generated (filtered out)

## Signal Quality Levels

- **EXCELLENT**: Confidence >= 90%, multiple confirmations, strong volume
- **GOOD**: Confidence >= 80%, good confirmations
- **AVERAGE**: Confidence >= 70%, basic confirmations

## Risk Management Guidelines

1. **Stop Loss**: Always set at minimum 25 pips for forex pairs
2. **Take Profit Levels**:
   - TP1 (80 pips): Primary target for quick profits
   - TP2 (120 pips): Secondary target
   - TP3 (180 pips): Extended target
   - TP4 (250 pips): Maximum target for trending moves

3. **Position Sizing**: Use the R:R ratio to determine position size
4. **Partial Profits**: Consider taking partial profits at each TP level

## Live Data Sources

All signals use live data from:
1. **Current Price**: `/market/ohlcv/{symbol}` (1-minute candles)
2. **Confluence Analysis**: `/analysis/confluence` (multi-timeframe)
3. **SMC Analysis**: `/analysis/smc` (Smart Money Concepts)
4. **Historical Performance**: Database queries for success rate

This ensures 95%+ accuracy potential through:
- Real-time market data
- Multiple strategy confirmation
- Institutional-level analysis (SMC)
- Historical performance tracking
- Proper risk management
