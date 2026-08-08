import { HTMLElement } from 'node-html-parser';
import { livetime } from "@/content/content";
import { Prisma }  from "@prisma/client";

export class ScrapedLiveTimeEvent {
    event_id: number;
    name: string;
    date: string;
    entries: number;
    drivers: number;
    livetime_path: string;

    constructor(row: HTMLElement) {
        const cols = row.querySelectorAll('td');
        const first = cols[0];

        // The ID is in a url like this: /results/?p=view_event&id=488422
        let href = '';
        const a = first?.querySelector('a');
        if (a) {
            href = a.getAttribute('href') || '';
        }
        this.event_id = parseInt(href.split('&id=').pop() || '0', 10);
        this.name = first?.text.trim() || '';

        // the date is formatted like: <span class="hidden">2025-12-02 00:00:00</span>Dec 2, 2025
        const dateCol = cols[1];
        const dateSpan = dateCol?.querySelector('span');
        this.date = dateSpan?.text.trim() || '';

        // These values are just numeric in the table
        this.entries = parseInt(cols[2]?.text.trim() || '0', 10);
        this.drivers = parseInt(cols[3]?.text.trim() || '0', 10);

        this.livetime_path = `${livetime.resultsPath}${this.event_id}`;
    }

    toTrackEvent(): Prisma.TrackEventCreateInput {
        return {
            name: this.name,
            start: new Date(this.date),
            end: new Date(this.date),
            // @ts-ignore: livetimeID is in the schema but not in the generated type
            livetimeID: this.event_id,
        }
    }

    toLiveTimeEvent(): Prisma.LiveTimeEventCreateInput {
        return {
            id: this.event_id,
            name: this.name,
            entries: this.entries,
            drivers: this.drivers,
            startedAt: new Date(this.date),
            trackEvent: undefined
        }
    }

    toString(): string {
        return `ScrapedLiveTimeEvent { event_id: ${this.event_id}, name: ${this.name}, date: ${this.date}, entries: ${this.entries}, drivers: ${this.drivers}, livetime_path: ${this.livetime_path} }`;
    }
}