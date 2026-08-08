'use client'

import BriefContentHeader from '@/components/site/brief/brief.content.header'
import RaceEventRoundClassDriverResults, { RaceEventDriverResult } from '@/components/site/results/race.event.round.class.driver.results'
import { Chip, Column, ContentWithIcon, Row } from '@/components/ui/ui'

function getRaceNumber(results: RaceEventDriverResult[]): number | null {
	return results.find((result) => result.raceNumber !== null)?.raceNumber ?? null
}

export default function RaceEventRoundClassResults({
	className,
	results,
}: {
	className: string
	results: RaceEventDriverResult[]
}) {
	const raceNumber = getRaceNumber(results)

	return (
		<Column className="rounded border border-gray-300 bg-gray-50 p-3" gap={2}>
			<Row justify="between" align="center" className="w-full flex-wrap gap-2">
				<BriefContentHeader icon="fa-solid fa-flag-checkered">{className}</BriefContentHeader>
				{raceNumber !== null && (
					<Chip className="bg-black px-2 py-1 font-semibold text-white" width="auto">
						Race #{raceNumber}
					</Chip>
				)}
			</Row>

			{results.length === 0 && (
				<ContentWithIcon icon="fa-solid fa-circle-info">
					No driver results available for this class.
				</ContentWithIcon>
			)}

			{results.length > 0 && (
				<Column gap={2}>
					{results.map((result) => (
						<RaceEventRoundClassDriverResults key={result.id} result={result} />
					))}
				</Column>
			)}
		</Column>
	)
}
