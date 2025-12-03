import Link from "next/link"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-slate-800">
                <Link className="font-bold text-xl" href="/">Brain AiPro Trader</Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:text-blue-400" href="/">Home</Link>
                    <Link className="text-sm font-medium hover:text-blue-400" href="/contact">Contact</Link>
                </nav>
            </header>

            <main className="flex-1 py-12 md:py-24 container px-4 md:px-6 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="item-1" className="border-slate-800">
                        <AccordionTrigger className="text-lg font-medium">How accurate are the AI signals?</AccordionTrigger>
                        <AccordionContent className="text-slate-400">
                            Our AI models are trained on historical data and real-time market conditions. While no system is 100% accurate, our multi-agent validation process aims for a high win rate (typically 70-85%). We prioritize quality over quantity.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border-slate-800">
                        <AccordionTrigger className="text-lg font-medium">Do I need trading experience?</AccordionTrigger>
                        <AccordionContent className="text-slate-400">
                            Not necessarily. Our platform is designed to be user-friendly for beginners while offering advanced tools for pros. We provide clear entry, stop-loss, and take-profit levels for every signal.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border-slate-800">
                        <AccordionTrigger className="text-lg font-medium">What markets do you cover?</AccordionTrigger>
                        <AccordionContent className="text-slate-400">
                            We cover major and minor Forex pairs, top Cryptocurrencies (BTC, ETH, SOL, etc.), major Stock Indices (US30, NAS100, SPX500), and Commodities (Gold, Oil).
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4" className="border-slate-800">
                        <AccordionTrigger className="text-lg font-medium">How do I receive alerts?</AccordionTrigger>
                        <AccordionContent className="text-slate-400">
                            You can receive instant alerts via Telegram, Email, or SMS. You can configure your preferences in the dashboard settings.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5" className="border-slate-800">
                        <AccordionTrigger className="text-lg font-medium">Can I cancel my subscription?</AccordionTrigger>
                        <AccordionContent className="text-slate-400">
                            Yes, you can cancel your subscription at any time from your account settings. You will retain access until the end of your billing period.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </main>
        </div>
    )
}
