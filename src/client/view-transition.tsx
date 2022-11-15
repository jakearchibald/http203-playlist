interface ViewTransitionState {
  isBack: boolean;
  headerCaptured: boolean;
  fromURL: string;
}

navigation.addEventListener('navigate', (event) => {
  if (event.destination.sameDocument) return;

  const url = new URL(event.destination.url);

  if (url.origin !== location.origin) return;

  const state: ViewTransitionState = {
    isBack:
      event.destination.index !== -1 &&
      event.destination.index < navigation.currentEntry!.index,
    fromURL: location.href,
    headerCaptured: captureHeader(),
  };

  captureSideBar(new URL(location.href), url);

  sessionStorage.viewTransition = JSON.stringify(state, null, ' ');
});

function captureHeader(): boolean {
  const el = document.querySelector('.header');
  if (!el) return false;

  const viewportBounds = new DOMRect(0, 0, innerWidth, innerHeight);

  if (!intersects(el.getBoundingClientRect(), viewportBounds)) return false;

  (el as HTMLElement).style.viewTransitionName = 'header';

  const headerText = document.querySelector('.header-text') as HTMLElement;
  headerText.style.viewTransitionName = 'header-text';

  return true;
}

function captureSideBar(fromURL: URL, toURL: URL): boolean {
  const bothVideos =
    fromURL.pathname.startsWith('/videos/') &&
    toURL.pathname.startsWith('/videos/');

  if (!bothVideos) return false;

  const el = document.querySelector('.side-bar') as HTMLElement;
  el.style.viewTransitionName = 'side-bar';

  return true;
}

function intersects(item: DOMRect, bounds: DOMRect): boolean {
  return (
    item.left < bounds.right &&
    item.right > bounds.left &&
    item.top < bounds.bottom &&
    item.bottom > bounds.top
  );
}

// TODO: make the header back button work via a web component

function setupDocumentTransition() {
  if (!sessionStorage.viewTransition) return;

  const oldState: ViewTransitionState = JSON.parse(
    sessionStorage.viewTransition as string,
  ) as ViewTransitionState;
  delete sessionStorage.viewTransition;

  const headerCaptured = captureHeader();
  captureSideBar(new URL(oldState.fromURL), new URL(location.href));

  const style = document.createElement('style');
  let styleText = `
    @keyframes header-exit {
      to {
        transform: translateY(-60px);
      }
    }

    @keyframes header-enter {
      from {
        transform: translateY(-60px);
      }
    }
  `;

  // Header transition
  if (oldState.headerCaptured && !headerCaptured) {
    console.log('animate header out');
    styleText += `
      ::view-transition-old(header),
      ::view-transition-old(header-text) {
        animation: 300ms ease-out both header-exit;
      }
    `;
  } else if (!oldState.headerCaptured && headerCaptured) {
    console.log('animate header in');
    styleText += `
      ::view-transition-new(header),
      ::view-transition-new(header-text) {
        animation: 300ms ease-out both header-enter;
      }
    `;
  }

  style.textContent = styleText;
  document.head.append(style);
}

setupDocumentTransition();
