import { prisma } from '@/lib/prisma'
import { LiveTimeEventOrderBy, SortOrder } from './types'
import { LiveTimeEvent, Prisma } from '@prisma/client'

export default class LiveTimeEvents {
    static async getMany(sort: SortOrder = 'desc', orderBy: LiveTimeEventOrderBy = 'startedAt', limit?: number): Promise<LiveTimeEvent[]> {
        return prisma.liveTimeEvent.findMany({ 
            orderBy: { [orderBy]: sort }, 
            take: limit,
        })
    }
    static async getById(id: number): Promise<LiveTimeEvent | null> {
        return prisma.liveTimeEvent.findUnique({ 
            where: { id },
        })
    }
    static async getFirstEventBefore(date?: Date | null): Promise<LiveTimeEvent | null> {
        return prisma.liveTimeEvent.findFirst({
            where: { startedAt: { lt: date ? date : new Date() } },
            orderBy: { startedAt: 'desc' },
        })
    }
    static async getLastFinishedEvent(): Promise<LiveTimeEvent | null> {
       return this.getFirstEventBefore(new Date());
    }
    static async getLastLastFinishedEvent(): Promise<LiveTimeEvent | null> {
        const lastFinishedEvent = await this.getLastFinishedEvent();
        if (!lastFinishedEvent) return null;
        if (!lastFinishedEvent.startedAt) return null;
        return this.getFirstEventBefore(lastFinishedEvent.startedAt);
    }
    static async create(data: Prisma.LiveTimeEventCreateInput): Promise<LiveTimeEvent> {
        return prisma.liveTimeEvent.create({ data })
    }
    static async update(id: number, data: Prisma.LiveTimeEventUpdateInput): Promise<LiveTimeEvent> {
        return prisma.liveTimeEvent.update({ where: { id }, data })
    }
    static async upsert(id: number, data: Prisma.LiveTimeEventCreateInput): Promise<LiveTimeEvent> {
        return prisma.liveTimeEvent.upsert({ where: { id }, create: data, update: data })
    }
    static async delete(id: number): Promise<LiveTimeEvent> {
        return prisma.liveTimeEvent.delete({ where: { id } })
    }
}


