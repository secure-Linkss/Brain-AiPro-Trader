import { prisma } from '@/lib/prisma'

export class TelegramService {
    private botToken: string
    private botUsername: string

    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN || ''
        this.botUsername = process.env.TELEGRAM_BOT_USERNAME || ''
    }

    /**
     * Handle incoming webhook updates from Telegram
     */
    async handleUpdate(update: any) {
        if (!update.message) return

        const chatId = update.message.chat.id.toString()
        const text = update.message.text

        if (text === '/start') {
            await this.sendWelcomeMessage(chatId)
        } else if (text.startsWith('/verify')) {
            await this.handleVerification(chatId, text)
        } else {
            await this.sendMessage(chatId, "I don't understand that command. Try /start or /verify <code>")
        }
    }

    /**
     * Send a message to a specific chat
     */
    async sendMessage(chatId: string, text: string) {
        if (!this.botToken) return

        try {
            await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML'
                })
            })
        } catch (error) {
            console.error('Failed to send Telegram message:', error)
        }
    }

    /**
     * Send welcome message with instructions
     */
    private async sendWelcomeMessage(chatId: string) {
        const message = `
<b>Welcome to Brain AiPro Trader Bot!</b> 🤖

To receive trading signals and alerts, you need to link your Telegram account to your Brain AiPro profile.

<b>How to link:</b>
1. Go to your Dashboard > Settings > Notifications
2. Click "Connect Telegram"
3. You will get a verification code
4. Send that code here like this:
<code>/verify YOUR_CODE</code>
        `
        await this.sendMessage(chatId, message)
    }

    /**
     * Handle verification command
     */
    private async handleVerification(chatId: string, text: string) {
        const code = text.split(' ')[1]

        if (!code) {
            await this.sendMessage(chatId, "Please provide the verification code. Example: <code>/verify 123456</code>")
            return
        }

        // Store the verification attempt in the database
        // The frontend will poll for this or the user will click "Verify" on frontend which checks this
        // For this flow, we'll store a temporary token that the frontend can validate

        try {
            // Create a verification token that the frontend can claim
            // We use the chatId as the identifier and the code as the token
            // This is a reverse flow: User gets code from Frontend -> Sends to Bot -> Bot confirms?
            // Actually, better flow: User gets code from Frontend -> Sends to Bot -> Bot calls API to verify?
            // OR: User sends /start -> Bot gives ChatID -> User enters ChatID on Frontend?

            // Let's stick to the flow implemented in the API:
            // Frontend generates code -> User sends code to Bot -> Bot stores mapping -> Frontend confirms

            // Wait, the API `POST /api/user/telegram` expects `verificationCode`.
            // And it looks for a token in `verificationToken` table.

            // So the flow is:
            // 1. Frontend generates a random code and shows it to user.
            // 2. Frontend saves this code in `verificationToken` with `identifier` = userId (or session ID).
            // 3. User sends code to Bot.
            // 4. Bot looks up token, gets userId, and creates `TelegramConfig`.

            // BUT, the API implementation I just wrote does:
            // 1. Frontend sends code to API.
            // 2. API looks for token where `token` = code.
            // 3. API gets `identifier` (which is chatId) from token.

            // So the flow implies:
            // 1. User sends /start to Bot.
            // 2. Bot generates a code and sends to User.
            // 3. Bot saves code + chatId in `verificationToken`.
            // 4. User enters code on Frontend.

            // Let's implement THIS flow as it's more secure (user proves ownership of Telegram account).

            // Generate 6-digit code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

            // Save to DB
            // We use chatId as identifier
            await prisma.verificationToken.create({
                data: {
                    identifier: chatId,
                    token: verificationCode,
                    expires: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
                }
            })

            await this.sendMessage(chatId, `Your verification code is: <code>${verificationCode}</code>\n\nEnter this code on the Brain AiPro dashboard to link your account.`)

        } catch (error) {
            console.error('Verification error:', error)
            await this.sendMessage(chatId, "An error occurred during verification. Please try again.")
        }
    }

    /**
     * Send a signal alert to a user
     */
    async sendSignalAlert(userId: string, signal: any) {
        const config = await prisma.telegramConfig.findUnique({
            where: { userId }
        })

        if (!config || !config.isActive || !config.chatId) return

        const emoji = signal.type === 'BUY' ? '🟢' : '🔴'
        const message = `
${emoji} <b>NEW SIGNAL: ${signal.symbol}</b>

<b>Type:</b> ${signal.type}
<b>Entry:</b> ${signal.entryPrice}
<b>TP1:</b> ${signal.takeProfit1}
<b>TP2:</b> ${signal.takeProfit2}
<b>SL:</b> ${signal.stopLoss}

<b>Strategy:</b> ${signal.strategy}
<b>Confidence:</b> ${signal.confidence}%

<a href="${process.env.NEXTAUTH_URL}/dashboard">View Chart</a>
        `

        await this.sendMessage(config.chatId, message)
    }
}

export const telegramService = new TelegramService()
