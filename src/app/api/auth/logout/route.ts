import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    try {
        // Clear session cookie
        cookies().delete('session')
        cookies().delete('next-auth.session-token')

        return NextResponse.json({ success: true, message: 'Logged out successfully' })
    } catch (error) {
        return NextResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
        )
    }
}
