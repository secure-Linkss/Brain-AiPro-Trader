import crypto from 'crypto'
import { env } from '@/lib/env'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32
const ITERATIONS = 100000

function getKey(salt: Buffer): Buffer {
    if (!env.ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY is not defined')
    }
    return crypto.pbkdf2Sync(
        env.ENCRYPTION_KEY,
        salt,
        ITERATIONS,
        KEY_LENGTH,
        'sha512'
    )
}

export function encrypt(text: string): string {
    if (!text) return ''

    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)

    // Derive key from secret and salt
    const key = getKey(salt)

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Get auth tag
    const tag = cipher.getAuthTag()

    // Combine everything: salt + iv + tag + encrypted_data
    // structure: [salt(64)] [iv(16)] [tag(16)] [encrypted(variable)]
    const result = Buffer.concat([
        salt,
        iv,
        tag,
        Buffer.from(encrypted, 'hex')
    ])

    return result.toString('base64')
}

export function decrypt(encryptedText: string): string {
    if (!encryptedText) return ''

    try {
        const buffer = Buffer.from(encryptedText, 'base64')

        // Extract parts
        const salt = buffer.subarray(0, SALT_LENGTH)
        const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
        const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
        const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)

        // Derive key
        const key = getKey(salt)

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
        decipher.setAuthTag(tag)

        // Decrypt
        let decrypted = decipher.update(encrypted)
        decrypted += decipher.final('utf8')

        return decrypted
    } catch (error) {
        console.error('Decryption failed:', error)
        throw new Error('Failed to decrypt data')
    }
}
