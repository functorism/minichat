import { useCallback, useContext, useRef } from "react";
import { AppStateContext } from "../control/state.js";
import { useSend } from "../control/send.js";
import { LucideExpand, LucideSend, LucideX } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Tooltip } from "./tooltip.js";

const TextArea = ({
  sendOnEnter = true,
  fullHeight = false,
}: {
  sendOnEnter?: boolean;
  fullHeight?: boolean;
}) => {
  const { state, api } = useContext(AppStateContext);
  const { send, locked } = useSend();

  return (
    <textarea
      placeholder="Type something..."
      autoFocus
      className={twMerge(
        "w-full  bg-transparent outline-none resize-none pr-10",
        fullHeight ? "h-full" : "h-20"
      )}
      value={state.input}
      onKeyDown={useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (
            sendOnEnter &&
            e.key === "Enter" &&
            e.shiftKey === false &&
            !locked()
          ) {
            e.preventDefault();
            send(state.messages);
            api.setInput("");
          }
        },
        [send, state.messages]
      )}
      onChange={(e) => api.setInput(e.target.value)}
    />
  );
};

export const MessageInput = () => {
  const { state, api } = useContext(AppStateContext);
  const { send, locked } = useSend();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  return (
    <div className="relative group">
      <div className="absolute top-4 right-4 text-gray-400 group-hover:opacity-100 opacity-0 transition-opacity">
        <Tooltip tooltip="Expand">
          <LucideExpand
            width={16}
            onClick={() => {
              dialogRef.current?.showModal();
            }}
          />
        </Tooltip>
      </div>
      <dialog
        ref={dialogRef}
        className={twMerge(
          "w-[80svw] h-[80svh] rounded shadow",
          state.darkMode ? "bg-zinc-900  text-white" : "bg-yellow-50 text-black"
        )}
      >
        <div className="relative h-full">
          <div className="p-8 h-full">
            <TextArea sendOnEnter={false} fullHeight />
          </div>
          <div className="absolute top-4 right-4 text-gray-400 group-hover:opacity-100 opacity-0 transition-opacity">
            <Tooltip tooltip="Close">
              <LucideX
                width={16}
                onClick={() => {
                  dialogRef.current?.close();
                }}
              />
            </Tooltip>
          </div>
          <div className="absolute bottom-4 right-8 text-gray-400 group-hover:opacity-100 opacity-0 transition-opacity">
            <Tooltip tooltip="Send">
              <LucideSend
                width={16}
                onClick={() => {
                  if (locked()) return;
                  send(state.messages);
                  dialogRef.current?.close();
                  api.setInput("");
                }}
              />
            </Tooltip>
          </div>
        </div>
      </dialog>
      <TextArea />
    </div>
  );
};
