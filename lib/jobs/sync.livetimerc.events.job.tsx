import Events from "@/lib/db/events";
import LiveTimeEventEntries from "@/lib/db/livetime.entries";
import LiveTimeEvents from "@/lib/db/livetime";
import LiveTimeEventRoundHeats from "@/lib/db/livetime.round.heats";
import LiveTimeEventRounds from "@/lib/db/livetime.rounds";
import { LiveTimeEventEntry } from "@prisma/client";
import Logger from "@/lib/utils/logger";
import { livetime } from "@/content/content";
import { HTMLElement } from 'node-html-parser';
import { ScraperUtils } from "../utils/scraper.utils";
import { ScrapedLiveTimeEvent } from "@/lib/jobs/models/scraped.livetime.event";
import { ScrapedLiveTimeEventRoundHeat } from "@/lib/jobs/models/scraped.livetime.event.round.heat";

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

            const matchingEntries = eventEntries.filter((entry) =>
                entry.className.toLowerCase() === currentClassName.toLowerCase()
                && entry.driverName.toLowerCase() === driverName.toLowerCase()
            );
            const linkedEntry = matchingEntries.length === 1 ? matchingEntries[0] : null;

            heatRows.push(new ScrapedLiveTimeEventRoundHeat({
                roundID,
                liveTimeEventEntryID: linkedEntry?.id ?? null,
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