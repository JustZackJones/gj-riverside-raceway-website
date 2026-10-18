import { useId } from 'react'

type SelectOption = {
	value: string
	label: string
}

type SelectProps = {
	id?: string
	label: string
	value: string
	onChange: (value: string) => void
	options: SelectOption[]
	emptyMessage?: string
	disabled?: boolean
	showNavigation?: boolean
	labelClassName?: string
	selectClassName?: string
}

export default function Select({
	id,
	label,
	value,
	onChange,
	options,
	emptyMessage = 'No options available',
	disabled = false,
	showNavigation = false,
	labelClassName = 'text-sm font-semibold text-gray-700',
	selectClassName = 'w-full rounded border border-gray-300 bg-white px-2 pb-2 pt-3 text-sm',
}: SelectProps) {
	const generatedId = useId()
	const resolvedId = id ?? `select-${generatedId.replace(/:/g, '')}`
	const selectedIndex = options.findIndex((option) => option.value === value)

	return (
		<div className="relative w-full pt-2">
			<label
				htmlFor={resolvedId}
				className={`pointer-events-none bg-white px-1 leading-none ${labelClassName}`}
			>
				{label}
			</label>
			<div className="flex items-stretch gap-1">
			<div className="min-w-0 flex-1">
			<select
				id={resolvedId}
				className={selectClassName}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				disabled={disabled}
			>
				{options.length === 0 && <option value="">{emptyMessage}</option>}
				{options.map((option) => (
					<option key={option.value} value={option.value}>{option.label}</option>
				))}
			</select>
			</div>
			{showNavigation && options.length > 1 && (
				<div className="relative w-10 shrink-0">
					<div className="absolute inset-0 flex flex-col overflow-hidden rounded border border-gray-300 bg-white">
					{[-1, 1].map((direction) => {
						const nextIndex = selectedIndex + direction
						const navigationLabel = `${direction === -1 ? 'Previous' : 'Next'} ${label.toLowerCase()}`
						return (
							<button
								key={direction}
								type="button"
								aria-label={navigationLabel}
								title={navigationLabel}
								aria-controls={resolvedId}
								disabled={disabled || selectedIndex < 0 || nextIndex < 0 || nextIndex >= options.length}
								onClick={() => {
									const nextOption = options[nextIndex]
									if (nextOption) onChange(nextOption.value)
								}}
								className={`flex min-h-0 flex-1 items-center justify-center bg-white p-0 text-xs leading-none text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40 ${direction === -1 ? 'border-b border-gray-300' : ''}`}
							>
								<i aria-hidden="true" className={`fa-solid fa-chevron-${direction === -1 ? 'up' : 'down'}`} />
							</button>
							)
						})}
					</div>
				</div>
			)}
			</div>
		</div>
	)
}