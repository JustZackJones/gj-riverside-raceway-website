export const livetime = {
    baseUrl: 'https://jjsraceway.liverc.com/',
    trackName: "JJ's Raceway",
    eventsPath: 'events/',
    resultsPath: 'results/?p=view_event&id=',
    getLink: (path: string) => {
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
        return `${livetime.baseUrl}${normalizedPath}`;
    },
    getResultLink: (eventId: number) => `${livetime.baseUrl}${livetime.resultsPath}${eventId}`,

    getCurrentEventLink: () => livetime.getLink('results'),

    getEventResultsLink: (eventId: number) => livetime.getLink(`results/?p=view_event&id=${eventId}`),
    getRoundResultsLink: (roundId: number) => livetime.getLink(`results/?p=view_heat_sheet&id=${roundId}`),
    getHeatResultsLink: (raceId: number) => livetime.getLink(`results/?p=view_race_result&id=${raceId}`),
}