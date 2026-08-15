import { NextResponse } from 'next/server'

export const revalidate = 60

interface YouTubeSearchResponse {
    items?: Array<{
        id?: {
            videoId?: string
        }
    }>
}

export async function GET() {
    const channelId = process.env.YOUTUBE_CHANNEL_ID
    const apiKey = process.env.YOUTUBE_DATA_API_KEY

    if (!channelId || !apiKey) {
        return NextResponse.json({ liveVideoId: null })
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
            { next: { revalidate: 60 } }
        )

        if (!response.ok) {
            console.error('Unable to retrieve YouTube live-stream status:', response.status)
            return NextResponse.json({ liveVideoId: null })
        }

        const result = await response.json() as YouTubeSearchResponse
        const liveVideoId = result.items?.[0]?.id?.videoId ?? null

        return NextResponse.json({ liveVideoId })
    } catch (error) {
        console.error('Unable to retrieve YouTube live-stream status:', error)
        return NextResponse.json({ liveVideoId: null })
    }
}