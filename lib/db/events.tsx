import { prisma } from '@/lib/prisma'
import { SortOrder, TrackEventOrderBy, TrackEventWithLiveTime } from './types'
import { TrackEvent, Prisma } from '@prisma/client'

export default class Events {
    static async getMany(sort: SortOrder = 'desc', orderBy: TrackEventOrderBy = 'start', limit?: number, includeType: boolean = true): Promise<TrackEvent[] | TrackEventWithLiveTime[]> {
        return prisma.trackEvent.findMany({ 
            orderBy: { [orderBy]: sort }, 
            take: limit,
            include: includeType ? { liveTimeEvent: true } : undefined
        })
    }
    static async getById(id: number, includeType: boolean = true): Promise<TrackEvent | TrackEventWithLiveTime | null> {
        return prisma.trackEvent.findUnique({ 
            where: { id },
            include: includeType ? { liveTimeEvent: true } : undefined
        })
    }
    static async create(data: Prisma.TrackEventCreateInput): Promise<TrackEvent> {
        return prisma.trackEvent.create({ data })
    }
    static async update(id: number, data: Prisma.TrackEventUpdateInput): Promise<TrackEvent> {
        return prisma.trackEvent.update({ where: { id }, data })
    }
    static async updateByLiveTimeId(livetimeID: number, data: Prisma.TrackEventUpdateInput): Promise<TrackEvent> {
        return prisma.trackEvent.update({
            where: { livetimeID },
            data
        })
    }
    static async upsert(id: number, data: Prisma.TrackEventCreateInput): Promise<TrackEvent> {
        return prisma.trackEvent.upsert({ where: { id }, create: data, update: data })
    }
    static async upsertByLiveTimeId(livetimeID: number, data: Prisma.TrackEventCreateInput): Promise<TrackEvent> {
        return prisma.trackEvent.upsert({
            where: { livetimeID },
            create: data,
            update: data
        })
    }
    static async delete(id: number): Promise<TrackEvent> {
        return prisma.trackEvent.delete({ where: { id } })
    }

    static async getPrevious(includeCancelled: boolean = false, limit: number = 10, sort: SortOrder = 'desc', orderBy: TrackEventOrderBy = 'start'): Promise<TrackEventWithLiveTime[]> {
        let tomorrowAtMidnight = new Date()
        tomorrowAtMidnight.setHours(0, 0, 0, 0)
        tomorrowAtMidnight.setDate(tomorrowAtMidnight.getDate() + 1);
        return prisma.trackEvent.findMany({
            where: {
                end: { lt: tomorrowAtMidnight },
                visible: true,
                cancelled: includeCancelled ? undefined : false
            },
            orderBy: { [orderBy]: sort },
            take: limit,
            include: { liveTimeEvent: true }
        })
    }

    //Business Logic for events
    static async getUpcoming(includeCancelled: boolean = false, limit: number = 10, sort: SortOrder = 'asc', orderBy: TrackEventOrderBy = 'start'): Promise<TrackEventWithLiveTime[]> {
        let todayAtMidnight = new Date()
        todayAtMidnight.setHours(0, 0, 0, 0)
        return prisma.trackEvent.findMany({
            where: {
                end: { gte: todayAtMidnight },
                visible: true,
                cancelled: includeCancelled ? undefined : false
            },
            orderBy: { [orderBy]: sort },
            take: limit,
            include: { liveTimeEvent: true }
        })
    }
    static async getVisible(sort: SortOrder = 'desc', orderBy: TrackEventOrderBy = 'start'): Promise<TrackEventWithLiveTime[]> {
        return prisma.trackEvent.findMany({
            where: { visible: true, cancelled: false },
            orderBy: { [orderBy]: sort },
            include: { liveTimeEvent: true }
        })
    }
    static async getCancelled(sort: SortOrder = 'desc', orderBy: TrackEventOrderBy = 'start'): Promise<TrackEventWithLiveTime[]> {
        return prisma.trackEvent.findMany({
            where: { cancelled: true },
            orderBy: { [orderBy]: sort },
            include: { liveTimeEvent: true }
        })
    }

    static async cancel(id: number): Promise<TrackEvent> {
        return prisma.trackEvent.update({
            where: { id },
            data: { cancelled: true }
        })
    }
    static async uncancel(id: number): Promise<TrackEvent> {
        return prisma.trackEvent.update({
            where: { id },
            data: { cancelled: false }
        })
    }
}


