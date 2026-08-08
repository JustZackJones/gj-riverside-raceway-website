'use client'
import { events } from '@/content/content';
import { Column } from '@/components/ui/ui'
import BriefContentHeader from '@/components/site/brief/brief.content.header';
import RaceEventAgenda from '@/components/site/agenda/race.event.agenda';
import { SiteFaceBookMessageDisplayForPractice } from '../site.facebook.message.display';

export default function RaceAgenda({className, style, width = "350px"}: {className?: string, style?: React.CSSProperties, width?: string}) {
    return (
        <Column className={className} style={{ maxWidth: width, width, ...style}}>
            <BriefContentHeader icon="fa-solid fa-clock">Agenda</BriefContentHeader>
            <RaceEventAgenda event={events.tuesday} />
            <RaceEventAgenda event={events.saturday} />
            <SiteFaceBookMessageDisplayForPractice/>
        </Column>
    )
}
