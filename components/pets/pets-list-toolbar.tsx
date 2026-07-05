import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

type FilterOption = {
  value: string
  label: string
}

type PetsListToolbarProps = {
  action?: {
    href: string
    label: string
    icon?: 'plus'
  }
  filterOptions?: FilterOption[]
  filterDefaultLabel?: string
}

const defaultFilters: FilterOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'critical', label: 'Crítico' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'normal', label: 'Normal' },
]

export function PetsListToolbar({
  action,
  filterOptions = defaultFilters,
  filterDefaultLabel = 'Todos',
}: PetsListToolbarProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40" />
        <input
          type="text"
          placeholder="Buscar por nombre, zona, raza..."
          className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <select
        defaultValue={filterOptions[0]?.value ?? 'all'}
        className="w-full shrink-0 rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary md:w-auto"
        aria-label={filterDefaultLabel}
      >
        {filterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {action ? (
        <Link href={action.href} className="w-full shrink-0 md:w-auto">
          <Button size="lg" className="w-full bg-primary hover:bg-primary/90 md:w-auto">
            {action.icon === 'plus' ? <Plus className="mr-2 h-4 w-4" /> : null}
            {action.label}
          </Button>
        </Link>
      ) : null}
    </div>
  )
}
