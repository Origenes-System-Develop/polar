import type { ReactNode } from "react";
import "./ui.css";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
}

export function Table<T>({ columns, data, empty = "Nenhum registro encontrado." }: { columns: TableColumn<T>[]; data: T[]; empty?: string }) {
  return (
    <div className="ui-table-wrap">
      {/* Roles explicitos: no celular as linhas viram cartoes (display: block) e os
          leitores de tela deixam de anunciar tabela, linha e celula sem eles. */}
      <table className="ui-table" role="table">
        <thead role="rowgroup">
          <tr role="row">
            {columns.map((column) => (
              <th key={column.key} scope="col" role="columnheader">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index} role="row">
                {columns.map((column) => (
                  <td key={column.key} data-label={column.header} role="cell">
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr role="row">
              <td colSpan={columns.length} role="cell">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
