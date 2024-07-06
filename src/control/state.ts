import { createContext, useCallback, useState } from "react";
import { z } from "zod";
import { Messages } from "../types.js";
import { getDefaults } from "../utils.js";

const getDarkMode = () => {
  try {
    const saved = localStorage.getItem("darkMode");
    const pref = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return saved === null ? pref : saved === "true";
  } catch (e) {
    return false;
  }
};

const saveDarkMode = (dark: boolean) => {
  localStorage.setItem("darkMode", dark ? "true" : "false");
};

const zGenOptions = z.object({
  temperature: z.number().min(0).max(1).default(0),
  top_p: z.number().min(0).max(1).default(1),
  max_tokens: z.number().min(0).default(4096),
  model: z.string().default("llama3:8b"),
  apiKey: z.string().default("unused-ollama-key"),
  apiUrl: z.string().default("http://localhost:11434/v1"),
  headers: z.array(z.tuple([z.string(), z.string()])).default([]),
  sendMinimalHeaders: z.boolean().default(false),
});

const getGenOptions = (): GenOptions => {
  try {
    const saved = localStorage.getItem("genOptions");
    const parsed = zGenOptions.safeParse(JSON.parse(saved ?? "{}"));
    return parsed.success
      ? parsed.data
      : (getDefaults(zGenOptions) as GenOptions);
  } catch (e) {
    return getDefaults(zGenOptions) as GenOptions;
  }
};

const saveGenOptions = (opts: GenOptions) => {
  localStorage.setItem("genOptions", JSON.stringify(opts));
};

type AppError = { type: "api-error"; message: string };

export type GenOptions = {
  temperature: number;
  top_p: number;
  max_tokens: number;
  model: string;
  apiKey: string;
  apiUrl: string;
  headers: Array<[string, string]>;
  sendMinimalHeaders: boolean;
};

export type AppState = {
  options: GenOptions;
  darkMode: boolean;
  messages: Messages;
  pendingMessage: string[] | null;
  optionsOpen: boolean;
  input: string;
  error: AppError | null;
};

export type AppStateAPI = {
  state: AppState;

  api: {
    toggleDarkMode: () => void;

    setOptions: (modify: (opts: GenOptions) => GenOptions) => void;

    setMessages: (modify: (messages: Messages) => Messages) => void;

    setPendingMessage: (
      modify: (pendingMessage: string[] | null) => string[] | null
    ) => void;

    setOptionsOpen: (modify: (optionsOpen: boolean) => boolean) => void;

    setInput: (input: string) => void;

    setError: (modify: (error: AppError | null) => AppError | null) => void;
  };
};

const initAppStateAPI = (): AppStateAPI => ({
  state: {
    options: getGenOptions(),
    darkMode: getDarkMode(),
    messages: [],
    pendingMessage: null,
    optionsOpen: false,
    input: "",
    error: null,
  },

  api: {
    toggleDarkMode: () => {},
    setOptions: () => {},
    setMessages: () => {},
    setPendingMessage: () => {},
    setOptionsOpen: () => {},
    setInput: () => {},
    setError: () => {},
  },
});

export const AppStateContext = createContext<AppStateAPI>(initAppStateAPI());

export const useAppStateAPI = (): AppStateAPI => {
  const [state, setState] = useState(initAppStateAPI().state);

  const toggleDarkMode = useCallback(() => {
    setState((prev) => {
      saveDarkMode(!prev.darkMode);
      return { ...prev, darkMode: !prev.darkMode };
    });
  }, [setState]);

  const setOptions = useCallback(
    (modify: (opts: GenOptions) => GenOptions) => {
      setState((prev) => {
        const next = modify(prev.options);
        saveGenOptions(next);
        return { ...prev, options: next };
      });
    },
    [setState]
  );

  const setMessages = useCallback(
    (modify: (messages: Messages) => Messages) => {
      setState((prev) => ({ ...prev, messages: modify(prev.messages) }));
    },
    [setState]
  );

  const setPendingMessage = useCallback(
    (modify: (pendingMessage: string[] | null) => string[] | null) => {
      setState((prev) => ({
        ...prev,
        pendingMessage: modify(prev.pendingMessage),
      }));
    },
    [setState]
  );

  const setInput = useCallback(
    (input: string) => {
      setState((prev) => ({ ...prev, input }));
    },
    [setState]
  );

  const setOptionsOpen = useCallback(
    (modify: (optionsOpen: boolean) => boolean) => {
      setState((prev) => ({
        ...prev,
        optionsOpen: modify(prev.optionsOpen),
      }));
    },
    [setState]
  );

  const setError = useCallback(
    (modify: (error: AppError | null) => AppError | null) => {
      setState((prev) => ({ ...prev, error: modify(prev.error) }));
    },
    [setState]
  );

  return {
    state,
    api: {
      setOptionsOpen,
      toggleDarkMode,
      setOptions,
      setMessages,
      setPendingMessage,
      setInput,
      setError,
    },
  };
};
