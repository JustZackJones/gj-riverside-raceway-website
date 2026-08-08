'use client'

import { Chip, Column, Row } from '@/components/ui/ui'

export type RaceEventDriverResult = {
	id: number
	roundID: number
	raceResultID: number
	driverLapDataID: number | null
	className: string | null
	raceNumber: number | null
	finishPosition: number
	carNumber: number | null
	driverName: string | null
	qualifyingPosition: number | null
	laps: number | null
	totalTime: number | null
	behind: string | null
	fastestLap: number | null
	fastestLapNumber: number | null
	avgLap: number | null
	avgTop5: number | null
	avgTop10: number | null
	avgTop15: number | null
	top3Consecutive: number | null
	stdDeviation: number | null
	consistency: number | null
	createdAt: string
	updatedAt: string
}

function formatSeconds(value: number | null, decimals: number = 2): string {
	if (value === null || Number.isNaN(value)) {
		return decimals > 0 ? `--.${''.padEnd(decimals, '-')}` : '--'
	}

	const minutes = Math.floor(value / 60)
	const seconds = value - (minutes * 60)
	const decimalPadding = decimals > 0 ? decimals + 3 : 2
	const secondsText = seconds.toFixed(decimals).padStart(decimalPadding, '0')

	if (minutes > 0) return `${minutes}:${secondsText}`
	return seconds.toFixed(decimals)
}

function formatMetric(value: number | null, formatter?: (input: number) => string): string {
	if (value === null || Number.isNaN(value)) return '--.--'
	return formatter ? formatter(value) : String(value)
}

function formatConsistency(value: number | null): string {
	if (value === null || Number.isNaN(value)) return '--.-%'
	return `${value.toFixed(1)}%`
}

function formatLaps(value: number | null, compact: boolean): string {
	if (value === null) return compact ? '--L' : '-- laps'
	return compact ? `${value}L` : `${value} laps`
}

const desktopMetricChipWidth = 'unset'
const driverInfoWidthClass = 'w-[78px] sm:w-[180px]'

function ResponsiveMetricText({
	mobile,
	desktop,
}: {
	mobile: string
	desktop: string
}) {
	return (
		<>
			<span className="sm:hidden">{mobile}</span>
			<span className="hidden sm:inline">{desktop}</span>
		</>
	)
}

export default function RaceEventRoundClassDriverResults({
	result,
}: {
	result: RaceEventDriverResult
}) {
	return (
		<Row
			fullWidth
			align="center"
			justify="between"
			className="rounded border border-gray-300 bg-white px-1.5 py-1.5"
		>
			<Row align="center" gap={1} className="min-w-0 flex-1 sm:gap-1">
				<Chip className="bg-black px-1 py-0.5 text-[10px] sm:text-sm font-mono font-semibold text-white" width="34px">
					P{result.finishPosition}
				</Chip>

				<Column className={`min-w-0 ${driverInfoWidthClass}`} gap={0}>
					<span className="truncate text-[10px] leading-tight sm:text-sm font-semibold">
						{result.driverName || 'Unknown Driver'}
					</span>
					<span className="hidden text-xs text-gray-500 sm:inline">
						Qual: {result.qualifyingPosition ?? '--'}
						{result.behind ? ` | Behind: ${result.behind}` : ''}
					</span>
				</Column>
			</Row>

			<Row align="center" justify="end" gap={0} className="flex-wrap sm:gap-1">
				<Chip className="min-w-[58px] sm:min-w-[110px] bg-gray-200 px-1 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-sm font-mono text-black" width={desktopMetricChipWidth}>
					<i className="fa-solid fa-road mr-1" />
					<ResponsiveMetricText
						mobile={formatLaps(result.laps, true)}
						desktop={formatLaps(result.laps, false)}
					/>
				</Chip>
				<Chip className="min-w-[58px] sm:min-w-[110px] bg-red-600 px-1 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-sm font-mono font-semibold text-white" width={desktopMetricChipWidth}>
					<i className="fa-solid fa-stopwatch mr-1" />
					<ResponsiveMetricText
						mobile={formatSeconds(result.totalTime, 2)}
						desktop={formatSeconds(result.totalTime)}
					/>
				</Chip>
				<Chip className="min-w-[58px] sm:min-w-[110px] bg-yellow-500 px-1 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-sm font-mono font-semibold text-black" width={desktopMetricChipWidth}>
					<i className="fa-solid fa-bolt mr-1" />
					<ResponsiveMetricText
						mobile={formatSeconds(result.fastestLap, 2)}
						desktop={formatSeconds(result.fastestLap)}
					/>
				</Chip>
				<Chip className="min-w-[58px] sm:min-w-[110px] bg-blue-600 px-1 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-sm font-mono font-semibold text-white" width={desktopMetricChipWidth}>
					<i className="fa-solid fa-chart-line mr-1" />
					<ResponsiveMetricText
						mobile={formatConsistency(result.consistency)}
						desktop={formatConsistency(result.consistency)}
					/>
				</Chip>
			</Row>
		</Row>
	)
}
