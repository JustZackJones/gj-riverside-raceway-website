import Events from "@/lib/db/events";
import LiveTimeEventEntries from "@/lib/db/livetime.entries";
import LiveTimeEvents from "@/lib/db/livetime";
import LiveTimeEventRoundHeats from "@/lib/db/livetime.round.heats";
import LiveTimeEventRoundResults from "@/lib/db/livetime.round.results";
import LiveTimeEventRounds from "@/lib/db/livetime.rounds";
import Logger from "@/lib/utils/logger";
import { livetime } from "@/content/content";
import { HTMLElement } from 'node-html-parser';
import { ScraperUtils } from "../utils/scraper.utils";
import { ScrapedLiveTimeEvent } from "@/lib/jobs/models/scraped.livetime.event";
import { ScrapedLiveTimeEventRoundHeat } from "@/lib/jobs/models/scraped.livetime.event.round.heat";
import { ScrapedLiveTimeEventRoundResult } from "@/lib/jobs/models/scraped.livetime.event.round.result";

type SyncLiveTimeEventsJobOptions = {
    fullSync?: boolean;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default async function SyncLiveTimeEventsJob(options: SyncLiveTimeEventsJobOptions = {}) {
    const logger: Logger = new Logger('SyncLiveTimeEventsJob');
    const fullSync = options.fullSync ?? true;

    function isEventLessThanOneDayOld(event: ScrapedLiveTimeEvent): boolean {
        const startedAt = new Date(event.date).getTime();
        if (Number.isNaN(startedAt)) return true;
        return startedAt >= (Date.now() - ONE_DAY_MS);
    }

    async function upsertTrackEvent(event: ScrapedLiveTimeEvent): Promise<void> {
        await Events.upsertByLiveTimeId(event.event_id, event.toTrackEvent());
    }

    async function upsertLiveTimeEvent(event: ScrapedLiveTimeEvent): Promise<void> {
        await LiveTimeEvents.upsert(event.event_id, event.toLiveTimeEvent());
    }

    async function upsertLiveTimeEventShallow(event: ScrapedLiveTimeEvent): Promise<void> {
        const existing = await LiveTimeEvents.getById(event.event_id);

        if (!existing) {
            await LiveTimeEvents.create({
                id: event.event_id,
                name: event.name,
                entries: event.entries,
                drivers: event.drivers,
                startedAt: event.date ? new Date(event.date) : null,
            });
            return;
        }

        await LiveTimeEvents.update(event.event_id, {
            name: event.name,
            entries: event.entries,
            drivers: event.drivers,
            startedAt: event.date ? new Date(event.date) : null,
        });
    }

    async function upsertLiveTimeEventRounds(event: ScrapedLiveTimeEvent): Promise<void> {
        await LiveTimeEventRounds.replaceForEvent(
            event.event_id,
            event.rounds.map((round) => round.toLiveTimeEventRound())
        );
    }

    async function upsertLiveTimeEventEntries(event: ScrapedLiveTimeEvent): Promise<void> {
        await LiveTimeEventEntries.replaceForEvent(
            event.event_id,
            event.eventEntries.map((entry) => entry.toLiveTimeEventEntry())
        );
    }

    function normalizeClassName(rawClassName: string): { className: string; heatNumber: number | null; heatTotal: number | null } {
        const match = rawClassName.match(/^(.*?)\s*\(Heat\s*(\d+)\/(\d+)\)\s*$/i);
        if (!match) {
            return { className: rawClassName.trim(), heatNumber: null, heatTotal: null };
        }

        return {
            className: match[1].trim(),
            heatNumber: parseInt(match[2], 10),
            heatTotal: parseInt(match[3], 10),
        };
    }

    function parseTimeToSeconds(value: string | null): number | null {
        if (!value) return null;

        const cleaned = value.trim();
        if (!cleaned) return null;

        const normalized = cleaned.replace(/\s+/g, '').replace(/,/g, '');
        const plainNumberMatch = normalized.match(/^\d+(?:\.\d+)?$/);
        if (plainNumberMatch) return parseFloat(normalized);

        const percentNumberMatch = normalized.match(/^\d+(?:\.\d+)?%$/);
        if (percentNumberMatch) return parseFloat(normalized.replace('%', ''));

        if (!/^[0-9:.]+$/.test(normalized)) return null;

        const parts = normalized.split(':');
        if (parts.some((part) => part.length === 0 || Number.isNaN(parseFloat(part)))) return null;

        let totalSeconds = 0;
        for (let i = 0; i < parts.length; i++) {
            const partValue = parseFloat(parts[parts.length - 1 - i]);
            totalSeconds += partValue * Math.pow(60, i);
        }

        return Number.isFinite(totalSeconds) ? totalSeconds : null;
    }

    function parseFastestLap(cell: HTMLElement | undefined): { fastestLap: number | null; fastestLapNumber: number | null } {
        const cleaned = cell?.text.trim() || '';
        if (!cleaned) return { fastestLap: null, fastestLapNumber: null };

        const lapNumberText = cell?.querySelector('sup')?.text.trim() || '';
        const lapNumber = lapNumberText ? parseInt(lapNumberText, 10) || null : null;
        const lapValue = lapNumberText ? cleaned.replace(lapNumberText, '').trim() : cleaned;
        const fastestLapSeconds = parseTimeToSeconds(lapValue);

        if (lapNumber || fastestLapSeconds !== null) {
            return {
                fastestLap: fastestLapSeconds,
                fastestLapNumber: lapNumber,
            };
        }

        const match = cleaned.match(/^([0-9.]+)(?:\s*(\d+))?$/);
        if (!match) return { fastestLap: null, fastestLapNumber: null };

        return {
            fastestLap: parseTimeToSeconds(match[1] || null),
            fastestLapNumber: match[2] ? parseInt(match[2], 10) : null,
        };
    }

    function parseLapsAndTime(value: string | null): { laps: number | null; totalTime: number | null } {
        if (!value) return { laps: null, totalTime: null };

        const cleaned = value.trim();
        if (!cleaned) return { laps: null, totalTime: null };

        const parts = cleaned.split('/');
        if (parts.length >= 2) {
            const laps = parseInt(parts[0].trim(), 10);
            const totalTime = parseTimeToSeconds(parts.slice(1).join('/').trim());
            return {
                laps: Number.isFinite(laps) ? laps : null,
                totalTime,
            };
        }

        if (/^\d+$/.test(cleaned)) {
            return { laps: parseInt(cleaned, 10), totalTime: null };
        }

        return { laps: null, totalTime: parseTimeToSeconds(cleaned) };
    }

    function parseRoundHeatsFromPage(
        roundID: number,
        root: HTMLElement
    ): ScrapedLiveTimeEventRoundHeat[] {
        const rows = root.querySelectorAll('table.heat_sheet tbody tr');
        const heatRows: ScrapedLiveTimeEventRoundHeat[] = [];

        let currentRaceNumber: number | null = null;
        let currentClassName = '';
        let currentHeatNumber: number | null = null;
        let currentHeatTotal: number | null = null;
        let currentRaceResultID: number | null = null;

        for (const row of rows) {
            const raceNumText = row.querySelector('.race_num')?.text.trim();
            const classHeaderText = row.querySelector('.class_header')?.text.trim();
            if (raceNumText && classHeaderText) {
                const parsedRaceNumber = parseInt(raceNumText, 10);
                if (!parsedRaceNumber) continue;

                currentRaceNumber = parsedRaceNumber;

                const normalized = normalizeClassName(classHeaderText);
                currentClassName = normalized.className;
                currentHeatNumber = normalized.heatNumber;
                currentHeatTotal = normalized.heatTotal;

                const raceResultHref = row.querySelector('.race_status a')?.getAttribute('href') || '';
                const raceResultId = parseInt(raceResultHref.split('&id=').pop() || '0', 10);
                currentRaceResultID = raceResultId || null;

                continue;
            }

            const cells = row.querySelectorAll('td');
            if (!currentRaceNumber || !currentClassName || cells.length < 4) continue;

            const startingPosition = parseInt(cells[0]?.text.trim() || '0', 10);
            const carNumber = parseInt(cells[1]?.querySelector('.car_num')?.text.trim() || '0', 10) || null;

            const driverCellText = cells[1]?.text.trim() || '';
            const carNumberText = cells[1]?.querySelector('.car_num')?.text.trim() || '';
            const driverName = carNumberText && driverCellText.startsWith(carNumberText)
                ? driverCellText.slice(carNumberText.length).trim()
                : driverCellText;

            const transponder = cells[3]?.text.trim() || null;
            const seedNumber = parseInt(cells[4]?.text.trim() || '0', 10) || null;
            const seedResult = cells[5]?.text.trim() || null;

            if (!startingPosition || !driverName) continue;

            heatRows.push(new ScrapedLiveTimeEventRoundHeat({
                roundID,
                className: currentClassName,
                raceNumber: currentRaceNumber,
                heatNumber: currentHeatNumber,
                heatTotal: currentHeatTotal,
                startingPosition,
                carNumber,
                driverName,
                transponder,
                seedNumber,
                seedResult,
                raceResultID: currentRaceResultID,
            }));
        }

        return heatRows;
    }

    function parseRoundResultsFromPage(
        roundID: number,
        raceResultID: number,
        root: HTMLElement
    ): ScrapedLiveTimeEventRoundResult[] {
        const classHeaderText = root.querySelector('table.race_result .class_header')?.text.trim() || '';
        const raceNumberText = root.querySelector('table.race_result .race_num')?.text.trim() || '';
        const raceNumber = parseInt(raceNumberText || '0', 10) || null;

        if (!classHeaderText) return [];

        return root.querySelectorAll('table.race_result tbody tr').flatMap((row) => {
            const cols = row.querySelectorAll('td');
            if (cols.length < 13) return [];

            const finishPosition = parseInt(cols[0]?.text.trim() || '0', 10);
            const driverName = cols[1]?.querySelector('.driver_name')?.text.trim() || '';
            const carNumber = parseInt(cols[1]?.querySelector('.car_num')?.text.trim() || '0', 10) || null;
            const driverLapDataID = parseInt(cols[1]?.querySelector('a.driver_laps')?.getAttribute('data-driver-id') || '0', 10) || null;
            const qualifyingPosition = parseInt(cols[2]?.text.trim() || '0', 10) || null;
            const { laps, totalTime } = parseLapsAndTime(cols[3]?.text.trim() || null);
            const behind = cols[4]?.text.trim() || null;
            const { fastestLap, fastestLapNumber } = parseFastestLap(cols[5]);
            const avgLap = parseTimeToSeconds(cols[6]?.text.trim() || null);
            const avgTop5 = parseTimeToSeconds(cols[7]?.text.trim() || null);
            const avgTop10 = parseTimeToSeconds(cols[8]?.text.trim() || null);
            const avgTop15 = parseTimeToSeconds(cols[9]?.text.trim() || null);
            const top3Consecutive = parseTimeToSeconds(cols[10]?.text.trim() || null);
            const stdDeviation = parseTimeToSeconds(cols[11]?.text.trim() || null);
            const consistency = parseTimeToSeconds(cols[12]?.text.trim() || null);

            if (!finishPosition || !driverName) return [];

            return [new ScrapedLiveTimeEventRoundResult({
                roundID,
                raceResultID,
                className: classHeaderText,
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
            })];
        });
    }

    async function upsertRoundResults(
        roundID: number,
        raceResultIDs: number[]
    ): Promise<void> {
        const uniqueRaceResultIDs = [...new Set(raceResultIDs.filter((id) => id > 0))];
        const allRows: ScrapedLiveTimeEventRoundResult[] = [];

        for (const raceResultID of uniqueRaceResultIDs) {
            try {
                const raceResultPageUrl = livetime.getLink(`/results/?p=view_race_result&id=${raceResultID}`);
                const raceResultPage = await ScraperUtils.scrapeAsHTML(raceResultPageUrl);
                const parsed = parseRoundResultsFromPage(roundID, raceResultID, raceResultPage);
                allRows.push(...parsed);
            } catch (error) {
                logger.warn(`Failed to sync race result rows for race result ${raceResultID}: ${error}`);
            }
        }

        await LiveTimeEventRoundResults.replaceForRound(
            roundID,
            allRows.map((row) => row.toLiveTimeEventRoundResult())
        );
    }

    async function upsertRoundHeats(event: ScrapedLiveTimeEvent): Promise<void> {
        for (const round of event.rounds) {
            try {
                const roundPageUrl = livetime.getLink(`/results/?p=view_heat_sheet&id=${round.roundID}`);
                const roundPage = await ScraperUtils.scrapeAsHTML(roundPageUrl);
                const heatRows = parseRoundHeatsFromPage(round.roundID, roundPage);
                await LiveTimeEventRoundHeats.replaceForRound(
                    round.roundID,
                    heatRows.map((heatRow) => heatRow.toLiveTimeEventRoundHeat())
                );

                await upsertRoundResults(
                    round.roundID,
                    heatRows.map((heatRow) => heatRow.raceResultID || 0)
                );
            } catch (error) {
                logger.warn(`Failed to sync heat rows for round ${round.roundID}: ${error}`);
            }
        }
    }

    async function hydrateEventFromEventPage(event: ScrapedLiveTimeEvent): Promise<void> {
        const eventPage = await ScraperUtils.scrapeAsHTML(livetime.getLink(event.livetime_path));
        event.updateFromEventPage(eventPage);

        if (event.entry_list_path) {
            const entryListPage = await ScraperUtils.scrapeAsHTML(livetime.getLink(event.entry_list_path));
            event.updateEntriesFromEntryListPage(entryListPage);
        }
    }

    //Extracts events from the livetime page
    function extractEventsFromPage(root: HTMLElement): ScrapedLiveTimeEvent[] {
        logger.info(`Scraping LiveTimeRC events page...`);
        let events: ScrapedLiveTimeEvent[] = [];
        const events_table = root.querySelector('table#events');
        if (!events_table) {
            logger.info('No events table found.');
            return events;
        }
        const event_rows = events_table.querySelectorAll('tbody tr');
        event_rows.forEach((row) => {
            const event = new ScrapedLiveTimeEvent(row);
            logger.info(`Scraped ${event.name} (LiveTime ID: ${event.event_id})`);
            events.push(event);
        });
        logger.info(`Scraped ${events.length} events from ${livetime.baseUrl}`);
        return events;
    }

    //Upserts all scraped events into the database
    async function upsertEvents(events: ScrapedLiveTimeEvent[]): Promise<void> {
        logger.info(`Upserting events into database...`);

        let fullSyncCount = 0;
        let shallowSyncCount = 0;

        for (const event of events) {
            const shouldRunFullSync = fullSync || isEventLessThanOneDayOld(event);
            if (shouldRunFullSync) {
                await hydrateEventFromEventPage(event);
                await upsertLiveTimeEvent(event);
                await upsertLiveTimeEventRounds(event);
                await upsertLiveTimeEventEntries(event);
                await upsertRoundHeats(event);
                await upsertTrackEvent(event);
                fullSyncCount++;
            } else {
                await upsertLiveTimeEventShallow(event);
                await upsertTrackEvent(event);
                shallowSyncCount++;
            }

            logger.info(`Upserted ${event.name} (LiveTime ID: ${event.event_id})`);
        }

        logger.info(`Event sync mode counts: full=${fullSyncCount}, shallow=${shallowSyncCount}`);
        logger.info(`Upserted ${events.length} events into database`);
    }

    //Perform the scrape and upsert for events on livetime
    async function scrapeAndUpsertEvents(): Promise<void> {
        logger.info(`Starting scrape and upsert of LiveTime events...`);
        let eventsUrl = livetime.getLink(livetime.eventsPath);
        await ScraperUtils.scrapeAsHTML(eventsUrl).then(async html => {
            //1. Extract events from the html
            const events: ScrapedLiveTimeEvent[] = extractEventsFromPage(html);
            if (fullSync) {
                logger.info(`Full sync enabled for startup run. Syncing all ${events.length} events.`);
            } else {
                logger.info(`Incremental sync enabled. All events will be discovered; full sync runs only for events less than 24 hours old.`);
            }

            //2. Upsert each event into the relevant tables
            await upsertEvents(events);
        });
    }

    await scrapeAndUpsertEvents();
}