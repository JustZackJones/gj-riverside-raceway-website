'use client'

import { useState } from 'react'
import BriefContentHeader from '@/components/site/brief/brief.content.header'
import RaceEventRoundClassDriverResults, { RaceEventDriverResult } from '@/components/site/results/race.event.round.class.driver.results'
import { Column, ContentWithIcon, Row } from '@/components/ui/ui'

function getClassWinner(results: RaceEventDriverResult[]): RaceEventDriverResult | null {
	return results.find((result) => result.finishPosition === 1) || null
}

export default function RaceEventRoundClassResults({
	className,
	results,
}: {
	className: string
	results: RaceEventDriverResult[]
}) {
	const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
	const winner = getClassWinner(results)

	function toggleCollapsed() {
		setIsCollapsed((current) => !current)
	}

	return (
		<Column className="rounded border border-gray-300 bg-gray-50 p-3" gap={2}>
			<div
				className="w-full rounded px-1 py-1 transition-colors hover:bg-gray-100 cursor-pointer"
				onClick={toggleCollapsed}
				style={{ userSelect: 'none' }}
			>
				<Row justify="between" align="center" className="w-full gap-2">
					<BriefContentHeader icon="fa-solid fa-flag-checkered">{className}</BriefContentHeader>
					<span className="flex w-8 flex-shrink-0 items-center justify-center text-gray-600">
						<i className={`fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} transition-transform duration-300`} />
					</span>
				</Row>
			</div>

			{results.length === 0 && (
				<ContentWithIcon icon="fa-solid fa-circle-info">
					No driver results available for this class.
				</ContentWithIcon>
			)}

			{results.length > 0 && (
				<>
					<div
						className="grid transition-all duration-300 ease-in-out"
						style={{
							gridTemplateRows: isCollapsed ? '0fr' : '1fr',
							opacity: isCollapsed ? 0 : 1,
						}}
					>
						<div className="overflow-hidden">
							<Column gap={2}>
								{results.map((result) => (
									<RaceEventRoundClassDriverResults key={result.id} result={result} />
								))}
							</Column>
						</div>
					</div>

					<div
						className="grid transition-all duration-300 ease-in-out"
						style={{
							gridTemplateRows: isCollapsed && winner ? '1fr' : '0fr',
							opacity: isCollapsed && winner ? 1 : 0,
						}}
					>
						<div className="overflow-hidden">
							{winner && (
								<Column gap={1}>
									<RaceEventRoundClassDriverResults result={winner} />
								</Column>
							)}
						</div>
					</div>
				</>
			)}
		</Column>
	)
}
