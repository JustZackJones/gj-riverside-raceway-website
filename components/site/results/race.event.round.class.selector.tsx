'use client'

import { useEffect, useMemo, useState } from 'react'
import BriefContentHeader from '@/components/site/brief/brief.content.header'
import RaceEventRoundClassResults from '@/components/site/results/race.event.round.class.results'
import { RaceEventDriverResult } from '@/components/site/results/race.event.round.class.driver.results'
import Select from '@/components/ui/select'
import { Column, ContentWithIcon } from '@/components/ui/ui'
import API from '@/lib/api/api'
import { livetime } from '@/content/content'

type RaceEventRoundResultsByClass = Record<string, RaceEventDriverResult[]>
type RaceEventResultsByRound = Record<string, RaceEventRoundResultsByClass>

type SelectableEvent = {
	id: number
	livetimeID?: number | null
	name: string
	start?: string | Date | null
	liveTimeEvent?: {
		name?: string | null
	} | null
}

function getRoundPriority(roundName: string): number {
	if (/^main events$/i.test(roundName.trim())) return 1000

	const qualifierMatch = roundName.match(/^qualifier round\s+(\d+)$/i)
	if (qualifierMatch) {
		return parseInt(qualifierMatch[1], 10)
	}

	return -1
}

function sortRoundNames(roundNames: string[]): string[] {
	return [...roundNames].sort((leftName, rightName) => getRoundPriority(rightName) - getRoundPriority(leftName))
}


function getEventDisplayLabel(event: SelectableEvent): string {
	return event.name || event.liveTimeEvent?.name || `Event #${event.id}`
}

export default function RaceEventRoundClassSelector({
	initialEventId,
	className,
	style,
	width = '1100px',
	startCollapsed = false,
}: {
	initialEventId?: number
	className?: string
	style?: React.CSSProperties
	width?: string
	startCollapsed?: boolean
}) {
	const [events, setEvents] = useState<SelectableEvent[]>([])
	const [selectedLiveTimeEventId, setSelectedLiveTimeEventId] = useState<number | null>(null)
	const [resultsByRound, setResultsByRound] = useState<RaceEventResultsByRound>({})
	const [selectedRoundName, setSelectedRoundName] = useState<string>('')
	const [selectedClassName, setSelectedClassName] = useState<string>('')
	const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true)
	const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false)
	const eventsWithLiveTimeId = useMemo(() => events.filter((event) => typeof event.livetimeID === 'number'), [events])

	useEffect(() => {
		setIsLoadingEvents(true)

		API.getPreviousEvents(false, 500)
			.then((data) => {
				const nextEvents = (Array.isArray(data) ? data : []) as SelectableEvent[]
				setEvents(nextEvents)

				if (nextEvents.length === 0) {
					setSelectedLiveTimeEventId(null)
					return
				}

				const matchingInitial = typeof initialEventId === 'number'
					? nextEvents.find((event) => event.livetimeID === initialEventId)
					: null

				const fallbackEvent = nextEvents.find((event) => typeof event.livetimeID === 'number') || null
				setSelectedLiveTimeEventId(matchingInitial?.livetimeID ?? fallbackEvent?.livetimeID ?? null)
			})
			.catch(() => {
				setEvents([])
				setSelectedLiveTimeEventId(null)
			})
			.finally(() => {
				setIsLoadingEvents(false)
			})
	}, [initialEventId])

	useEffect(() => {
		if (selectedLiveTimeEventId === null) {
			setResultsByRound({})
			setSelectedRoundName('')
			setSelectedClassName('')
			setIsLoadingResults(false)
			return
		}

		setIsLoadingResults(true)

		API.getEventResults(selectedLiveTimeEventId)
			.then((data) => {
				const nextResults = (data || {}) as RaceEventResultsByRound
				setResultsByRound(nextResults)

				const orderedRounds = sortRoundNames(Object.keys(nextResults))
				setSelectedRoundName((current) => (
					current && orderedRounds.includes(current) ? current : (orderedRounds[0] || '')
				))
			})
			.catch(() => {
				setResultsByRound({})
				setSelectedRoundName('')
				setSelectedClassName('')
			})
			.finally(() => {
				setIsLoadingResults(false)
			})
	}, [selectedLiveTimeEventId])

	useEffect(() => {
		const classesForRound = selectedRoundName ? resultsByRound[selectedRoundName] : undefined
		const classNames = classesForRound ? Object.keys(classesForRound) : []

		setSelectedClassName((current) => (
			current && classNames.includes(current) ? current : (classNames[0] || '')
		))
	}, [resultsByRound, selectedRoundName])

	const orderedRounds = useMemo(() => sortRoundNames(Object.keys(resultsByRound)), [resultsByRound])
	const classMapForRound = selectedRoundName ? resultsByRound[selectedRoundName] : undefined
	const availableClasses = classMapForRound ? Object.keys(classMapForRound) : []
	const selectedClassResults = (classMapForRound && selectedClassName)
		? classMapForRound[selectedClassName] || []
		: []

	function getSelectedEventName(): string {
		const selectedEvent = eventsWithLiveTimeId.find((event) => event.livetimeID === selectedLiveTimeEventId)
		return selectedEvent?.name || selectedEvent?.liveTimeEvent?.name || `Event #${selectedEvent?.id ?? 'Unknown'}`
	}
	function getSelectedRoundId(): number { return selectedClassResults[0]?.roundID ?? 0 }
	function getSelectedRaceId(): number { return selectedClassResults[0]?.raceResultID ?? 0}

	function eventContextLink(link: string, label: string, icon: string = 'fa-solid fa-arrow-up-right-from-square') {
		return <ContentWithIcon icon={icon} className="underline"><a href={link}>{label}</a></ContentWithIcon>
	}

	return (
		<Column className={`w-full ${className || ''}`} style={{ maxWidth: width, width: '100%', ...style }} gap={3}>
			<Column className="w-full rounded border border-gray-300 bg-white p-3" gap={3}>
				<BriefContentHeader icon="fa-solid fa-filter">Race Results Explorer</BriefContentHeader>

				<div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
					<Column gap={1}>
						<Select
							label="Event"
							value={selectedLiveTimeEventId !== null ? String(selectedLiveTimeEventId) : ''}
							onChange={(nextValue) => {
								const nextId = parseInt(nextValue, 10)
								setSelectedLiveTimeEventId(Number.isFinite(nextId) ? nextId : null)
							}}
							disabled={isLoadingEvents || eventsWithLiveTimeId.length === 0}
							emptyMessage="No events available"
							options={eventsWithLiveTimeId.map((e) => ({
								value: e.livetimeID !== null && e.livetimeID !== undefined ? String(e.livetimeID) : '',
								label: getEventDisplayLabel(e),
							}))}
						/>
						{eventContextLink(livetime.getEventResultsLink(selectedLiveTimeEventId ?? 0), `${getSelectedEventName()} Results`)}
					</Column>

					<Column gap={1}>
						<Select
							label="Round"
							value={selectedRoundName}
							onChange={setSelectedRoundName}
							disabled={isLoadingResults || orderedRounds.length === 0}
							emptyMessage="No rounds available"
							options={orderedRounds.map((n) => ({ value: n, label: n }))}
						/>
						{eventContextLink(livetime.getRoundResultsLink(getSelectedRoundId()), `${selectedRoundName} Results`)}
					</Column>

					<Column gap={1}>
						<Select
							label="Class"
							value={selectedClassName}
							onChange={setSelectedClassName}
							disabled={isLoadingResults || availableClasses.length === 0}
							emptyMessage="No classes available"
							options={availableClasses.map((n) => ({ value: n, label: n, }))}
						/>
						{eventContextLink(livetime.getHeatResultsLink(getSelectedRaceId()), `${selectedClassName} Results`)}
					</Column>
				</div>

				{isLoadingEvents && (
					<ContentWithIcon icon="fa-solid fa-arrows-rotate fa-spin">
						Loading events...
					</ContentWithIcon>
				)}
			</Column>


			{!isLoadingEvents && !isLoadingResults && selectedClassName && selectedClassResults.length > 0 && (
				<div className="w-full">
					<RaceEventRoundClassResults
						className={selectedClassName}
						results={selectedClassResults}
						startCollapsed={startCollapsed}
					/>
				</div>
			)}

			{!isLoadingEvents && !isLoadingResults && (!selectedClassName || selectedClassResults.length === 0) && (
				<ContentWithIcon icon="fa-solid fa-flag-checkered">
					No class results available for the current selection.
				</ContentWithIcon>
			)}
		</Column>
	)
}
