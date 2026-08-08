'use client'

import { useEffect, useState } from 'react'
import BriefContentHeader from '@/components/site/brief/brief.content.header'
import { RaceEventResultsByRound } from '@/components/site/results/race.event.round.results'
import RaceEventRoundClassDriverResults, { RaceEventDriverResult } from '@/components/site/results/race.event.round.class.driver.results'
import { Chip, Column, ContentWithIcon } from '@/components/ui/ui'
import API from '@/lib/api/api'

type RaceEventWinnerMap = Record<string, RaceEventDriverResult[]>

function getRoundPriority(roundName: string): number {
    if (/^main events$/i.test(roundName.trim())) return 1000

    const qualifierMatch = roundName.match(/^qualifier round\s+(\d+)$/i)
    if (qualifierMatch) {
        return parseInt(qualifierMatch[1], 10)
    }

    return -1
}

function sortRoundEntries(entries: [string, RaceEventDriverResult[]][]): [string, RaceEventDriverResult[]][] {
    return [...entries].sort(([leftName], [rightName]) => getRoundPriority(rightName) - getRoundPriority(leftName))
}

function getRoundWinners(classes: Record<string, RaceEventDriverResult[]>): RaceEventDriverResult[] {
    return Object.values(classes)
        .map((results) => results.find((result) => result.finishPosition === 1) || null)
        .filter((result): result is RaceEventDriverResult => result !== null)
}

function WinnerWithClass({ winner }: { winner: RaceEventDriverResult }) {
    return (
        <Column gap={1}>
            <Chip className="bg-black px-2 py-1 font-semibold text-white" width="auto">
                {winner.className || 'Unknown Class'}
            </Chip>
            <RaceEventRoundClassDriverResults result={winner} />
        </Column>
    )
}

function WinnersRoundSection({
    roundName,
    winners,
}: {
    roundName: string
    winners: RaceEventDriverResult[]
}) {
    return (
        <Column className="rounded border border-gray-300 bg-gray-50 p-3" gap={2}>
            <BriefContentHeader icon="fa-solid fa-trophy">{roundName}</BriefContentHeader>
            <Column gap={2}>
                {winners.map((winner) => (
                    <WinnerWithClass key={winner.id} winner={winner} />
                ))}
            </Column>
        </Column>
    )
}

export default function RaceEventWinners({
    eventId,
    showLastRoundOnly = false,
    className,
    style,
    width = '100%',
}: {
    eventId: number
    showLastRoundOnly?: boolean
    className?: string
    style?: React.CSSProperties
    width?: string
}) {
    const [winnersByRound, setWinnersByRound] = useState<RaceEventWinnerMap>({})
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        setIsLoading(true)

        API.getEventResults(eventId)
            .then((data) => {
                const resultsByRound = (data || {}) as RaceEventResultsByRound
                const nextWinners: RaceEventWinnerMap = {}

                for (const [roundName, classes] of Object.entries(resultsByRound)) {
                    const roundWinners = getRoundWinners(classes)
                    if (roundWinners.length > 0) {
                        nextWinners[roundName] = roundWinners
                    }
                }

                if (showLastRoundOnly) {
                    const sortedRounds = sortRoundEntries(Object.entries(nextWinners))
                    const lastRound = sortedRounds[0]
                    setWinnersByRound(lastRound ? { [lastRound[0]]: lastRound[1] } : {})
                    return
                }

                setWinnersByRound(nextWinners)
            })
            .catch(() => {
                setWinnersByRound({})
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [eventId, showLastRoundOnly])

    const orderedRounds = sortRoundEntries(Object.entries(winnersByRound))

    return (
        <Column className={className} style={{ maxWidth: width, width: '100%', ...style }} gap={3}>
            {isLoading && (
                <ContentWithIcon icon="fa-solid fa-arrows-rotate fa-spin">
                    Loading event winners...
                </ContentWithIcon>
            )}

            {!isLoading && Object.keys(winnersByRound).length === 0 && (
                <ContentWithIcon icon="fa-solid fa-flag-checkered">
                    No event winners available.
                </ContentWithIcon>
            )}

            {!isLoading && orderedRounds.map(([roundName, winners]) => (
                <WinnersRoundSection key={roundName} roundName={roundName} winners={winners} />
            ))}
        </Column>
    )
}
