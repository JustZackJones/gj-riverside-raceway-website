import { NextResponse } from 'next/server'

const LIVE_STATUS_CACHE_MS = 15 * 60 * 1000
const CACHE_CONTROL = 'public, s-maxage=900, stale-while-revalidate=300'

export const revalidate = 900

interface LiveStatus {
    liveVideoId: string | null
}

let cachedStatus: LiveStatus | null = null
let cacheExpiresAt = 0
let pendingStatus: Promise<LiveStatus> | null = null

interface YouTubeSearchResponse {
    items?: Array<{
        id?: {
            videoId?: string
        }
    }>
}

async function retrieveLiveStatus(): Promise<LiveStatus> {
    const channelId = process.env.YOUTUBE_CHANNEL_ID
    const apiKey = process.env.YOUTUBE_DATA_API_KEY

    if (!channelId || !apiKey) {
        return { liveVideoId: null }
    }

    const searchParameters = new URLSearchParams({
        part: 'id',
        channelId,
        eventType: 'live',
        maxResults: '1',
        type: 'video',
        key: apiKey,
    })

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?${searchParameters}`,
            { next: { revalidate: 900 } }
        )

        if (!response.ok) {
            console.error('Unable to retrieve YouTube live-stream status:', response.status)
            return { liveVideoId: null }
        }

        const result = await response.json() as YouTubeSearchResponse
        const liveVideoId = result.items?.[0]?.id?.videoId ?? null

        return { liveVideoId }
    } catch (error) {
        console.error('Unable to retrieve YouTube live-stream status:', error)
        return { liveVideoId: null }
    }
}

export async function GET() {
    const now = Date.now()

    if (cachedStatus && now < cacheExpiresAt) {
        return NextResponse.json(cachedStatus, { headers: { 'Cache-Control': CACHE_CONTROL } })
    }

    pendingStatus ??= retrieveLiveStatus()

    try {
        cachedStatus = await pendingStatus
        cacheExpiresAt = Date.now() + LIVE_STATUS_CACHE_MS
        return NextResponse.json(cachedStatus, { headers: { 'Cache-Control': CACHE_CONTROL } })
    } finally {
        pendingStatus = null
    }
}
