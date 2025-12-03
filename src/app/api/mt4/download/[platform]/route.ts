import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// GET /api/mt4/download/mt4 or /api/mt4/download/mt5
export async function GET(
    req: Request,
    { params }: { params: { platform: string } }
) {
    try {
        const platform = params.platform.toLowerCase()

        if (platform !== 'mt4' && platform !== 'mt5') {
            return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
        }

        const extension = platform === 'mt4' ? 'ex4' : 'ex5'
        const filename = `Brain_AiPro_Connector.${extension}`
        const filepath = join(process.cwd(), 'public', 'ea', filename)

        try {
            const fileBuffer = readFileSync(filepath)

            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                },
            })
        } catch (error) {
            // If file doesn't exist, return the MQL source code instead
            const mqlExtension = platform === 'mt4' ? 'mq4' : 'mq5'
            const mqlFilename = `Brain_AiPro_Connector.${mqlExtension}`
            const mqlFilepath = join(process.cwd(), 'ea', mqlFilename)

            const mqlBuffer = readFileSync(mqlFilepath)

            return new NextResponse(mqlBuffer, {
                headers: {
                    'Content-Type': 'text/plain',
                    'Content-Disposition': `attachment; filename="${mqlFilename}"`,
                },
            })
        }
    } catch (error) {
        console.error('Download EA error:', error)
        return NextResponse.json({ error: 'EA file not found' }, { status: 404 })
    }
}
