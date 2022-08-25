interface NavigationEventMap {
  navigate: NavigateEvent;
}

interface NavigationResult {
  commited: Promise<NavigationHistoryEntry>;
  finished: Promise<NavigationHistoryEntry>;
}

interface Navigation extends EventTarget {
  addEventListener<K extends keyof NavigationEventMap>(
    type: K,
    listener: (this: Navigation, ev: NavigationEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;

  entries(): NavigationHistoryEntry[];
  currentEntry?: NavigationHistoryEntry;
  traverseTo(key: string): NavigationResult;
}

type NavigationAPIType = 'reload' | 'push' | 'replace' | 'traverse';

interface NavigationDestination {
  url: string;
  key: string;
  id: string;
  index: number;
  sameDocument: boolean;
}

interface NavigationInterceptOptions {
  handler?: () => unknown;
  focusReset?: 'after-transition' | 'manual';
  scroll?: 'after-transition' | 'manual';
}

interface NavigationHistoryEntry extends EventTarget {
  url?: string;
  key: string;
  id: string;
  index: number;
  sameDocument: boolean;

  getState(): unknown;
}

interface NavigateEvent extends Event {
  navigationType: NavigationAPIType;
  destination: NavigationDestination;
  canIntercept: boolean;
  userInitiated: boolean;
  hashCahnge: boolean;
  signal: AbortSignal;
  formData?: FormData;
  downloadRequest?: string;
  info: unknown;
  intercept: (options?: NavigationInterceptOptions) => void;
}

declare var navigation: Navigation;
