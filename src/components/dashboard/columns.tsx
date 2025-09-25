'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Submission } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Users, Building } from 'lucide-react';
import { format } from 'date-fns';

type ColumnsProps = {
  onUpdate: (submission: Submission) => void;
  onDelete: (submissionId: string) => void;
};

export const columns = ({ onUpdate, onDelete }: ColumnsProps): ColumnDef<Submission>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'bookingId',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Booking ID" />,
    cell: ({ row }) => <div className="font-mono">{row.getValue('bookingId')}</div>,
  },
  {
    accessorKey: 'propertyName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Property" />,
    cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{row.getValue('propertyName')}</span>
        </div>
    ),
  },
  {
    accessorKey: 'mainGuestName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Main Guest" />,
    cell: ({ row }) => <div>{row.getValue('mainGuestName')}</div>,
  },
  {
    accessorKey: 'numberOfGuests',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Guests" />,
    cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{row.getValue('numberOfGuests')}</span>
        </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = {
        'Awaiting Guest': 'secondary',
        'Pending': 'secondary',
        'Approved': 'default',
        'Rejected': 'destructive',
      }[status] as 'secondary' | 'default' | 'destructive';

      return (
        <Badge variant={variant} className={variant === 'default' ? 'bg-accent text-accent-foreground' : ''}>
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'checkInDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Check-in" />,
    cell: ({ row }) => <div>{format(new Date(row.getValue('checkInDate')), 'PPP')}</div>,
  },
  {
    accessorKey: 'checkOutDate',
    header: ({ column }) => (
        <div className="flex items-center gap-2">
            <DataTableColumnHeader column={column} title="Check-out" />
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>ID data is deleted 60 days after check-out.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    ),
    cell: ({ row }) => <div>{format(new Date(row.getValue('checkOutDate')), 'PPP')}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} onUpdate={onUpdate} onDelete={onDelete} />,
  },
];
