import Events from '@/lib/db/events'
import Responses from '@/lib/api/responses'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params
  const id = parseInt(idString)
  
  if (isNaN(id)) return Responses.badRequest('Invalid ID');
  
  const scheduleType = await Events.getById(id)
  if (!scheduleType) return Responses.notFound('Schedule not found');

  return Responses.ok(scheduleType)
}