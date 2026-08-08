import { Prisma } from "@prisma/client";

export class ScrapedLiveTimeEventRoundResult {
    roundID: number;
    liveTimeEventEntryID: number | null;
    raceResultID: number;
    className: string;
    raceNumber: number | null;
    finishPosition: number;
    carNumber: number | null;
    driverName: string | null;
    driverLapDataID: number | null;
    qualifyingPosition: number | null;
    laps: number | null;
    totalTime: number | null;
    behind: string | null;
    fastestLap: number | null;
    fastestLapNumber: number | null;
    avgLap: number | null;
    avgTop5: number | null;
    avgTop10: number | null;
    avgTop15: number | null;
    top3Consecutive: number | null;
    stdDeviation: number | null;
    consistency: number | null;

    constructor({
        roundID,
        liveTimeEventEntryID,
        raceResultID,
        className,
        raceNumber,
        finishPosition,
        carNumber,
        driverName,
        driverLapDataID,
        qualifyingPosition,
        laps,
        totalTime,
        behind,
        fastestLap,
        fastestLapNumber,
        avgLap,
        avgTop5,
        avgTop10,
        avgTop15,
        top3Consecutive,
        stdDeviation,
        consistency,
    }: {
        roundID: number;
        liveTimeEventEntryID?: number | null;
        raceResultID: number;
        className: string;
        raceNumber?: number | null;
        finishPosition: number;
        carNumber?: number | null;
        driverName?: string | null;
        driverLapDataID?: number | null;
        qualifyingPosition?: number | null;
        laps?: number | null;
        totalTime?: number | null;
        behind?: string | null;
        fastestLap?: number | null;
        fastestLapNumber?: number | null;
        avgLap?: number | null;
        avgTop5?: number | null;
        avgTop10?: number | null;
        avgTop15?: number | null;
        top3Consecutive?: number | null;
        stdDeviation?: number | null;
        consistency?: number | null;
    }) {
        this.roundID = roundID;
        this.liveTimeEventEntryID = liveTimeEventEntryID ?? null;
        this.raceResultID = raceResultID;
        this.className = className;
        this.raceNumber = raceNumber ?? null;
        this.finishPosition = finishPosition;
        this.carNumber = carNumber ?? null;
        this.driverName = driverName ?? null;
        this.driverLapDataID = driverLapDataID ?? null;
        this.qualifyingPosition = qualifyingPosition ?? null;
        this.laps = laps ?? null;
        this.totalTime = totalTime ?? null;
        this.behind = behind ?? null;
        this.fastestLap = fastestLap ?? null;
        this.fastestLapNumber = fastestLapNumber ?? null;
        this.avgLap = avgLap ?? null;
        this.avgTop5 = avgTop5 ?? null;
        this.avgTop10 = avgTop10 ?? null;
        this.avgTop15 = avgTop15 ?? null;
        this.top3Consecutive = top3Consecutive ?? null;
        this.stdDeviation = stdDeviation ?? null;
        this.consistency = consistency ?? null;
    }

    toLiveTimeEventRoundResult(): Prisma.LiveTimeEventRoundResultCreateManyInput {
        return {
            roundID: this.roundID,
            liveTimeEventEntryID: this.liveTimeEventEntryID,
            raceResultID: this.raceResultID,
            className: this.className,
            raceNumber: this.raceNumber,
            finishPosition: this.finishPosition,
            carNumber: this.carNumber,
            driverName: this.driverName,
            driverLapDataID: this.driverLapDataID,
            qualifyingPosition: this.qualifyingPosition,
            laps: this.laps,
            totalTime: this.totalTime,
            behind: this.behind,
            fastestLap: this.fastestLap,
            fastestLapNumber: this.fastestLapNumber,
            avgLap: this.avgLap,
            avgTop5: this.avgTop5,
            avgTop10: this.avgTop10,
            avgTop15: this.avgTop15,
            top3Consecutive: this.top3Consecutive,
            stdDeviation: this.stdDeviation,
            consistency: this.consistency,
        };
    }
}