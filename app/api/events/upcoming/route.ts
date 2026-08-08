import Events from '@/lib/db/events'
import Responses from '@/lib/api/responses'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const includeCancelled = url.searchParams.get('includeCancelled') === 'true'
  const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit') as string, 10) : undefined
  const schedules = await Events.getUpcoming(includeCancelled, limit)
  return Responses.ok(schedules)
}