import Events from '@/lib/db/livetime.round.results'
import Responses from '@/lib/api/responses'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idString } = await params
  const id = parseInt(idString)
  const results = await Events.getEventResults(id)
  return Responses.ok(results)
}