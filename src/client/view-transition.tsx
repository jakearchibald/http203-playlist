const enum PageType {
  Thumbs,
  Video,
  Unknown,
}

const pageTypeClassNames = {
  [PageType.Thumbs]: 'thumbs',
  [PageType.Video]: 'video',
  [PageType.Unknown]: 'unknown',
} as const;

const enum NavigationType {
  New,
  Back,
  Other,
}

function getNavigationType(event: NavigateEvent): NavigationType {
  if (event.navigationType === 'push' || event.navigationType === 'replace') {
    return NavigationType.New;
  }
  if (
    event.destination.index !== -1 &&
    event.destination.index < navigation.currentEntry!.index
  ) {
    return NavigationType.Back;
  }
  return NavigationType.Other;
}

interface ViewTransitionState {
  isBack: boolean;
  fromURL: string;
  fromType: PageType;
  toType: PageType;
  thumbnailCapture: DOMRect | null;
  embedContainerCapture: DOMRect | null;
  navType: NavigationType;
}

function getPageType(url: string): PageType {
  if (url === '/' || url.startsWith('/with-')) return PageType.Thumbs;
  if (url.startsWith('/videos/')) return PageType.Video;
  return PageType.Unknown;
}

function setHTMLClasses(
  fromType: PageType,
  toType: PageType,
  navType: NavigationType,
) {
  document.documentElement.className = [
    `from-${pageTypeClassNames[fromType]}`,
    `to-${pageTypeClassNames[toType]}`,
    navType === NavigationType.Back && 'back-transition',
  ]
    .filter(Boolean)
    .join(' ');
}

navigation.addEventListener('navigate', (event) => {
  if (event.destination.sameDocument) return;

  const toURL = new URL(event.destination.url);
  const fromURL = new URL(location.href);

  if (toURL.origin !== location.origin) return;

  // Undo previous thumb name setting
  for (const el of document.querySelectorAll<HTMLElement>('.video-thumb')) {
    el.closest('a')!.style.viewTransitionName = '';
  }

  const fromType = getPageType(fromURL.pathname);
  const toType = getPageType(toURL.pathname);
  const navType = getNavigationType(event);

  setHTMLClasses(fromType, toType, navType);
  captureHeader();

  const state: ViewTransitionState = {
    isBack:
      event.destination.index !== -1 &&
      event.destination.index < navigation.currentEntry!.index,
    fromURL: fromURL.href,
    fromType,
    toType,
    navType,
    thumbnailCapture: captureThumbnail(fromType, toType, toURL),
    embedContainerCapture: captureEmbedContainer(fromType),
  };

  sessionStorage.viewTransition = JSON.stringify(state, null, ' ');
});

function captureThumbnail(
  fromType: PageType,
  toType: PageType,
  toURL: URL,
): null | DOMRect {
  if (fromType !== PageType.Thumbs || toType !== PageType.Video) return null;

  const thumbLink = document.querySelector(`a[href="${toURL.pathname}"]`);

  if (!thumbLink) return null;

  const thumb = thumbLink.querySelector(`.video-thumb`) as HTMLElement;
  thumb.closest('a')!.style.viewTransitionName = 'embed-container';
  return thumb.getBoundingClientRect();
}

function captureEmbedContainer(fromType: PageType): null | DOMRect {
  if (fromType !== PageType.Video) return null;
  return document
    .querySelector<HTMLElement>('.embed-container')!
    .getBoundingClientRect();
}

function captureHeader() {
  const el = document.querySelector<HTMLElement>('.header');
  if (!el) return;

  const viewportBounds = new DOMRect(0, 0, innerWidth, innerHeight);

  if (!intersects(el.getBoundingClientRect(), viewportBounds)) return;

  el.style.viewTransitionName = 'header';

  const headerText = document.querySelector<HTMLElement>('.header-text')!;
  headerText.style.viewTransitionName = 'header-text';
}

function intersects(item: DOMRect, bounds: DOMRect): boolean {
  return (
    item.left < bounds.right &&
    item.right > bounds.left &&
    item.top < bounds.bottom &&
    item.bottom > bounds.top
  );
}

function createTransform(from: DOMRect, to: DOMRect): string {
  const scaleX = to.width / from.width;
  const scaleY = to.height / from.height;

  return new DOMMatrix()
    .translate(to.left - scaleX * from.left, to.top - scaleY * from.top)
    .scale(scaleX, scaleY)
    .toString();
}

function setupDocumentTransition() {
  if (!sessionStorage.viewTransition) return;

  const oldState: ViewTransitionState = JSON.parse(
    sessionStorage.viewTransition as string,
  ) as ViewTransitionState;
  delete sessionStorage.viewTransition;

  const fromURL = new URL(oldState.fromURL);
  captureHeader();
  setHTMLClasses(oldState.fromType, oldState.toType, oldState.navType);

  const style = document.createElement('style');

  // Thumb-to-video transition
  if (oldState.thumbnailCapture) {
    const fullEmbed = document.querySelector('.embed-container') as HTMLElement;
    const fullEmbedRect = fullEmbed.getBoundingClientRect();

    style.textContent = [
      `@keyframes thumbnail-anim {`,
      `  from {`,
      `    transform: ${createTransform(
        fullEmbedRect,
        oldState.thumbnailCapture,
      )};`,
      `  }`,
      `  to {`,
      `    transform: none;`,
      `  }`,
      `}`,
      `::view-transition-new(root) {`,
      `  animation: 150ms ease both 60ms -ua-view-transition-fade-in, 300ms ease both thumbnail-anim;`,
      `}`,
    ].join('\n');
  }

  // Video-to-thumb transition
  const thumbLink = document.querySelector<HTMLElement>(
    `a[href="${fromURL.pathname}"]`,
  );

  if (oldState.embedContainerCapture && thumbLink) {
    const thumb = thumbLink.querySelector(`.video-thumb`) as HTMLElement;
    thumbLink.style.viewTransitionName = 'embed-container';

    const thumbnailRect = thumb.getBoundingClientRect();

    style.textContent = [
      `@keyframes thumbnail-anim {`,
      `  from {`,
      `    transform: none;`,
      `  }`,
      `  to {`,
      `    transform: ${createTransform(
        oldState.embedContainerCapture,
        thumbnailRect,
      )};`,
      `  }`,
      `}`,
      `::view-transition-old(root) {`,
      `  animation: 150ms ease both 60ms -ua-view-transition-fade-out, 300ms ease both thumbnail-anim;`,
      `}`,
    ].join('\n');
  }

  document.head.append(style);
}

setupDocumentTransition();
