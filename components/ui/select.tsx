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
	labelClassName = 'text-sm font-semibold text-gray-700',
	selectClassName = 'w-full rounded border border-gray-300 bg-white px-2 pb-2 pt-3 text-sm',
}: SelectProps) {
	const generatedId = useId()
	const resolvedId = id ?? `select-${generatedId.replace(/:/g, '')}`

	return (
		<div className="relative w-full pt-2">
			<label
				htmlFor={resolvedId}
				className={`pointer-events-none bg-white px-1 leading-none ${labelClassName}`}
			>
				{label}
			</label>
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
	)
}