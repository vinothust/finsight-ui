import React from 'react';
import { Filter, X } from 'lucide-react';
import { FilterState, KPI_OPTIONS } from '@/types';
import { FilterOption } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableClusters: FilterOption[];
  availableAccounts: FilterOption[];
  availableProjects: FilterOption[];
  availableYears: number[];
  availableMonths: string[];
}

interface MultiSelectDropdownProps {
  label: string;
  options: (string | number | FilterOption)[];
  selected: (string | number)[];
  onToggle: (value: string | number) => void;
  onSelectAll?: (values: (string | number)[]) => void;
  disabled?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selected,
  onToggle,
  onSelectAll,
  disabled = false,
}) => {
  const getOptionValue = (opt: string | number | FilterOption) => 
    (typeof opt === 'object' && opt !== null && 'value' in opt) ? opt.value : opt;
  
  const getOptionLabel = (opt: string | number | FilterOption) => 
    (typeof opt === 'object' && opt !== null && 'name' in opt) ? opt.name : opt;

  const allValues = options.map(getOptionValue);
  const isAllSelected = options.length > 0 && selected.length === options.length;

  const handleSelectAll = () => {
    if (onSelectAll) {
      if (isAllSelected) {
        onSelectAll([]);
      } else {
        onSelectAll(allValues as (string | number)[]);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-10 font-normal"
          disabled={disabled}
        >
          <span className="truncate">
            {selected.length === 0
              ? `Select ${label}`
              : `${selected.length} selected`}
          </span>
          <ChevronDown size={16} className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
          {onSelectAll && options.length > 0 && (
            <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer font-medium border-b mb-1">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">Select All</span>
            </label>
          )}
          {options.map((option) => {
            const value = getOptionValue(option);
            const labelText = getOptionLabel(option);
            return (
              <label
                key={String(value)}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={selected.includes(value as never)}
                  onCheckedChange={() => onToggle(value as string | number)}
                />
                <span className="text-sm">{labelText}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFilterChange,
  availableClusters = [],
  availableAccounts = [],
  availableProjects = [],
  availableYears = [],
  availableMonths = []
}) => {

  const toggleArrayFilter = (
    key: 'clusters' | 'accounts' | 'projects' | 'analyzeBy' | 'years' | 'months',
    value: string | number
  ) => {
    const currentArray = filters[key] as (string | number)[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    onFilterChange({ ...filters, [key]: newArray });
  };

  const setArrayFilter = (
    key: 'clusters' | 'accounts' | 'projects' | 'analyzeBy' | 'years' | 'months',
    values: (string | number)[]
  ) => {
    onFilterChange({ ...filters, [key]: values });
  };

  const clearAllFilters = () => {
    onFilterChange({
      clusters: [],
      accounts: [],
      projects: [],
      analyzeBy: [],
      years: [],
      months: [],
      marginThreshold: 30,
    });
  };

  const activeFilterCount = 
    (filters.clusters?.length || 0) + 
    (filters.accounts?.length || 0) + 
    (filters.projects?.length || 0) +
    (filters.analyzeBy?.length || 0) + 
    (filters.years?.length || 0) + 
    (filters.months?.length || 0);

  return (
    <div className="bg-card border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-primary" />
          <h3 className="font-semibold font-display">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-destructive"
          >
            <X size={14} className="mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Cluster
          </Label>
          <MultiSelectDropdown
            label="Clusters"
            options={availableClusters}
            selected={filters.clusters || []}
            onToggle={(val) => toggleArrayFilter('clusters', val)}
            onSelectAll={(vals) => setArrayFilter('clusters', vals)}
            disabled={false}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Account
          </Label>
          <MultiSelectDropdown
            label="Accounts"
            options={availableAccounts}
            selected={filters.accounts || []}
            onToggle={(val) => toggleArrayFilter('accounts', val)}
            onSelectAll={(vals) => setArrayFilter('accounts', vals)}
            disabled={!filters.clusters?.length}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Project
          </Label>
          <MultiSelectDropdown
            label="Projects"
            options={availableProjects}
            selected={filters.projects || []}
            onToggle={(val) => toggleArrayFilter('projects', val)}
            onSelectAll={(vals) => setArrayFilter('projects', vals)}
            disabled={!filters.accounts?.length}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Analyze By
          </Label>
          <MultiSelectDropdown
            label="KPIs"
            options={KPI_OPTIONS}
            selected={filters.analyzeBy || []}
            onToggle={(val) => toggleArrayFilter('analyzeBy', val)}
            onSelectAll={(vals) => setArrayFilter('analyzeBy', vals)}
            disabled={!filters.projects?.length}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Year
          </Label>
          <MultiSelectDropdown
            label="Years"
            options={availableYears}
            selected={filters.years || []}
            onToggle={(val) => toggleArrayFilter('years', val)}
            onSelectAll={(vals) => setArrayFilter('years', vals)}
            disabled={!filters.analyzeBy?.length}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Month
          </Label>
          <MultiSelectDropdown
            label="Months"
            options={availableMonths}
            selected={filters.months || []}
            onToggle={(val) => toggleArrayFilter('months', val)}
            onSelectAll={(vals) => setArrayFilter('months', vals)}
            disabled={!filters.analyzeBy?.length}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Margin Threshold
          </Label>
          <div className="pt-2">
            <Slider
              value={[filters.marginThreshold]}
              onValueChange={([value]) =>
                onFilterChange({ ...filters, marginThreshold: value })
              }
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span className="font-medium text-primary">{filters.marginThreshold}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {filters.clusters.map((cluster) => (
            <Badge
              key={cluster}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/10"
              onClick={() => toggleArrayFilter('clusters', cluster)}
            >
              {cluster}
              <X size={12} className="ml-1" />
            </Badge>
          ))}
          {filters.accounts.map((account) => (
            <Badge
              key={account}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/10"
              onClick={() => toggleArrayFilter('accounts', account)}
            >
              {account}
              <X size={12} className="ml-1" />
            </Badge>
          ))}
          {filters.years.map((year) => (
            <Badge
              key={year}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/10"
              onClick={() => toggleArrayFilter('years', year)}
            >
              {year}
              <X size={12} className="ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
