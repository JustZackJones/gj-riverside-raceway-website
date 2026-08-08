import { Prisma } from "@prisma/client";

export type ScrapedLiveTimeEventRoundType = 'qualifier' | 'main';

export class ScrapedLiveTimeEventRound {
    roundID: number;
    liveTimeEventID: number;
    name: string;
    type: ScrapedLiveTimeEventRoundType;
    roundNumber: number | null;

    constructor({
        roundID,
        liveTimeEventID,
        name,
        type,
        roundNumber,
    }: {
        roundID: number;
        liveTimeEventID: number;
        name: string;
        type: ScrapedLiveTimeEventRoundType;
        roundNumber?: number | null;
    }) {
        this.roundID = roundID;
        this.liveTimeEventID = liveTimeEventID;
        this.name = name;
        this.type = type;
        this.roundNumber = roundNumber ?? null;
    }

    toLiveTimeEventRound(): Prisma.LiveTimeEventRoundCreateManyInput {
        return {
            roundID: this.roundID,
            liveTimeEventID: this.liveTimeEventID,
            name: this.name,
            type: this.type,
            roundNumber: this.roundNumber,
        };
    }
}