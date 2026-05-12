"use client";
import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  className?: string;
}

export function OTPInput({ length = 6, onChange, onComplete, disabled, className }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function update(index: number, char: string) {
    const next = [...values];
    next[index] = char.replace(/\D/g, "").slice(-1);
    setValues(next);
    const code = next.join("");
    onChange?.(code);
    if (char && index < length - 1) refs.current[index + 1]?.focus();
    if (code.length === length && !code.includes("")) onComplete?.(code);
  }

  function handleKey(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    const next = Array(length).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setValues(next);
    const code = next.join("");
    onChange?.(code);
    if (pasted.length === length) onComplete?.(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          disabled={disabled}
          onChange={(e) => update(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none",
            "border-slate-200 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-700",
            "focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]",
            val && "border-blue-400 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}
