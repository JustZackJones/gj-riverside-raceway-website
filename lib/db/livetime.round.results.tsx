import { prisma } from '@/lib/prisma'
import { LiveTimeEventRoundResult, Prisma } from '@prisma/client'
import LiveTimeEvents from './livetime'
import LiveTimeEventRounds from './livetime.rounds'

export type RoundResultsByClass = Record<string, LiveTimeEventRoundResult[]>
export type EventResultsByRound = Record<string, RoundResultsByClass>


export default class LiveTimeEventRoundResults {

    static async getEventResults(eventID: number): Promise<EventResultsByRound> {
        const rounds = await LiveTimeEventRounds.getRoundsByEventId(eventID);
        const resultsByType: Map<string, RoundResultsByClass> = new Map<string, RoundResultsByClass>();
        for (const round of rounds) {
            const results = await this.getRoundResults(round.roundID);
            resultsByType.set(round.name, results);
        }
        return Object.fromEntries(resultsByType);
    }

    static async getRoundResults(roundID: number): Promise<RoundResultsByClass> {
        const results = await prisma.liveTimeEventRoundResult.findMany({
            where: { roundID },
            orderBy: [{ raceResultID: 'asc' }, { finishPosition: 'asc' }],
        });

        const resultsByClass: Map<string, LiveTimeEventRoundResult[]> = new Map<string, LiveTimeEventRoundResult[]>();
        for (const result of results) {
            const className = result.className || 'Unknown Class';
            if (!resultsByClass.has(className)) {
                resultsByClass.set(className, []);
            }
            resultsByClass.get(className)!.push(result);
        }
        return Object.fromEntries(resultsByClass);
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