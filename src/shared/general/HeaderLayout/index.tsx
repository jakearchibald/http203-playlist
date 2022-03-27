import { h, FunctionalComponent, RenderableProps, createRef } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';

interface Props {
  onHomeClick?: (event: Event) => void;
  scrollKey?: unknown;
}

const Header: FunctionalComponent<Props> = ({
  onHomeClick,
  children,
  scrollKey,
}: RenderableProps<Props>) => {
  const scrollerRef = createRef<HTMLDivElement>();

  useEffect(() => {
    scrollerRef.current!.scrollTo(0, 0);
  }, [scrollKey]);

  return (
    <div class={styles.mainLayout}>
      <header class={[styles.header, 'site-header'].join(' ')}>
        <a
          href="/"
          class={styles.homeLink}
          onClick={(event) => onHomeClick?.(event)}
        >
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
