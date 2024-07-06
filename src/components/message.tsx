import { useContext, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { AppStateContext } from "../control/state.js";
import { Message, MessageRole } from "../types.js";
import { LucidePen, LucideX } from "lucide-react";
import { Tooltip } from "./tooltip.js";

const TextArea = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  return (
    <textarea
      placeholder="Type something..."
      autoFocus
      className="h-full w-full  bg-transparent outline-none resize-none pr-10"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export const MessageView = ({
  message,
  onChange,
}: {
  message: Message;
  onChange: (content: string) => void;
}) => {
  const { state } = useContext(AppStateContext);
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <MessageWrapper role={message.role}>
      <div className="absolute right-0 top-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity text not-italic">
        <Tooltip tooltip="Edit">
          <LucidePen
            width={16}
            onClick={() => dialogRef.current?.showModal()}
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
            <TextArea value={message.content} onChange={onChange} />
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
        </div>
      </dialog>

      {message.content}
    </MessageWrapper>
  );
};

export const MessageWrapper = ({
  children,
  role,
}: {
  children: React.ReactNode;
  role: MessageRole;
}) => {
  const { state } = useContext(AppStateContext);

  return (
    <div
      data-role={role}
      className={twMerge(
        "max-w-[80ch] w-full leading-6 text-justify relative pr-8 group",
        role === "user" &&
          twMerge(
            // "italic",
            state.darkMode ? "text-slate-400" : "text-stone-500"
          )
      )}
    >
      {children}
    </div>
  );
};
