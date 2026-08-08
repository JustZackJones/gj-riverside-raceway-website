import Events from "@/lib/db/events";
import LiveTimeEventEntries from "@/lib/db/livetime.entries";
import LiveTimeEvents from "@/lib/db/livetime";
import LiveTimeEventRoundHeats from "@/lib/db/livetime.round.heats";
import LiveTimeEventRoundResults from "@/lib/db/livetime.round.results";
import LiveTimeEventRounds from "@/lib/db/livetime.rounds";
import { LiveTimeEventEntry } from "@prisma/client";
import Logger from "@/lib/utils/logger";
import { livetime } from "@/content/content";
import { HTMLElement } from 'node-html-parser';
import { ScraperUtils } from "../utils/scraper.utils";
import { ScrapedLiveTimeEvent } from "@/lib/jobs/models/scraped.livetime.event";
import { ScrapedLiveTimeEventRoundHeat } from "@/lib/jobs/models/scraped.livetime.event.round.heat";
import { ScrapedLiveTimeEventRoundResult } from "@/lib/jobs/models/scraped.livetime.event.round.result";

export default async function SyncLiveTimeEventsJob() {
    const logger: Logger = new Logger('SyncLiveTimeEventsJob');

    async function upsertTrackEvent(event: ScrapedLiveTimeEvent): Promise<void> {
        await Events.upsertByLiveTimeId(event.event_id, event.toTrackEvent());
    }

    async function upsertLiveTimeEvent(event: ScrapedLiveTimeEvent): Promise<void> {
        await LiveTimeEvents.upsert(event.event_id, event.toLiveTimeEvent());
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

    function stripMainSuffix(rawClassName: string): string {
        return rawClassName.replace(/\s+[A-Z]-Main\s*$/i, '').trim();
    }

    function resolveEntryLink(
        eventEntries: LiveTimeEventEntry[],
        className: string,
        driverName: string,
        options?: { carNumber?: number | null; transponder?: string | null }
    ): LiveTimeEventEntry | null {
        const classCandidates = [className, stripMainSuffix(className)]
            .map((name) => name.trim().toLowerCase())
            .filter((name, index, list) => name.length > 0 && list.indexOf(name) === index);

        const inClass = eventEntries.filter((entry) =>
            classCandidates.includes(entry.className.toLowerCase())
        );

        if (options?.carNumber) {
            const byEntryNumber = inClass.filter((entry) => entry.entryNumber === options.carNumber);
            if (byEntryNumber.length === 1) return byEntryNumber[0];
        }

        if (options?.transponder) {
            const normalizedTx = options.transponder.trim();
            const byTransponder = inClass.filter((entry) => (entry.transponder || '').trim() === normalizedTx);
            if (byTransponder.length === 1) return byTransponder[0];
        }

        const byDriverName = inClass.filter((entry) =>
            entry.driverName.toLowerCase() === driverName.toLowerCase()
        );
        if (byDriverName.length === 1) return byDriverName[0];

        const globalByDriver = eventEntries.filter((entry) =>
            entry.driverName.toLowerCase() === driverName.toLowerCase()
        );
        if (globalByDriver.length === 1) return globalByDriver[0];

        return null;
    }

    function parseFastestLap(cell: HTMLElement | undefined): { fastestLap: string | null; fastestLapNumber: number | null } {
        const cleaned = cell?.text.trim() || '';
        if (!cleaned) return { fastestLap: null, fastestLapNumber: null };

        const lapNumberText = cell?.querySelector('sup')?.text.trim() || '';
        const lapNumber = lapNumberText ? parseInt(lapNumberText, 10) || null : null;
        const lapValue = lapNumberText ? cleaned.replace(lapNumberText, '').trim() : cleaned;

        if (lapNumber || lapValue) {
            return {
                fastestLap: lapValue || null,
                fastestLapNumber: lapNumber,
            };
        }

        const match = cleaned.match(/^([0-9.]+)(?:\s*(\d+))?$/);
        if (!match) return { fastestLap: cleaned, fastestLapNumber: null };

        return {
            fastestLap: match[1] || null,
            fastestLapNumber: match[2] ? parseInt(match[2], 10) : null,
        };
    }

    function parseLapsAndTime(value: string | null): { laps: number | null; totalTime: string | null } {
        if (!value) return { laps: null, totalTime: null };

        const cleaned = value.trim();
        if (!cleaned) return { laps: null, totalTime: null };

        const parts = cleaned.split('/');
        if (parts.length >= 2) {
            const laps = parseInt(parts[0].trim(), 10);
            const totalTime = parts.slice(1).join('/').trim();
            return {
                laps: Number.isFinite(laps) ? laps : null,
                totalTime: totalTime || null,
            };
        }

        if (/^\d+$/.test(cleaned)) {
            return { laps: parseInt(cleaned, 10), totalTime: null };
        }

        return { laps: null, totalTime: cleaned };
    }

    function parseRoundHeatsFromPage(
        roundID: number,
        root: HTMLElement,
        eventEntries: LiveTimeEventEntry[]
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

            const linkedEntry = resolveEntryLink(eventEntries, currentClassName, driverName, {
                carNumber,
                transponder,
            });
            const driverNameToStore = linkedEntry ? null : driverName;
            const transponderToStore = linkedEntry ? null : transponder;

            heatRows.push(new ScrapedLiveTimeEventRoundHeat({
                roundID,
                liveTimeEventEntryID: linkedEntry?.id ?? null,
                className: currentClassName,
                raceNumber: currentRaceNumber,
                heatNumber: currentHeatNumber,
                heatTotal: currentHeatTotal,
                startingPosition,
                carNumber,
                driverName: driverNameToStore,
                transponder: transponderToStore,
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
        root: HTMLElement,
        eventEntries: LiveTimeEventEntry[],
        roundHeatRows: ScrapedLiveTimeEventRoundHeat[]
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
            const avgLap = cols[6]?.text.trim() || null;
            const avgTop5 = cols[7]?.text.trim() || null;
            const avgTop10 = cols[8]?.text.trim() || null;
            const avgTop15 = cols[9]?.text.trim() || null;
            const top3Consecutive = cols[10]?.text.trim() || null;
            const stdDeviation = cols[11]?.text.trim() || null;
            const consistency = cols[12]?.text.trim() || null;

            if (!finishPosition || !driverName) return [];

            const linkedFromHeat = roundHeatRows.find((heatRow) =>
                heatRow.raceResultID === raceResultID
                && (
                    (carNumber !== null && heatRow.carNumber === carNumber)
                    || (heatRow.driverName || '').toLowerCase() === driverName.toLowerCase()
                )
                && heatRow.liveTimeEventEntryID !== null
            );

            const linkedEntry = linkedFromHeat?.liveTimeEventEntryID
                ? eventEntries.find((entry) => entry.id === linkedFromHeat.liveTimeEventEntryID) || null
                : resolveEntryLink(eventEntries, classHeaderText, driverName, { carNumber });
            const driverNameToStore = linkedEntry ? null : driverName;

            return [new ScrapedLiveTimeEventRoundResult({
                roundID,
                liveTimeEventEntryID: linkedEntry?.id ?? null,
                raceResultID,
                className: classHeaderText,
                raceNumber,
                finishPosition,
                carNumber,
                driverName: driverNameToStore,
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
        raceResultIDs: number[],
        eventEntries: LiveTimeEventEntry[],
        roundHeatRows: ScrapedLiveTimeEventRoundHeat[]
    ): Promise<void> {
        const uniqueRaceResultIDs = [...new Set(raceResultIDs.filter((id) => id > 0))];
        const allRows: ScrapedLiveTimeEventRoundResult[] = [];

        for (const raceResultID of uniqueRaceResultIDs) {
            try {
                const raceResultPageUrl = livetime.getLink(`/results/?p=view_race_result&id=${raceResultID}`);
                const raceResultPage = await ScraperUtils.scrapeAsHTML(raceResultPageUrl);
                const parsed = parseRoundResultsFromPage(roundID, raceResultID, raceResultPage, eventEntries, roundHeatRows);
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
        const persistedEntries = await LiveTimeEventEntries.getByEventId(event.event_id);

        for (const round of event.rounds) {
            try {
                const roundPageUrl = livetime.getLink(`/results/?p=view_heat_sheet&id=${round.roundID}`);
                const roundPage = await ScraperUtils.scrapeAsHTML(roundPageUrl);
                const heatRows = parseRoundHeatsFromPage(round.roundID, roundPage, persistedEntries);
                await LiveTimeEventRoundHeats.replaceForRound(
                    round.roundID,
                    heatRows.map((heatRow) => heatRow.toLiveTimeEventRoundHeat())
                );

                await upsertRoundResults(
                    round.roundID,
                    heatRows.map((heatRow) => heatRow.raceResultID || 0),
                    persistedEntries,
                    heatRows
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
        for (const event of events) {
            await hydrateEventFromEventPage(event);
            await upsertLiveTimeEvent(event);
            await upsertLiveTimeEventRounds(event);
            await upsertLiveTimeEventEntries(event);
            await upsertRoundHeats(event);
            await upsertTrackEvent(event);
            logger.info(`Upserted ${event.name} (LiveTime ID: ${event.event_id})`);
        }
        logger.info(`Upserted ${events.length} events into database`);
    }

    //Perform the scrape and upsert for events on livetime
    async function scrapeAndUpsertEvents(): Promise<void> {
        logger.info(`Starting scrape and upsert of LiveTime events...`);
        let eventsUrl = livetime.getLink(livetime.eventsPath);
        await ScraperUtils.scrapeAsHTML(eventsUrl).then(async html => {
            //1. Extract events from the html
            const events: ScrapedLiveTimeEvent[] = extractEventsFromPage(html);
            //2. Upsert each event into the relevant tables
            await upsertEvents(events);
        });
    }

    await scrapeAndUpsertEvents();
}