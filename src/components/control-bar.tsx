import {
  LucideBot,
  LucideDelete,
  LucideSun,
  LucideTelescope,
  LucideUndo2,
  LucideWrench,
} from "lucide-react";
import { useContext } from "react";
import { useSend } from "../control/send.js";
import { AppStateContext } from "../control/state.js";
import { GenOptionsPanel } from "./gen-options-panel.js";
import { Indicator } from "./indicator.js";
import { Tooltip } from "./tooltip.js";

export const ControlBar = ({}: {}) => {
  const { state, api } = useContext(AppStateContext);
  const { redo, undo } = useSend();

  return (
    <div className="flex justify-between w-full gap-2 py-1 transition-opacity duration-300 opacity-0 select-none hover:opacity-100">
      <span className="flex gap-2 place-items-center">
        <Tooltip tooltip="Redo">
          <LucideUndo2 width={16} onClick={redo} />
        </Tooltip>
        <Tooltip tooltip="Undo">
          <LucideDelete width={16} onClick={undo} />
        </Tooltip>
      </span>
      <span className="relative flex gap-2 place-items-center">
        <span className="flex gap-2 text-xs">
          <Indicator name="TopP" value={state.options.top_p} />
          <Indicator name="Temp" value={state.options.temperature} />
        </span>
        <Tooltip tooltip="Deterministic">
          <LucideBot
            width={16}
            onClick={() =>
              api.setOptions((o) => ({ ...o, temperature: 0, top_p: 1 }))
            }
          />
        </Tooltip>
        <Tooltip tooltip="Creative">
          <LucideTelescope
            width={16}
            onClick={() =>
              api.setOptions((o) => ({ ...o, temperature: 0.25, top_p: 0.98 }))
            }
          />
        </Tooltip>
        <Tooltip tooltip="Settings">
          <LucideWrench
            width={16}
            onClick={() => api.setOptionsOpen((o) => !o)}
          />
        </Tooltip>
        <Tooltip tooltip={state.darkMode ? "Light Mode" : "Dark Mode"}>
          <LucideSun width={16} onClick={api.toggleDarkMode} />
        </Tooltip>
        <GenOptionsPanel />
      </span>
    </div>
  );
};
