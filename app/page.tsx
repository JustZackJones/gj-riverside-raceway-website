'use client'

import TrackSocialsContainer from '@/components/site/socials/track.socials.container'
import SiteHomeBanner from '@/components/site/site.home.banner'

import { Button, Column, ContentWithIcon, InfoWithSubtext, Row } from '@/components/ui/ui'

import TrackUpcomingSchedule from '@/components/site/schedule/track.upcoming.schedule'
import RacePricing from '@/components/site/pricing/race.pricing'
import RaceAgenda from '@/components/site/agenda/race.agenda'
import RaceClasses from '@/components/site/classes/race.classes'
import SiteInfoBanner from '@/components/site/info-banner/site.info.banner'
import RaceAwards from '@/components/site/awards/race.awards'
import RaceEventRoundResults from '@/components/site/results/race.event.round.results'
import RaceEventWinners from '@/components/site/results/race.event.winners'

export default function Home() {

    function FullWidthRow({children, className}: {children: React.ReactNode, className?: string}) {
        return (
            <Row collapsible fullWidth justify="center" align="center" className={`${className} py-4`}>
                {children}
            </Row>
        )    
    }

    function checkQueryParam(param: string, readValue: boolean): string | boolean | null {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (readValue) return params.get(param);
            return params.has(param);
        } else {
            if (readValue) return null;
            return false;
        }
    }

    function getQueryParam(param: string) { return checkQueryParam(param, true); }

    function hasQueryParam(param: string) { return checkQueryParam(param, false); }

    function getResultsEventId(): number | null {
        const value = getQueryParam('results');
        if (typeof value !== 'string') return null;

        const eventId = parseInt(value, 10);
        return Number.isFinite(eventId) ? eventId : null;
    }

    function withAwards() { return hasQueryParam('awards');}

    let whiteRow = true;
    //Alternate row colors for the home page rows
    function getNextRowClass(whiteOverride: boolean | undefined = undefined): string {
        let isWhite = whiteOverride ?? whiteRow;
        const rowClass = isWhite ? 'bg-white' : 'bg-gray-200';
        whiteRow = !isWhite;
        return rowClass;
    }

    // Main body of the home page
    function SiteHomeBody() {
        const resultsEventId = getResultsEventId();

        return (
            <>
                {/* Home page banner is identical for any screen size*/}
                <SiteHomeBanner />
                <section>
                    {/* Dynamic Info Row is identical for any screen size */}
                    <FullWidthRow className={`track-info ${getNextRowClass(true)}`}>
                        <SiteInfoBanner/>
                    </FullWidthRow>

                    {/* Large Screen */}
                    <div className='hidden lg:block'>
                        {/* Combined schedule & pricing for large screens only */}
                        <FullWidthRow className={`race-schedule race-agenda race-pricing ${getNextRowClass(false)}`}>
                            <TrackUpcomingSchedule className='px-1' style={{margin: "0px 0px auto auto"}}/>
                            <RaceAgenda className='px-1' style={{margin: "0px 0px auto 0px"}}/>
                            <RacePricing  className='px-1' style={{margin: "0px auto auto 0px"}}/>
                        </FullWidthRow>
                        {/* Combined classes & Awards Container */}
                        <FullWidthRow className={`race-classes ${getNextRowClass()}`}>
                            <RaceClasses width="700px" style={{margin: `0px ${withAwards() ? "0px" : "auto"} 0px auto`}}/>
                            {withAwards() && (
                            <RaceAwards style={{margin: "0px auto 0px 0px"}}/>
                            )}
                        </FullWidthRow>

                    </div>

                    {/* Non-Large Screens */}
                    <div className='block lg:hidden'>
                        {/* Upcoming Events Container */}
                        <FullWidthRow className={`track-schedule ${getNextRowClass(false)}`}>
                            <TrackUpcomingSchedule style={{margin: "0px auto"}}/>
                        </FullWidthRow>

                        {/* Race Agenda Container */}
                        <FullWidthRow className={`race-agenda ${getNextRowClass()}`}>
                            <RaceAgenda style={{margin: "0px auto"}}/>
                        </FullWidthRow>

                        {/* Classes Container */}
                        <FullWidthRow className={`race-classes ${getNextRowClass()}`}>
                            <RaceClasses style={{margin: "0px auto"}}/>
                        </FullWidthRow>

                        {/* Pricing Container */}
                        <FullWidthRow className={`race-pricing ${getNextRowClass()}`}>
                            <RacePricing style={{margin: "0px auto"}}/>
                        </FullWidthRow>

                        {/* Awards Container */}
                        {withAwards() && (
                        <FullWidthRow className={`race-awards ${getNextRowClass()}`}>
                            <RaceAwards style={{margin: "0px auto"}}/>
                        </FullWidthRow>
                        )}
                    </div>

                    {resultsEventId !== null && (
                        <>
                    <FullWidthRow className={`race-results ${getNextRowClass()}`}>
                        <RaceEventRoundResults
                            eventId={resultsEventId}
                            width="1100px"
                            style={{margin: '0px auto'}}
                            showLastRoundOnly
                        />
                    </FullWidthRow>
                    <FullWidthRow className={`race-results ${getNextRowClass()}`}>
                        <RaceEventWinners 
                            eventId={resultsEventId}
                            width="1100px"
                            style={{margin: '0px auto'}}
                            showLastRoundOnly
                        />
                    </FullWidthRow>
                    </>
                    )}

                    {/* Socials Container is identical for any screen size*/}
                    <FullWidthRow className="track-socials">
                        <TrackSocialsContainer />
                    </FullWidthRow>
                </section>
            </>
        )
    }

    return (<SiteHomeBody/>)
}