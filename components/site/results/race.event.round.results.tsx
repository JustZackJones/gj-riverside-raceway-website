'use client'

import { useEffect, useState } from 'react'
import BriefContentHeader from '@/components/site/brief/brief.content.header'
import RaceEventRoundClassResults from '@/components/site/results/race.event.round.class.results'
import { RaceEventDriverResult } from '@/components/site/results/race.event.round.class.driver.results'
import { Column, ContentWithIcon } from '@/components/ui/ui'
import API from '@/lib/api/api'

export type RaceEventRoundResultsByClass = Record<string, RaceEventDriverResult[]>
export type RaceEventResultsByRound = Record<string, RaceEventRoundResultsByClass>

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
	className,
	style,
	width = '100%',
}: {
	eventId: number
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
				setResultsByRound((data || {}) as RaceEventResultsByRound)
			})
			.catch(() => {
				setResultsByRound({})
			})
			.finally(() => {
				setIsLoading(false)
			})
	}, [eventId])

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

			{!isLoading && Object.entries(resultsByRound).map(([roundName, classes]) => (
				<RoundResultsSection key={roundName} roundName={roundName} classes={classes} />
			))}
		</Column>
	)
}
