import { prisma } from '@/lib/prisma'
import { LiveTimeEventRoundResult, Prisma } from '@prisma/client'

export default class LiveTimeEventRoundResults {
    static async getByRoundId(roundID: number): Promise<LiveTimeEventRoundResult[]> {
        return prisma.liveTimeEventRoundResult.findMany({
            where: { roundID },
            orderBy: [{ raceResultID: 'asc' }, { finishPosition: 'asc' }],
        })
    }

    static async replaceForRound(roundID: number, data: Prisma.LiveTimeEventRoundResultCreateManyInput[]): Promise<void> {
        await prisma.$transaction(async (tx) => {
            await tx.liveTimeEventRoundResult.deleteMany({ where: { roundID } })

            if (data.length > 0) {
                await tx.liveTimeEventRoundResult.createMany({ data })
            }
        })
    }
}