'use client'

import { useEffect, useState } from 'react'
import BriefContentHeader from '@/components/site/brief/brief.content.header'
import RaceEventRoundClassResults from '@/components/site/results/race.event.round.class.results'
import { RaceEventDriverResult } from '@/components/site/results/race.event.round.class.driver.results'
import { Column, ContentWithIcon } from '@/components/ui/ui'
import API from '@/lib/api/api'

export type RaceEventRoundResultsByClass = Record<string, RaceEventDriverResult[]>
export type RaceEventResultsByRound = Record<string, RaceEventRoundResultsByClass>

function getRoundPriority(roundName: string): number {
	if (/^main events$/i.test(roundName.trim())) return 1000

	const qualifierMatch = roundName.match(/^qualifier round\s+(\d+)$/i)
	if (qualifierMatch) {
		return parseInt(qualifierMatch[1], 10)
	}

	return -1
}

function sortRoundEntries(entries: [string, RaceEventRoundResultsByClass][]): [string, RaceEventRoundResultsByClass][] {
	return [...entries].sort(([leftName], [rightName]) => getRoundPriority(rightName) - getRoundPriority(leftName))
}

function RoundResultsSection({
	roundName,
	classes,
}: {
	roundName: string
	classes: RaceEventRoundResultsByClass
}) {
	return (
		<Column className="rounded border border-gray-300 bg-white p-3" gap={3}>
			<BriefContentHeader icon="fa-solid fa-trophy">{roundName}</BriefContentHeader>
			<Column gap={3}>
				{Object.entries(classes).map(([className, results]) => (
					<RaceEventRoundClassResults key={className} className={className} results={results} />
				))}
			</Column>
		</Column>
	)
}

export default function RaceEventRoundResults({
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
	const [resultsByRound, setResultsByRound] = useState<RaceEventResultsByRound>({})
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		setIsLoading(true)

		API.getEventResults(eventId)
			.then((data) => {
				const nextResults = (data || {}) as RaceEventResultsByRound

				if (showLastRoundOnly) {
					const sortedRounds = sortRoundEntries(Object.entries(nextResults))
					const lastRound = sortedRounds[0]
					setResultsByRound(lastRound ? { [lastRound[0]]: lastRound[1] } : {})
					return
				}

				setResultsByRound(nextResults)
			})
			.catch(() => {
				setResultsByRound({})
			})
			.finally(() => {
				setIsLoading(false)
			})
	}, [eventId, showLastRoundOnly])

	const orderedRounds = sortRoundEntries(Object.entries(resultsByRound))

	return (
		<Column className={className} style={{ maxWidth: width, width: '100%', ...style }} gap={3}>
			{isLoading && (
				<ContentWithIcon icon="fa-solid fa-arrows-rotate fa-spin">
					Loading race results...
				</ContentWithIcon>
			)}

			{!isLoading && Object.keys(resultsByRound).length === 0 && (
				<ContentWithIcon icon="fa-solid fa-flag-checkered">
					No race results available.
				</ContentWithIcon>
			)}

			{!isLoading && orderedRounds.map(([roundName, classes]) => (
				<RoundResultsSection key={roundName} roundName={roundName} classes={classes} />
			))}
		</Column>
	)
}
