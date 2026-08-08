import { prisma } from '@/lib/prisma'
import { LiveTimeEventRoundHeat, Prisma } from '@prisma/client'

export default class LiveTimeEventRoundHeats {
    static async getByRoundId(roundID: number): Promise<LiveTimeEventRoundHeat[]> {
        return prisma.liveTimeEventRoundHeat.findMany({
            where: { roundID },
            orderBy: [{ raceNumber: 'asc' }, { startingPosition: 'asc' }],
        })
    }

    static async replaceForRound(roundID: number, data: Prisma.LiveTimeEventRoundHeatCreateManyInput[]): Promise<void> {
        await prisma.$transaction(async (tx) => {
            await tx.liveTimeEventRoundHeat.deleteMany({ where: { roundID } })

            if (data.length > 0) {
                await tx.liveTimeEventRoundHeat.createMany({ data })
            }
        })
    }
}