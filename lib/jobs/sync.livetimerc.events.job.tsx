import Events from "@/lib/db/events";
import LiveTimeEventEntries from "@/lib/db/livetime.entries";
import LiveTimeEvents from "@/lib/db/livetime";
import LiveTimeEventRounds from "@/lib/db/livetime.rounds";
import Logger from "@/lib/utils/logger";
import { livetime } from "@/content/content";
import { HTMLElement } from 'node-html-parser';
import { ScraperUtils } from "../utils/scraper.utils";
import { ScrapedLiveTimeEvent } from "@/lib/jobs/models/scraped.livetime.event";

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