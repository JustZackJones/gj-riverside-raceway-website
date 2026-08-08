import Events from '@/lib/db/events'
import Responses from '@/lib/api/responses'

export async function GET() {
  const schedules = await Events.getVisible()
  return Responses.ok(schedules)
}