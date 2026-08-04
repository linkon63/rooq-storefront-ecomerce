export type LocalizedValue = Record<string, string | undefined> | string | null | undefined

export const getLocalizedText = (value?: LocalizedValue) => {
    if (!value) return undefined
    if (typeof value === 'string') return value
    if (value.en) return value.en
    const values = Object.values(value).filter(
        (text): text is string => typeof text === 'string' && text.trim() !== ''
    )
    return values[0]
}

export const parsePrice = (value?: string | number | null) => {
    if (typeof value === 'number') return value
    if (typeof value !== 'string') return undefined
    const cleaned = value.replace(/[^\d.]/g, '')
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : undefined
}
