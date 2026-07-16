import { useEffect, useRef, useState } from "react";

export default function Select({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div className="select" ref={rootRef}>
      <button
        type="button"
        className="select-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "select-value" : "select-placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="select-arrow" aria-hidden="true">▾</span>
      </button>

      {open && (
        <ul className="select-list" role="listbox">
          {options.length === 0 && <li className="select-empty">No options available</li>}
          {options.map((o) => (
            <li
              key={o.value}
              role="option"
              aria-selected={String(o.value) === String(value)}
              className={"select-option" + (String(o.value) === String(value) ? " select-option-selected" : "")}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
