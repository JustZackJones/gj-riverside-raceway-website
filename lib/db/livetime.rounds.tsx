import { prisma } from '@/lib/prisma'
import { LiveTimeEventRound, Prisma } from '@prisma/client'

export default class LiveTimeEventRounds {
    static async getByEventId(liveTimeEventID: number): Promise<LiveTimeEventRound[]> {
        return prisma.liveTimeEventRound.findMany({
            where: { liveTimeEventID },
            orderBy: [{ type: 'asc' }, { roundNumber: 'asc' }, { name: 'asc' }],
        })
    }

    static async getRoundsByEventId(liveTimeEventID: number): Promise<LiveTimeEventRound[]> {
        return prisma.liveTimeEventRound.findMany({
            where: { liveTimeEventID },
            orderBy: [{ type: 'asc' }, { roundNumber: 'asc' }, { name: 'asc' }],
        })
    }

    static async getMainRoundByEventId(liveTimeEventID: number): Promise<LiveTimeEventRound | null> {
        const rounds = await LiveTimeEventRounds.getRoundsByEventId(liveTimeEventID);
        return rounds.find(round => round.type === 'main') || null;
    }

    static async getQualifierRoundsByEventId(liveTimeEventID: number): Promise<LiveTimeEventRound[]> {
        const rounds = await LiveTimeEventRounds.getRoundsByEventId(liveTimeEventID);
        return rounds.filter(round => round.type === 'qualifier');
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