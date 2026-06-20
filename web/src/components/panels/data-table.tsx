'use client';

import { EmptyState, LoadingBlock } from './panel-feedback';

export type DataTableColumn = {
  key: string;
  header: string;
  className?: string;
  hideOnMobile?: boolean;
};

function rowActions(
  row: Record<string, React.ReactNode>,
  columns: DataTableColumn[],
  actions?: (row: Record<string, React.ReactNode>) => React.ReactNode,
) {
  if (actions) return actions(row);
  if (columns.some((col) => col.key === 'actions') && row.actions != null) {
    return row.actions;
  }
  return null;
}

function MobileCard({
  row,
  columns,
  keyField,
  actions,
}: {
  row: Record<string, React.ReactNode>;
  columns: DataTableColumn[];
  keyField: string;
  actions?: (row: Record<string, React.ReactNode>) => React.ReactNode;
}) {
  const visible = columns.filter((col) => col.key !== 'actions' && !col.hideOnMobile);
  const primary = visible[0];
  const rest = visible.slice(1);
  const actionNode = rowActions(row, columns, actions);

  return (
    <article
      key={String(row[keyField])}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      {primary ? (
        <div className="mb-3 border-b border-gray-100 pb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {primary.header || primary.key}
          </p>
          <div className="mt-1 text-base font-semibold text-[#001529]">{row[primary.key]}</div>
        </div>
      ) : null}
      {rest.length > 0 ? (
        <dl className="space-y-2.5">
          {rest.map((col) => (
            <div key={col.key} className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-xs font-medium text-gray-500">{col.header || col.key}</dt>
              <dd className="min-w-0 text-right text-sm text-gray-800">{row[col.key]}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {actionNode ? (
        <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 [&_.flex]:flex-col [&_.flex]:gap-2 sm:[&_.flex]:flex-row sm:[&_.flex]:flex-wrap [&_button]:w-full sm:[&_button]:w-auto">
          {actionNode}
        </div>
      ) : null}
    </article>
  );
}

export function DataTable({
  columns,
  rows,
  isLoading,
  emptyTitle = 'Keine Einträge',
  keyField,
  actions,
}: {
  columns: DataTableColumn[];
  rows: Array<Record<string, React.ReactNode>>;
  isLoading?: boolean;
  emptyTitle?: string;
  keyField: string;
  actions?: (row: Record<string, React.ReactNode>) => React.ReactNode;
}) {
  if (isLoading) return <LoadingBlock />;

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <MobileCard
            key={String(row[keyField])}
            row={row}
            columns={columns}
            keyField={keyField}
            actions={actions}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border bg-white md:block">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50 text-left">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`p-4 font-medium text-gray-600 ${col.className ?? ''}`}>
                  {col.header}
                </th>
              ))}
              {actions && !columns.some((col) => col.key === 'actions') ? <th className="p-4" /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row[keyField])} className="border-b last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className={`p-4 ${col.className ?? ''}`}>
                    {row[col.key]}
                  </td>
                ))}
                {actions && !columns.some((col) => col.key === 'actions') ? (
                  <td className="p-4">{actions(row)}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
