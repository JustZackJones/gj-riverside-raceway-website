import { prisma } from '@/lib/prisma'
import { LiveTimeEventEntry, Prisma } from '@prisma/client'

export default class LiveTimeEventEntries {
    static async getByEventId(liveTimeEventID: number): Promise<LiveTimeEventEntry[]> {
        return prisma.liveTimeEventEntry.findMany({
            where: { liveTimeEventID },
            orderBy: [{ className: 'asc' }, { entryNumber: 'asc' }],
        })
    }

    static async replaceForEvent(liveTimeEventID: number, data: Prisma.LiveTimeEventEntryCreateManyInput[]): Promise<void> {
        await prisma.$transaction(async (tx) => {
            await tx.liveTimeEventEntry.deleteMany({ where: { liveTimeEventID } })

            if (data.length > 0) {
                await tx.liveTimeEventEntry.createMany({ data })
            }
        })
    }
}