"use client";
import Icon from "./Icon";

export default function PrintPageButton({ label = "Print", className = "btn btn-secondary" }: { label?: string; className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={`${className} no-print`}>
      <Icon name="printer" className="h-4 w-4" /> {label}
    </button>
  );
}
