import Events from '@/lib/db/livetime.round.results'
import Responses from '@/lib/api/responses'

export async function GET(request: Request) {
  const results = await Events.getLastFinishedEventResults()
  return Responses.ok(results)
}