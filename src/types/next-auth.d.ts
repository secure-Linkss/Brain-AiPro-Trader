import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            stripeCustomerId?: string | null
            subscriptionId?: string | null
            isActive?: boolean
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        role: string
        stripeCustomerId?: string | null
        subscriptionId?: string | null
        isActive?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string
        role: string
        stripeCustomerId?: string | null
        subscriptionId?: string | null
        isActive?: boolean
    }
}
