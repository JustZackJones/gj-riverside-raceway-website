import { HTMLElement } from 'node-html-parser';
import { livetime } from "@/content/content";
import { Prisma }  from "@prisma/client";
import { ScrapedLiveTimeEventEntry } from './scraped.livetime.event.entry';
import { ScrapedLiveTimeEventRound } from './scraped.livetime.event.round';

export class ScrapedLiveTimeEvent {
    event_id: number;
    name: string;
    date: string;
    track: string;
    entries: number;
    drivers: number;
    laps: number;
    livetime_path: string;
    entry_list_path: string;
    rounds: ScrapedLiveTimeEventRound[];
    eventEntries: ScrapedLiveTimeEventEntry[];

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
        this.track = '';
        this.laps = 0;
        this.entry_list_path = '';
        this.rounds = [];
        this.eventEntries = [];

        this.livetime_path = `${livetime.resultsPath}${this.event_id}`;
    }

    updateFromEventPage(root: HTMLElement): void {
        const statsRows = root.querySelectorAll('table tr');
        const getValueForHeading = (headingText: string): string => {
            const row = statsRows.find((currentRow) => {
                const heading = currentRow.querySelector('th')?.text.trim().toLowerCase();
                return heading === headingText.toLowerCase();
            });

            return row?.querySelector('td')?.text.trim() || '';
        };

        const track = getValueForHeading('Race Track');
        const registrations = getValueForHeading('Registrations');
        const laps = getValueForHeading('Total Race Laps');

        if (track) this.track = track;

        const entryMatch = registrations.match(/Entries:\s*([\d,]+)/i);
        const driverMatch = registrations.match(/Drivers:\s*([\d,]+)/i);

        if (entryMatch) this.entries = parseInt(entryMatch[1].replace(/,/g, ''), 10) || this.entries;
        if (driverMatch) this.drivers = parseInt(driverMatch[1].replace(/,/g, ''), 10) || this.drivers;
        if (laps) this.laps = parseInt(laps.replace(/,/g, ''), 10) || 0;

        const entryListLink = root.querySelectorAll('a').find((link) => {
            const href = link.getAttribute('href') || '';
            return href.includes('view_entry_list&id=');
        });
        this.entry_list_path = entryListLink?.getAttribute('href') || '';

        this.rounds = root.querySelectorAll('a').flatMap((link) => {
            const href = link.getAttribute('href') || '';
            if (!href.includes('view_heat_sheet&id=')) return [];

            const name = link.text.trim().replace(/\s+/g, ' ');
            const qualifierMatch = name.match(/^Qualifier Round\s+(\d+)$/i);
            const isMain = /^Main Events$/i.test(name);

            if (!qualifierMatch && !isMain) return [];

            const roundId = parseInt(href.split('&id=').pop() || '0', 10);
            if (!roundId) return [];

            return [new ScrapedLiveTimeEventRound({
                roundID: roundId,
                liveTimeEventID: this.event_id,
                name,
                type: qualifierMatch ? 'qualifier' : 'main',
                roundNumber: qualifierMatch ? parseInt(qualifierMatch[1], 10) : null,
            })];
        });
    }

    updateEntriesFromEntryListPage(root: HTMLElement): void {
        this.eventEntries = root.querySelectorAll('div.tab-pane table').flatMap((table) => {
            const className = table.querySelector('.class_header')?.text.trim() || '';
            if (!className) return [];

            return table.querySelectorAll('tbody tr').flatMap((row) => {
                const cols = row.querySelectorAll('td');
                if (cols.length < 3) return [];

                const entryNumber = parseInt(cols[0]?.text.trim() || '0', 10);
                const driverCell = cols[1];
                const hiddenDriverName = driverCell?.querySelector('.hidden')?.text.trim() || '';
                const rawDriverName = driverCell?.text.trim() || '';
                const driverName = hiddenDriverName && rawDriverName.startsWith(hiddenDriverName)
                    ? rawDriverName.slice(hiddenDriverName.length).trim()
                    : rawDriverName;
                const fullName = hiddenDriverName || driverName;
                const transponder = cols[2]?.text.trim() || '';

                if (!entryNumber || !driverName) return [];

                return [new ScrapedLiveTimeEventEntry({
                    liveTimeEventID: this.event_id,
                    className,
                    entryNumber,
                    driverName,
                    fullName,
                    transponder: transponder || null,
                })];
            });
        });
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
            track: this.track,
            entries: this.entries,
            drivers: this.drivers,
            laps: this.laps,
            startedAt: new Date(this.date),
            trackEvent: undefined
        }
    }

    toString(): string {
        return `ScrapedLiveTimeEvent { event_id: ${this.event_id}, name: ${this.name}, date: ${this.date}, track: ${this.track}, entries: ${this.entries}, drivers: ${this.drivers}, laps: ${this.laps}, livetime_path: ${this.livetime_path}, entry_list_path: ${this.entry_list_path}, rounds: ${this.rounds.length}, eventEntries: ${this.eventEntries.length} }`;
    }
}