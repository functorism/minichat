import "openai/shims/web";
import OpenAI from "openai";
import { AppStateContext, GenOptions } from "./state.js";
import { useCallback, useContext } from "react";
import { Messages } from "../types.js";
import { getErrorMessage } from "../utils.js";

async function* chatComplete(messages: Messages, opts: GenOptions) {
  const openai = new OpenAI({
    baseURL: opts.apiUrl,
    apiKey: opts.apiKey,
    dangerouslyAllowBrowser: true,
    fetch: async (url: RequestInfo, init?: RequestInit) => {
      const headers = {
        ...(opts.sendMinimalHeaders
          ? {
              "Content-Type": "application/json",
            }
          : init?.headers),
        ...Object.fromEntries(opts.headers),
      };

      const res = await fetch(url, {
        ...init,
        headers,
      });

      return res;
    },
  });

  const { top_p, temperature, max_tokens, model } = opts;

  const stream = await openai.chat.completions.create({
    model,
    top_p,
    temperature,
    max_tokens,
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content || "";
  }
}

let globalSendLock = { lock: false };

export const useSend = () => {
  const { state, api } = useContext(AppStateContext);

  const send = useCallback(
    async (msgs: Messages) => {
      if (globalSendLock.lock) return;
      globalSendLock.lock = true;

      try {
        const nextMessages = msgs
          .concat([
            {
              role: "user",
              content: state.input,
            },
          ])
          .filter((m) => m.content.trim() !== "");

        api.setMessages(() => nextMessages);

        const response = chatComplete(nextMessages, state.options);

        for await (const chunk of response) {
          const lastUserMsg = document.querySelector('[data-role="user"]');
          const rect = lastUserMsg?.getBoundingClientRect();
          if ((rect?.top ?? 0) > 32) {
            const el = document.querySelector(".chatbox");
            el?.scrollTo(0, el.scrollHeight);
          }
          api.setPendingMessage((prev) => [...(prev ?? []), chunk]);
        }

        api.setPendingMessage((p) => {
          api.setMessages((prev) =>
            prev.concat([{ role: "assistant", content: p?.join("") ?? "" }])
          );

          return null;
        });
      } catch (e) {
        api.setError(() => ({
          type: "api-error",
          message: getErrorMessage(e),
        }));
      } finally {
        globalSendLock.lock = false;
      }
    },
    [api.setMessages, api.setPendingMessage, state.options, state.input]
  );

  const redo = useCallback(
    () => send(state.messages.slice(0, -1)),
    [send, state.messages]
  );

  const undo = useCallback(
    () => api.setMessages((prev) => prev.slice(0, -1)),
    [api.setMessages]
  );

  const locked = () => globalSendLock.lock;

  return { send, redo, undo, locked };
};
