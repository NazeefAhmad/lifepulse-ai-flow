
import React from 'react';
import { Search, Filter, Calendar, User, Tag, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterPriority: string;
  onPriorityChange: (value: string) => void;
  assigneeFilter: string;
  onAssigneeChange: (value: string) => void;
  dueDateStart: string;
  onDueDateStartChange: (value: string) => void;
  dueDateEnd: string;
  onDueDateEndChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

const TaskFilters = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterPriority,
  onPriorityChange,
  assigneeFilter,
  onAssigneeChange,
  dueDateStart,
  onDueDateStartChange,
  dueDateEnd,
  onDueDateEndChange,
  filteredCount,
  totalCount,
  onClearFilters
}: TaskFiltersProps) => {
  const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || 
    assigneeFilter || dueDateStart || dueDateEnd;

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (filterStatus !== 'all') count++;
    if (filterPriority !== 'all') count++;
    if (assigneeFilter) count++;
    if (dueDateStart || dueDateEnd) count++;
    return count;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-purple-100">
      <CardContent className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-purple-500" />
          <Input
            placeholder="Search tasks, descriptions, assignees... 🔍"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-white border-purple-200 focus:border-purple-400"
          />
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-purple-500" />
            <select
              value={filterStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3 py-2 border border-purple-200 rounded-md bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">📋 Pending</option>
              <option value="in-progress">⏳ In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-purple-500" />
            <select
              value={filterPriority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="px-3 py-2 border border-purple-200 rounded-md bg-white text-sm"
            >
              <option value="all">All Priority</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-purple-500" />
            <Input
              placeholder="Filter by assignee..."
              value={assigneeFilter}
              onChange={(e) => onAssigneeChange(e.target.value)}
              className="w-48 bg-white border-purple-200 focus:border-purple-400 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            <div className="flex items-center gap-1">
              <Input
                type="date"
                placeholder="Due date from"
                value={dueDateStart}
                onChange={(e) => onDueDateStartChange(e.target.value)}
                className="w-36 bg-white border-purple-200 focus:border-purple-400 text-sm"
              />
              <span className="text-purple-500 text-sm">to</span>
              <Input
                type="date"
                placeholder="Due date to"
                value={dueDateEnd}
                onChange={(e) => onDueDateEndChange(e.target.value)}
                className="w-36 bg-white border-purple-200 focus:border-purple-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Active Filters and Results */}
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-600 font-medium">Active filters:</span>
              {searchTerm && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {filterStatus !== 'all' && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Status: {filterStatus.replace('-', ' ')}
                </Badge>
              )}
              {filterPriority !== 'all' && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Priority: {filterPriority}
                </Badge>
              )}
              {assigneeFilter && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Assignee: {assigneeFilter}
                </Badge>
              )}
              {(dueDateStart || dueDateEnd) && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Due: {dueDateStart || '...'} to {dueDateEnd || '...'}
                </Badge>
              )}
            </div>
          )}
          
          <div className="ml-auto">
            <div className="text-sm text-purple-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
              <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> tasks
              {hasActiveFilters && (
                <span className="ml-1">
                  ({getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active)
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskFilters;
