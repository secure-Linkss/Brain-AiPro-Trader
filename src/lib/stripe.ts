import Stripe from 'stripe'

// Initialize Stripe only if API key is available
export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-11-17.clover',
        typescript: true,
    })
    : null

export const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.warn('STRIPE_SECRET_KEY is missing. Payment features will not work.')
        return null
    }
    return stripe
}
