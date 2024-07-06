import { useContext, useEffect, useRef } from "react";
import { AppStateContext } from "../control/state.js";
import { twMerge } from "tailwind-merge";
import {
  LucideCheck,
  LucideDelete,
  LucidePlus,
  LucideToggleLeft,
  LucideToggleRight,
  LucideX,
} from "lucide-react";
import { Tooltip } from "./tooltip.js";

export const GenOptionsPanel = ({}: {}) => {
  const { state, api } = useContext(AppStateContext);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.optionsOpen) {
        api.setOptionsOpen(() => false);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [api.setOptionsOpen, state.optionsOpen]);

  return (
    <div
      className={twMerge(
        "flex flex-col gap-3 absolute right-0 bottom-[calc(100%_+_1rem)] p-4 w-max rounded-lg shadow text-left transition-opacity duration-500 ease-in-out",
        state.optionsOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        state.darkMode ? "bg-zinc-900  text-white" : "bg-yellow-50 text-black"
      )}
    >
      <TextInput
        name="Model"
        value={state.options.model}
        onChange={(e) =>
          api.setOptions((o) => ({ ...o, model: e.target.value }))
        }
      />

      <TextInput
        name="OpenAI API URL"
        value={state.options.apiUrl}
        onChange={(e) =>
          api.setOptions((o) => ({ ...o, apiUrl: e.target.value }))
        }
      />

      <TextInput
        name="API Key"
        value={state.options.apiKey}
        onChange={(e) =>
          api.setOptions((o) => ({ ...o, apiKey: e.target.value }))
        }
      />

      <Headers />

      <RangeInput
        name={`Temperature (${state.options.temperature})`}
        min={0}
        max={1}
        step={0.01}
        value={state.options.temperature}
        onChange={(e) =>
          api.setOptions((o) => ({
            ...o,
            temperature: e.target.valueAsNumber,
          }))
        }
        darkMode={state.darkMode}
      />

      <RangeInput
        name={`TopP (${state.options.top_p})`}
        min={0}
        max={1}
        step={0.01}
        value={state.options.top_p}
        onChange={(e) =>
          api.setOptions((o) => ({
            ...o,
            top_p: e.target.valueAsNumber,
          }))
        }
        darkMode={state.darkMode}
      />

      <RangeInput
        name={`Max Tokens (${state.options.max_tokens})`}
        min={0}
        step={1}
        max={4096}
        value={state.options.max_tokens}
        onChange={(e) =>
          api.setOptions((o) => ({
            ...o,
            max_tokens: e.target.valueAsNumber,
          }))
        }
        darkMode={state.darkMode}
      />
    </div>
  );
};

const Headers = () => {
  const { state, api } = useContext(AppStateContext);
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div>
      <span className="flex gap-2 text-xs place-items-center">
        Headers
        <LucidePlus
          className="inline text-xs"
          onClick={() => {
            dialogRef.current?.showModal();
          }}
          width={12}
        />
      </span>
      <dialog
        ref={dialogRef}
        className={twMerge(
          "w-[80svw] h-[80svh] rounded shadow p-4 relative outline-none",
          state.darkMode ? "bg-zinc-900  text-white" : "bg-yellow-50 text-black"
        )}
      >
        <div className="absolute top-4 right-4 text-gray-400">
          <Tooltip tooltip="Close">
            <LucideX
              width={16}
              onClick={() => {
                dialogRef.current?.close();
              }}
            />
          </Tooltip>
        </div>
        <div className="flex gap-4">
          <span
            className="flex gap-2 text-xs place-items-center select-none"
            onClick={() => {
              api.setOptions((o) => ({
                ...o,
                headers: [...o.headers, ["", ""] as [string, string]],
              }));
            }}
          >
            <LucidePlus className="inline text-xs" width={12} />
            Add Header
          </span>
          <Tooltip tooltip="Omit default headers from OpenAI SDK">
            <span
              className="flex gap-2 text-xs place-items-center select-none"
              onClick={() => {
                api.setOptions((o) => ({
                  ...o,
                  sendMinimalHeaders: !o.sendMinimalHeaders,
                }));
              }}
            >
              {state.options.sendMinimalHeaders ? (
                <LucideToggleRight
                  className="inline text-xs text-green-500"
                  width={12}
                />
              ) : (
                <LucideToggleLeft
                  className="inline text-xs text-red-800"
                  width={12}
                />
              )}
              Send Minimal Headers
            </span>
          </Tooltip>
        </div>

        {state.options.headers.map(([key, value], i) => (
          <div className="flex gap-2 p-2" key={i}>
            <input
              type="text"
              placeholder="Key..."
              className={inputClasses}
              value={key}
              onChange={(e) => {
                api.setOptions((o) => ({
                  ...o,
                  headers: o.headers.map(([k, v], j) =>
                    i === j ? [e.target.value, v] : [k, v]
                  ),
                }));
              }}
            />

            <input
              type="text"
              placeholder="Value..."
              className={inputClasses}
              value={value}
              onChange={(e) => {
                api.setOptions((o) => ({
                  ...o,
                  headers: o.headers.map(([k, v], j) =>
                    i === j ? [k, e.target.value] : [k, v]
                  ),
                }));
              }}
            />

            <Tooltip tooltip="Delete">
              <LucideDelete
                className="inline text-xs"
                width={12}
                onClick={() => {
                  api.setOptions((o) => ({
                    ...o,
                    headers: o.headers.filter((_, j) => i !== j),
                  }));
                }}
              />
            </Tooltip>
          </div>
        ))}
      </dialog>
    </div>
  );
};

const inputClasses = "bg-transparent outline-none resize-none w-full h-full";

const sliderClasses = (darkMode: boolean) =>
  twMerge(
    "h-2 rounded-full appearance-none [&::-webkit-slider-thumb]:!bg-primary [&::-webkit-slider-runnable-track]:rounded-full",
    darkMode ? "accent-gray-600 bg-gray-700" : "accent-gray-500 bg-gray-300"
  );

const TextInput = ({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (opts: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div>
      <span className="text-xs">{name}</span>
      <input
        type="text"
        placeholder="API Key.."
        className={inputClasses}
        value={value}
        onBlur={onChange}
        onChange={onChange}
      />
    </div>
  );
};

const RangeInput = ({
  name,
  value,
  onChange,
  darkMode,
  min,
  max,
  step,
}: {
  name: string;
  min: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (opts: React.ChangeEvent<HTMLInputElement>) => void;
  darkMode: boolean;
}) => {
  return (
    <div>
      <span className="text-xs">{name}</span>
      <input
        type="range"
        max={max}
        min={min}
        step={step}
        className={twMerge(inputClasses, sliderClasses(darkMode))}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
