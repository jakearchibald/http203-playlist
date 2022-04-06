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
    listener: (this: Navigation, ev: NavigationEventMap[K]) => any,
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

interface NavigationTransitionWhileOptions {
  focusReset: 'after-transition' | 'manual';
  scrollRestoration: 'after-transition' | 'manual';
}

interface NavigationHistoryEntry extends EventTarget {
  url?: string;
  key: string;
  id: string;
  index: number;
  sameDocument: boolean;

  getState(): any;
}

interface NavigateEvent extends Event {
  navigationType: NavigationAPIType;
  destination: NavigationDestination;
  canTransition: boolean;
  userInitiated: boolean;
  hashCahnge: boolean;
  signal: AbortSignal;
  formData?: FormData;
  downloadRequest?: string;
  info: any;
  transitionWhile: (
    newNavigationAction: Promise<void>,
    options?: NavigationTransitionWhileOptions,
  ) => void;
}

declare var navigation: Navigation;
