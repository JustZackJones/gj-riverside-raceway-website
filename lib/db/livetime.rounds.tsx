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
            const existingRounds = await tx.liveTimeEventRound.findMany({
                where: { liveTimeEventID },
                select: { roundID: true },
            })
            const roundIDs = existingRounds.map((round) => round.roundID)

            if (roundIDs.length > 0) {
                await tx.liveTimeEventRoundHeat.deleteMany({ where: { roundID: { in: roundIDs } } })
                await tx.liveTimeEventRoundResult.deleteMany({ where: { roundID: { in: roundIDs } } })
            }

            await tx.liveTimeEventRound.deleteMany({ where: { liveTimeEventID } })

            if (data.length > 0) {
                await tx.liveTimeEventRound.createMany({ data })
            }
        })
    }
}