import { h, RenderableProps, Component, createRef } from 'preact';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';

interface Props {
  showBackIcon?: boolean;
}

export default class Header extends Component<Props> {
  #headerContainerRef = createRef<HTMLDivElement>();
  #headerRef = createRef<HTMLElement>();

  #scrollDebounceId = 0;

  #onScroll = () => {
    clearTimeout(this.#scrollDebounceId);
    this.#scrollDebounceId = setTimeout(
      () => this.#sizeHeaderContainer(),
      250,
    ) as unknown as number;
  };

  #onResize = () => {
    this.#sizeHeaderContainer();
  };

  #sizeHeaderContainer = () => {
    const bounds = this.#headerRef.current!.getBoundingClientRect();
    const scrollOffset = document.documentElement.scrollTop;
    const headerContainer = this.#headerContainerRef.current!;

    // The header is out of view.
    // Change it's container so it's just out of view.
    if (bounds.top + bounds.height <= 0) {
      headerContainer.style.height = `${scrollOffset}px`;
      headerContainer.style.marginBottom = `${
        bounds.height + scrollOffset * -1
      }px`;
      return;
    }

    // The header is fully in view.
    // Change it's container so this is the maximum y it can be.
    if (bounds.top === 0) {
      headerContainer.style.height = `${scrollOffset + bounds.height}px`;
      headerContainer.style.marginBottom = `${scrollOffset * -1}px`;
      return;
    }

    // Otherwise, the header is partially visible, so do nothing.
  };

  componentDidMount() {
    addEventListener('scroll', this.#onScroll);
    addEventListener('resize', this.#onResize);
  }

  componentWillUnmount() {
    removeEventListener('scroll', this.#onScroll);
    removeEventListener('resize', this.#onResize);
  }

  #onHomeClick = (event: Event) => {
    const backEntriesReversed = navigation
      .entries()
      .slice(0, navigation.currentEntry!.index)
      .reverse();

    const entry = backEntriesReversed.find((entry) => {
      if (!entry.url) return false;
      const entryURL = new URL(entry.url);
      return (
        entryURL.origin === location.origin &&
        (entryURL.pathname === '/' || entryURL.pathname.startsWith('/with-'))
      );
    });

    if (!entry) return;

    event.preventDefault();
    navigation.traverseTo(entry.key);
  };

  render({ children, showBackIcon }: RenderableProps<Props>) {
    return (
      <div class={styles.mainLayout}>
        <div ref={this.#headerContainerRef} class={styles.headerContainer}>
          <header
            ref={this.#headerRef}
            class={[styles.header, showBackIcon && styles.showBackIcon]
              .filter(Boolean)
              .join(' ')}
          >
            <a href="/" class={styles.homeLink} onClick={this.#onHomeClick}>
              <svg class={styles.backIcon} viewBox="0 0 24 24">
                <path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2z" />
              </svg>
              <span class={styles.headerText}>HTTP 203</span>
            </a>
          </header>
        </div>
        <div class={styles.main}>{children}</div>
      </div>
    );
  }
}
