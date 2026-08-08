import API from "@/lib/api/api"
import { Event as RBCEvent } from "react-big-calendar"
import { events, Event, livetime } from "@/content/content"
import TimeUtils from "@/lib/utils/time"
export type ScheduleEventStatus = 'cancelled' | 'finished' | 'upcoming' | 'registering' | 'running' | 'today';
export default class TrackScheduleUtils {

    //Gets the event agenda information based on the event date
    static getEventAgendaByEvent(event: ScheduleEvent): Event {
        let dayOfTheWeek = TimeUtils.getDayOfTheWeek(event.start, false);
        return events[dayOfTheWeek.toLowerCase() as keyof typeof events];
    }

    //Checks if the event was cancelled
    static eventIsCancelled(event: ScheduleEvent): boolean {
        return event.cancelled === true
    }
    //Checks if the event has finished (based on end date)
    static eventIsFinished(event: ScheduleEvent): boolean {
        const endDate = TimeUtils.getMidnight(new Date(event.end));
        const today = TimeUtils.getMidnightToday();
        return endDate < today
    }

    //Based on the agenda, check if the event is in the "registering" phase
    static eventIsRegistering(event: ScheduleEvent): boolean {
        let eventInfo = TrackScheduleUtils.getEventAgendaByEvent(event);
        let isRegistering = false;
        if (eventInfo) {
            const now = new Date();
            const startDate = new Date(event.start);
            const opensAt = TimeUtils.getDateWithStringTime(startDate, eventInfo.doorsOpen);
            const registeringEnds = TimeUtils.getDateWithStringTime(startDate, eventInfo.racingStart);
            isRegistering = now >= opensAt && now < registeringEnds;
        }
        return isRegistering
    }
        //Based on the agenda, check if the event is in the "running" phase
    static eventIsRunning(event: any): boolean {
        let eventInfo = TrackScheduleUtils.getEventAgendaByEvent(event);
        let isRunning = false;
        if (eventInfo) {
            const now = new Date();
            const startDate = new Date(event.start);
            const raceStart = TimeUtils.getDateWithStringTime(startDate, eventInfo.racingStart);
            const racingEnds = TimeUtils.getMidnight(startDate, 1);
            isRunning = now >= raceStart && now < racingEnds;
        }
        return isRunning
    }
    //Checks if the event is happening today
    static eventIsToday(event: any): boolean {
        return TimeUtils.getMidnightToday().toDateString() === TimeUtils.getMidnight(new Date(event.start)).toDateString()
    }
    //Checks if the event is upcoming (based on start date)
    static eventIsUpcoming(event: any): boolean {
        return new Date(event.start) > new Date()
    }

    static getEventStatus(event: any): ScheduleEventStatus {
        if (this.eventIsCancelled(event))       return 'cancelled'
        else if (this.eventIsFinished(event))   return 'finished'
        else if (this.eventIsRegistering(event))return 'registering'
        else if (this.eventIsRunning(event))    return 'running'
        else if (this.eventIsToday(event))      return 'today'
        else                                    return 'upcoming'
    }

    static getEventStatusText(event: any): string {
        let status: string;
        let eventInfo = TrackScheduleUtils.getEventAgendaByEvent(event);
        //If the event is NOT running today. use the event name from the agenda or day of the week
        //  I.E. "Tuesday", "Saturday"
        if (!TrackScheduleUtils.eventIsToday(event)) status = eventInfo.name
        else {
            status = this.getEventStatus(event);
            status = status.charAt(0).toUpperCase() + status.slice(1); // Capitalize first letter
        }
        return status
    }

    static getEventStatusClassByName(status: ScheduleEventStatus): string {
        let base = `rounded min-w-[75px] flex items-center justify-center`
        if (status === 'cancelled')         return `${base} bg-red-100 text-red-800` 
        else if (status === 'finished')     return `${base} bg-green-100 text-green-800`
        else if (status === 'registering')  return `${base} bg-checkerboard text-white font-bold text-outline-black `
        else if (status === 'running')      return `${base} bg-checkerboard text-white font-bold text-outline-black `
        else if (status === 'today')        return `${base} bg-checkerboard text-white font-bold text-outline-black `
        else                                return `${base} bg-blue-100 text-blue-800`
    }

    static getEventStatusColorByName(status: ScheduleEventStatus): string {
        if (status === 'cancelled')         return '#ef4444' // red
        else if (status === 'finished')     return '#22c55e' // green
        else if (status === 'registering')  return '#ffffff' // white
        else if (status === 'running')      return '#ffffff' // white
        else if (status === 'today')        return '#ffffff' // white
        else                                return '#3b82f6' // blue
    }

    static getEventStatusIconByName(status: ScheduleEventStatus): string {
        if (status === 'cancelled')         return 'fa-solid fa-xmark-circle'
        else if (status === 'finished')     return 'fa-solid fa-check-circle'
        else if (status === 'registering')  return 'fa-solid fa-list-check'
        else if (status === 'running')      return 'fa-solid fa-forward'
        else if (status === 'today')        return 'fa-solid fa-calendar-check'
        else                                return 'fa-solid fa-calendar-day'
    }

    static getEventStatusClass(event: ScheduleEvent): string {
        let eventInfo = TrackScheduleUtils.getEventAgendaByEvent(event);
        //If the event is NOT running today. use the event class from the agenda
        //  I.E. use the tuesday or saturday class
        if (!TrackScheduleUtils.eventIsToday(event)) return eventInfo?.chipClass || ""
        else return this.getEventStatusClassByName(this.getEventStatus(event));
    }

    static getEventStatusColor(event: ScheduleEvent): string {
        return this.getEventStatusColorByName(this.getEventStatus(event));
    }

    static getEventStatusIcon(event: ScheduleEvent): string {
        return this.getEventStatusIconByName(this.getEventStatus(event));
    }

    private static toBriefTitle(title: string): string {
        const maxLength = 20;
        const ellipsis = "...";
        if (title.length <= maxLength) return title.trim();

        const lastSpace = title.lastIndexOf(" ");
        // If the last space is within the last 10 chars, cut at the last space and add ellipsis
        if (lastSpace !== -1 && title.length - lastSpace <= 10) {
            return title.substring(0, lastSpace).trim() + ellipsis;
        }
        // Otherwise, chop and add ellipsis
        return title.substring(0, maxLength - ellipsis.length).trim() + ellipsis;
    }

    static formatEvents(rawEvents: any[]): ScheduleEvent[] {
        return rawEvents.map((event: any) => ({
            id: event.id,
            title: event.name,
            briefTitle: TrackScheduleUtils.toBriefTitle(event.name),
            start: new Date(event.start),
            end: new Date(event.end),
            cancelled: event.cancelled,
            description: event.description,
            status: TrackScheduleUtils.getEventStatus(event),
            statusText: TrackScheduleUtils.getEventStatusText(event),
            statusColor: TrackScheduleUtils.getEventStatusColor(event),
            statusClass: TrackScheduleUtils.getEventStatusClass(event),
            statusIcon: TrackScheduleUtils.getEventStatusIcon(event),
            ...event.liveTimeEvent,
            link: event.livetimeID ? livetime.getResultLink(event.livetimeID) : undefined,
        }))
    }

    static formatAndSetEvents(rawEvents: any[], setterCallback: (events: ScheduleEvent[]) => void): ScheduleEvent[] {
        const events = TrackScheduleUtils.formatEvents(rawEvents);
        setterCallback(events);
        return events;
    }

    static getAllScheduleEvents(setterCallback: (events: ScheduleEvent[]) => void): void {
        API.getEvents().then((data) => {
            TrackScheduleUtils.formatAndSetEvents(data, setterCallback);
        })
    }

    static getUpcomingEventsEvents(setterCallback: (events: ScheduleEvent[]) => void, includeCancelled: boolean = false, limit: number = 4): void {
        API.getUpcomingEvents(includeCancelled, limit).then((data) => {
            TrackScheduleUtils.formatAndSetEvents(data, setterCallback);
        })
    }
}

export interface ScheduleEvent extends RBCEvent {
    id: number
    title: string
    briefTitle: string
    start: Date
    end: Date
    cancelled: boolean
    description?: string
    status: ScheduleEventStatus
    statusText: string,
    statusColor: string
    statusClass: string
    statusIcon: string,
    liveTimeId: number
    entries?: number
    drivers?: number
    laps?: number
    link: string | undefined
}