'use client'
import { useState, useEffect, useCallback } from 'react'
import TrackScheduleUtils, { ScheduleEvent } from '@/lib/utils/track.schedule.utils'
import { ContentWithIcon, Column, Row } from '@/components/ui/ui'
import BriefContentHeader from '@/components/site/brief/brief.content.header';
import RaceUpcomingEvent from '@/components/site/schedule/race.upcoming.event';
import { facebook } from '@/content/content';

export default function TrackUpcomingSchedule({className, style, width = "350px"}: {className?: string, style?: React.CSSProperties, width?: string}) {
    const [events, setEvents] = useState<ScheduleEvent[]>([])
    const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true);
    useEffect(TrackScheduleUtils.getUpcomingEventsEvents.bind(null, onUpcomingEventsLoaded, true, 4), [])

    function onUpcomingEventsLoaded(events: ScheduleEvent[]) {
        setEvents(events)
        setIsLoadingEvents(false);
    }

    function EventRows() {
        return (
            <>
                {isLoadingEvents && (
                    <ContentWithIcon icon="fa-solid fa-arrows-rotate fa-spin">Loading upcoming races...</ContentWithIcon>
                )}
                {!isLoadingEvents && events.length === 0 && (
                    <ContentWithIcon icon="fa-brands fa-facebook">
                        {facebook.checkMeContent()}
                    </ContentWithIcon>
                )}
                {events.map((event) => (
                    <RaceUpcomingEvent key={event.id} event={event} />
                ))}
            </>
        )
    }

    return (
        <Column className={className} style={{maxWidth: width, width, ...style}}>
            <BriefContentHeader icon="fa-solid fa-flag-checkered">Upcoming Races</BriefContentHeader>
            <EventRows/>
        </Column>
    )
}
