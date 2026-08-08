import HTTP from "@/lib/api/http";
import Logger from "@/lib/utils/logger";

export default class API {
    static logger: Logger = new Logger('API');

    static BASE_URL = '/api/'

    static route(route: string) {
        return `${API.BASE_URL}${route}`
    }

    static eventRoute(route: string = '') {
        if (route && !route.startsWith('/')) route = `/${route}`;
        return API.route(`events${route}`)
    }

    static async getEvents() {
        const route = API.eventRoute()
        API.logger.info(`Fetching events from API... ${route}`);
        return await HTTP.GET(route)
    }

    static async getUpcomingEvents(includeCancelled: boolean = false, limit: number = 4) {
        const route = API.eventRoute(`upcoming?includeCancelled=${includeCancelled}&limit=${limit}`)
        API.logger.info(`Fetching upcoming events from API... ${route}`);
        return await HTTP.GET(route)
    }

    static async getPreviousEvents(includeCancelled: boolean = false, limit?: number) {
        let route = API.eventRoute(`previous?includeCancelled=${includeCancelled}`)
        if (typeof limit === 'number') {
            route = `${route}&limit=${limit}`
        }
        API.logger.info(`Fetching previous events from API... ${route}`);
        return await HTTP.GET(route)
    }

    static async getEventResults(eventId: number) {
        const route = API.eventRoute(`results/${eventId}`)
        API.logger.info(`Fetching event results from API... ${route}`);
        return await HTTP.GET(route)
    }

    static async getLastFinishedEventResults() {
        const route = API.eventRoute(`last-finished/results`)
        API.logger.info(`Fetching last finished event results from API... ${route}`);
        return await HTTP.GET(route)
    }

    static async getLastFinishedEventWinners() {
        const route = API.eventRoute(`last-finished/winners`)
        API.logger.info(`Fetching last finished event winners from API... ${route}`);
        return await HTTP.GET(route)
    }
}