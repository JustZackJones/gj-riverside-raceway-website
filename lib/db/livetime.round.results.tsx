import { prisma } from '@/lib/prisma'
import { LiveTimeEventRoundResult, Prisma } from '@prisma/client'
import LiveTimeEvents from './livetime'
import LiveTimeEventRounds from './livetime.rounds'

export default class LiveTimeEventRoundResults {
    static async getByRoundId(roundID: number): Promise<LiveTimeEventRoundResult[]> {
        return prisma.liveTimeEventRoundResult.findMany({
            where: { roundID },
            orderBy: [{ raceResultID: 'asc' }, { finishPosition: 'asc' }],
        })
    }

    static async getRoundResults(roundID: number): Promise<LiveTimeEventRoundResult[]> {
        return prisma.liveTimeEventRoundResult.findMany({
            where: { roundID },
            orderBy: [{ raceResultID: 'asc' }, { finishPosition: 'asc' }],
        });
    }

    static async getLastFinishedEventResults(): Promise<LiveTimeEventRoundResult[]> {
        const event = await LiveTimeEvents.getLastFinishedEvent();
        if (!event) return [];

        const mainRound = await LiveTimeEventRounds.getMainRoundByEventId(event.id);
        if (!mainRound) return [];

        return this.getRoundResults(mainRound.roundID);
    }

    static async getLastFinishedEventWinners(): Promise<LiveTimeEventRoundResult[]> {
        const results = await this.getLastFinishedEventResults();
        const winners = results.filter(result => result.finishPosition === 1);
        return winners;
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