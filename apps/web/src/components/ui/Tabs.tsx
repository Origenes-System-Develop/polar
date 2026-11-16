import { useId, type ReactNode } from "react";
import "./ui.css";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ items, active, onChange }: { items: TabItem[]; active: string; onChange: (id: string) => void }) {
  const prefix = useId();
  const current = items.find((item) => item.id === active) ?? items[0];
  if (!current) return null;
  return (
    <div className="ui-tabs">
      <div className="ui-tabs__list" role="tablist">
        {items.map((item) => (
          <button key={item.id} type="button" id={`${prefix}-${item.id}`} aria-controls={`${prefix}-panel`} aria-selected={item.id === current.id} tabIndex={item.id === current.id ? 0 : -1} onKeyDown={(event) => {
            const index = items.findIndex(tab => tab.id === item.id);
            const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowRight" ? (index + 1) % items.length : event.key === "ArrowLeft" ? (index - 1 + items.length) % items.length : -1;
            if (next >= 0) { event.preventDefault(); onChange(items[next].id); document.getElementById(`${prefix}-${items[next].id}`)?.focus(); }
          }} className={item.id === current.id ? "is-active" : ""} role="tab" onClick={() => onChange(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="ui-tabs__panel" role="tabpanel" id={`${prefix}-panel`} aria-labelledby={`${prefix}-${current.id}`} tabIndex={0}>
        {current.content}
      </div>
    </div>
  );
}
