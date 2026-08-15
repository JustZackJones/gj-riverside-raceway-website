'use client'

import { Column, ContentWithIcon, Row } from '@/components/ui/ui'
import TrackScheduleUtils, { ScheduleEvent } from '@/lib/utils/track.schedule.utils'
import { useState, useEffect } from 'react'
import TimeUtils from '@/lib/utils/time'
import { SiteFaceBookMessageDisplayForPractice } from '../site.facebook.message.display'
import SiteInfoContent from './site.info.content'
import LiveTimeEventButton from '../buttons/livetime.event.button'
import { facebook } from '@/content/content'

export default function SiteInfoBanner() {
    const [loading, setLoading] = useState<boolean>(true);
    const [nextEvent, setNextEvent] = useState<ScheduleEvent | null>(null);
    useEffect(TrackScheduleUtils.getUpcomingEventsEvents.bind(null, (event: ScheduleEvent[]) => {
        setNextEvent(event[0] || null);
        setLoading(false);
    }, true, 1), []);

    function SiteFacebook() { return (<SiteFaceBookMessageDisplayForPractice className="px-4"/>) }

    function isLoading(): boolean                   { return loading; }
    function hasNextEvent(): boolean                { return nextEvent !== null; }
    function hasEventToday(): boolean               { return hasNextEvent() && TrackScheduleUtils.eventIsToday(nextEvent);  }
    function hasUpcomingEventNotToday(): boolean    { return hasNextEvent() && TrackScheduleUtils.eventIsUpcoming(nextEvent); }
    function hasUpcomingEventToday(): boolean       { return hasEventToday() && nextEvent?.status === 'today'; }
    function hasOpenEventToday(): boolean           { return hasEventToday() && nextEvent?.status === 'running'; }
    function hasRegisteringEventToday(): boolean    { return hasEventToday() && nextEvent?.status === 'registering'; }

    function loadingEventInfo() {
        return <SiteInfoContent aIcon={`fa-solid fa-rotate fa-spin`} a={`Loading upcoming race...`} c={<SiteFacebook/>} />
    }

    function RegisteringEventInfo() {
        return <SiteInfoContent aIcon={nextEvent!.statusIcon} a={`Registration open for todays race!`} d={<LiveTimeEventButton event={nextEvent!} />} />
    }
        
    function RunningEventInfo() {
        return <SiteInfoContent aIcon={nextEvent!.statusIcon} a={`${nextEvent!.briefTitle} in progress!`} d={<LiveTimeEventButton event={nextEvent!} />} />
    }

    function TodaysEventInfo() {
        let agendaEvent = TrackScheduleUtils.getEventAgendaByEvent(nextEvent!);
        let opensAt = TimeUtils.formatTimeFromString(agendaEvent!.doorsOpen);
        return <SiteInfoContent aIcon={nextEvent!.statusIcon} a={`${nextEvent!.title} today!`} b={`Doors Open at ${opensAt}`} d={<LiveTimeEventButton event={nextEvent!} />} />
    }

    function NotTodayEventInfo() {
        let nextRaceDate = TimeUtils.getShortDateString(nextEvent!.start, false, true)
        return <SiteInfoContent aIcon={nextEvent!.statusIcon} a={`Next race ${nextRaceDate}`} c={<SiteFacebook/>} />
    }

    function DefaultInfo() {
        return <SiteInfoContent aIcon={`fa-brands fa-facebook`} a={facebook.checkMeContent()} c={<SiteFacebook/>} />
    }

    function SiteInfo() {
        if (isLoading())                        return loadingEventInfo();
        else if (hasRegisteringEventToday())    return RegisteringEventInfo();
        else if (hasOpenEventToday())           return RunningEventInfo();
        else if (hasUpcomingEventToday())       return TodaysEventInfo();
        else if (hasUpcomingEventNotToday())    return NotTodayEventInfo();
        else                                    return DefaultInfo();
    }

    return (
        <>
            <Column>
                <Row collapsible gap={2}>
                    <SiteInfo/>
                </Row>
            </Column>
        </>
    )
}