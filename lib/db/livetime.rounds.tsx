import { prisma } from '@/lib/prisma'
import { LiveTimeEventRound, Prisma } from '@prisma/client'

export default class LiveTimeEventRounds {
    static async getByEventId(liveTimeEventID: number): Promise<LiveTimeEventRound[]> {
        return prisma.liveTimeEventRound.findMany({
            where: { liveTimeEventID },
            orderBy: [{ type: 'asc' }, { roundNumber: 'asc' }, { name: 'asc' }],
        })
    }

    static async replaceForEvent(liveTimeEventID: number, data: Prisma.LiveTimeEventRoundCreateManyInput[]): Promise<void> {
        await prisma.$transaction(async (tx) => {
            await tx.liveTimeEventRound.deleteMany({ where: { liveTimeEventID } })

            if (data.length > 0) {
                await tx.liveTimeEventRound.createMany({ data })
            }
        })
    }
}