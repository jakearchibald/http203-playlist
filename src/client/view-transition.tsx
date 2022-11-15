interface ViewTransitionState {
  isBack: boolean;
  headerCaptured: boolean;
  fromURL: string;
  thumbnailCapture: DOMRect | null;
  embedContainerCapture: DOMRect | null;
}

navigation.addEventListener('navigate', (event) => {
  if (event.destination.sameDocument) return;

  const toURL = new URL(event.destination.url);
  const fromURL = new URL(location.href);

  if (toURL.origin !== location.origin) return;

  // Undo previous transition name setting
  const fullEmbed = document.querySelector<HTMLElement>('.embed-container');
  if (fullEmbed) fullEmbed.style.viewTransitionName = '';

  // Undo previous thumb name setting
  for (const el of document.querySelectorAll<HTMLElement>('.video-thumb')) {
    el.style.viewTransitionName = '';
  }

  const state: ViewTransitionState = {
    isBack:
      event.destination.index !== -1 &&
      event.destination.index < navigation.currentEntry!.index,
    fromURL: fromURL.href,
    headerCaptured: captureHeader(),
    thumbnailCapture: captureThumbnail(fromURL, toURL),
    embedContainerCapture: captureEmbedContainer(toURL),
  };

  captureSideBar(fromURL, toURL);

  sessionStorage.viewTransition = JSON.stringify(state, null, ' ');
});

function captureThumbnail(fromURL: URL, toURL: URL): null | DOMRect {
  if (fromURL.pathname.startsWith('/videos/')) return null;

  const thumbLink = document.querySelector(`a[href="${toURL.pathname}"]`);

  if (!thumbLink) return null;

  const thumb = thumbLink.querySelector(`.video-thumb`) as HTMLElement;
  thumb.style.viewTransitionName = 'embed-container';
  return thumb.getBoundingClientRect();
}

function captureEmbedContainer(toURL: URL): null | DOMRect {
  if (toURL.pathname.startsWith('/videos/')) return null;

  const fullEmbed = document.querySelector<HTMLElement>('.embed-container');
  if (!fullEmbed) return null;

  fullEmbed.style.viewTransitionName = 'embed-container';
  return fullEmbed.getBoundingClientRect();
}

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

function setupDocumentTransition() {
  if (!sessionStorage.viewTransition) return;

  const oldState: ViewTransitionState = JSON.parse(
    sessionStorage.viewTransition as string,
  ) as ViewTransitionState;
  delete sessionStorage.viewTransition;

  const fromURL = new URL(oldState.fromURL);

  const headerCaptured = captureHeader();
  captureSideBar(fromURL, new URL(location.href));

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

    @keyframes fade-in {
      from {
        opacity: 0;
      }
    }

    @keyframes fade-out {
      to {
        opacity: 0;
      }
    }
  `;

  // Header transition
  if (oldState.headerCaptured && !headerCaptured) {
    styleText += `
      ::view-transition-old(header),
      ::view-transition-old(header-text) {
        animation: 300ms ease-out both header-exit;
      }
    `;
  } else if (!oldState.headerCaptured && headerCaptured) {
    styleText += `
      ::view-transition-new(header),
      ::view-transition-new(header-text) {
        animation: 300ms ease-out both header-enter;
      }
    `;
  }

  // Thumb-to-video transition
  if (oldState.thumbnailCapture) {
    const fullEmbed = document.querySelector('.embed-container') as HTMLElement;
    const fullEmbedRect = fullEmbed.getBoundingClientRect();

    fullEmbed.style.viewTransitionName = 'embed-container';

    const scale = oldState.thumbnailCapture.width / fullEmbedRect.width;

    styleText += `
      @keyframes thumbnail-anim {
        from {
          width: ${innerWidth * scale}px;
          height: ${innerHeight * scale}px;
          transform: translate(${
            oldState.thumbnailCapture.left - fullEmbedRect.left * scale
          }px, ${oldState.thumbnailCapture.top - fullEmbedRect.top * scale}px);
        }
        to {
          width: ${innerWidth}px;
          height: ${innerHeight}px;
          transform: translate(0px, 0px);
        }
      }

      ::view-transition-old(root) {
        animation: none;
        mix-blend-mode: normal;
      }

      ::view-transition-new(root) {
        animation: 300ms ease-out both fade-in, 300ms ease-out both thumbnail-anim;
        mix-blend-mode: normal;
      }

      ::view-transition-image-pair(root) {
        isolation: auto;
      }

      ::view-transition-group(embed-container) {
        animation-duration: 300ms;
        animation-timing-function: ease-out;
      }
    `;
  }

  // Video-to-thumb transition
  const thumbLink = document.querySelector(`a[href="${fromURL.pathname}"]`);

  if (oldState.embedContainerCapture && thumbLink) {
    const thumb = thumbLink.querySelector(`.video-thumb`) as HTMLElement;
    thumb.style.viewTransitionName = 'embed-container';

    const thumbnailRect = thumb.getBoundingClientRect();
    const scale = thumbnailRect.width / oldState.embedContainerCapture.width;

    styleText += `
      @keyframes thumbnail-anim {
        from {
          width: ${innerWidth}px;
          height: ${innerHeight}px;
          transform: translate(0px, 0px);
        }
        to {
          width: ${innerWidth * scale}px;
          height: ${innerHeight * scale}px;
          transform: translate(
            ${
              thumbnailRect.left - oldState.embedContainerCapture.left * scale
            }px,
            ${thumbnailRect.top - oldState.embedContainerCapture.top * scale}px
          );
        }
      }

      ::view-transition-new(root) {
        animation: none;
        mix-blend-mode: normal;
      }

      ::view-transition-old(root) {
        animation: 300ms ease-out both fade-out, 300ms ease-out both thumbnail-anim;
        mix-blend-mode: normal;
        z-index: 1;
      }

      ::view-transition-image-pair(root) {
        isolation: auto;
      }

      ::view-transition-group(embed-container) {
        animation-duration: 300ms;
        animation-timing-function: ease-out;
      }
    `;
  }

  style.textContent = styleText;
  document.head.append(style);
}

setupDocumentTransition();
