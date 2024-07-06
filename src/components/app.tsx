import { useContext, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ControlBar } from "./control-bar.js";
import { MessageView, MessageWrapper } from "./message.js";
import "../main.css";
import { AppStateContext, useAppStateAPI } from "../control/state.js";
import { LucideArrowDown, LucideLoader } from "lucide-react";
import { MessageInput } from "./message-input.js";

export const App = () => (
  <AppStateContext.Provider value={useAppStateAPI()}>
    <AppInner />
  </AppStateContext.Provider>
);

const AppInner = () => {
  const { state, api } = useContext(AppStateContext);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const listener = () =>
        setShowScrollDown(Math.abs(scrollRef.current?.scrollTop ?? 0) > 128);
      scrollRef.current.addEventListener("scroll", listener);
      return () => scrollRef.current?.removeEventListener("scroll", listener);
    }
    return () => {};
  });

  return (
    <div
      className={twMerge(
        "flex justify-center min-h-screen font-serif text-xl font-medium min-w-screen antialiased",
        state.darkMode ? "bg-black text-white" : "bg-amber-50 text-black"
      )}
    >
      {state.pendingMessage && (
        <LucideLoader
          className="animate-pulse animate-spin animate-fade fixed bottom-4 left-4"
          width={16}
        />
      )}
      {state.error && (
        <div className="fixed inset-0 text-red-500 grid place-items-center">
          <div
            className={twMerge(
              "flex flex-col bg-zinc-900 p-8 rounded shadow gap-4",
              state.darkMode ? "bg-zinc-900" : "bg-yellow-50"
            )}
          >
            <div>
              {state.error.type === "api-error"
                ? `API Error: ${state.error.message} (${state.options.apiUrl})`
                : "Something went wrong"}
            </div>
            Consider reviewing your settings.
            <button
              className="place-self-end"
              onClick={() => api.setError(() => null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-rows-[80vh_1fr]">
        <div
          className="w-[80ch] flex flex-col-reverse gap-4 py-8 pr-4 overflow-y-auto whitespace-pre-wrap chatbox"
          ref={scrollRef}
        >
          {state.pendingMessage && (
            <MessageWrapper role={"assistant"}>
              {state.pendingMessage.map((tok, i) => (
                <span key={i} className="animate-fade">
                  {tok}
                </span>
              ))}
            </MessageWrapper>
          )}
          {[...state.messages]
            .reverse()
            .filter((m) => m.role !== "system")
            .map((message, i) => (
              <MessageView
                key={i}
                message={message}
                onChange={(content) => {
                  api.setMessages((messages) =>
                    messages.map((m, j) =>
                      state.messages.length - 1 - i === j
                        ? { ...m, content }
                        : m
                    )
                  );
                }}
              />
            ))}
        </div>
        {showScrollDown && (
          <div className="absolute bottom-4 right-4 animate-fade">
            <LucideArrowDown
              onClick={() => {
                scrollRef.current?.scrollTo({
                  top: scrollRef.current?.scrollHeight ?? 0,
                  behavior: "smooth",
                });
              }}
            />
          </div>
        )}
        <div>
          <ControlBar />
          <MessageInput />
        </div>
      </div>
    </div>
  );
};
