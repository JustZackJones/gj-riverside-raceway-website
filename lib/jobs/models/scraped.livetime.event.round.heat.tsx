import { Prisma } from "@prisma/client";

export class ScrapedLiveTimeEventRoundHeat {
    roundID: number;
    liveTimeEventEntryID: number | null;
    className: string;
    raceNumber: number;
    heatNumber: number | null;
    heatTotal: number | null;
    startingPosition: number;
    carNumber: number | null;
    driverName: string | null;
    transponder: string | null;
    seedNumber: number | null;
    seedResult: string | null;
    raceResultID: number | null;

    constructor({
        roundID,
        liveTimeEventEntryID,
        className,
        raceNumber,
        heatNumber,
        heatTotal,
        startingPosition,
        carNumber,
        driverName,
        transponder,
        seedNumber,
        seedResult,
        raceResultID,
    }: {
        roundID: number;
        liveTimeEventEntryID?: number | null;
        className: string;
        raceNumber: number;
        heatNumber?: number | null;
        heatTotal?: number | null;
        startingPosition: number;
        carNumber?: number | null;
        driverName?: string | null;
        transponder?: string | null;
        seedNumber?: number | null;
        seedResult?: string | null;
        raceResultID?: number | null;
    }) {
        this.roundID = roundID;
        this.liveTimeEventEntryID = liveTimeEventEntryID ?? null;
        this.className = className;
        this.raceNumber = raceNumber;
        this.heatNumber = heatNumber ?? null;
        this.heatTotal = heatTotal ?? null;
        this.startingPosition = startingPosition;
        this.carNumber = carNumber ?? null;
        this.driverName = driverName ?? null;
        this.transponder = transponder ?? null;
        this.seedNumber = seedNumber ?? null;
        this.seedResult = seedResult ?? null;
        this.raceResultID = raceResultID ?? null;
    }

    toLiveTimeEventRoundHeat(): Prisma.LiveTimeEventRoundHeatCreateManyInput {
        return {
            roundID: this.roundID,
            liveTimeEventEntryID: this.liveTimeEventEntryID,
            className: this.className,
            raceNumber: this.raceNumber,
            heatNumber: this.heatNumber,
            heatTotal: this.heatTotal,
            startingPosition: this.startingPosition,
            carNumber: this.carNumber,
            driverName: this.driverName,
            transponder: this.transponder,
            seedNumber: this.seedNumber,
            seedResult: this.seedResult,
            raceResultID: this.raceResultID,
        };
    }
}