import { Prisma } from "@prisma/client";

export class ScrapedLiveTimeEventEntry {
    liveTimeEventID: number;
    className: string;
    entryNumber: number;
    driverName: string;
    fullName: string | null;
    transponder: string | null;

    constructor({
        liveTimeEventID,
        className,
        entryNumber,
        driverName,
        fullName,
        transponder,
    }: {
        liveTimeEventID: number;
        className: string;
        entryNumber: number;
        driverName: string;
        fullName?: string | null;
        transponder?: string | null;
    }) {
        this.liveTimeEventID = liveTimeEventID;
        this.className = className;
        this.entryNumber = entryNumber;
        this.driverName = driverName;
        this.fullName = fullName ?? null;
        this.transponder = transponder ?? null;
    }

    toLiveTimeEventEntry(): Prisma.LiveTimeEventEntryCreateManyInput {
        return {
            liveTimeEventID: this.liveTimeEventID,
            className: this.className,
            entryNumber: this.entryNumber,
            driverName: this.driverName,
            fullName: this.fullName,
            transponder: this.transponder,
        };
    }
}