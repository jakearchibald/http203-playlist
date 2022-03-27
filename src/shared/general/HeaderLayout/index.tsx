import { h, FunctionalComponent, RenderableProps, createRef } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';

interface Props {
  onHomeClick?: (event: Event) => void;
  scrollKey?: unknown;
  showBackIcon?: boolean;
}

const Header: FunctionalComponent<Props> = ({
  onHomeClick,
  children,
  scrollKey,
  showBackIcon,
}: RenderableProps<Props>) => {
  const scrollerRef = createRef<HTMLDivElement>();

  useEffect(() => {
    scrollerRef.current!.scrollTo(0, 0);
  }, [scrollKey]);

  return (
    <div class={styles.mainLayout}>
      <header
        class={[
          styles.header,
          showBackIcon && styles.showBackIcon,
          'site-header',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <a
          href="/"
          class={styles.homeLink}
          onClick={(event) => onHomeClick?.(event)}
        >
          <svg class={styles.backIcon} viewBox="0 0 24 24">
            <path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2z" />
          </svg>
          HTTP 203
        </a>
      </header>
      <div ref={scrollerRef} class={styles.main}>
        {children}
      </div>
    </div>
  );
};

export default Header;
