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
}