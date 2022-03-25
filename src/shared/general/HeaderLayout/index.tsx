import { h, FunctionalComponent, RenderableProps } from 'preact';
import {} from 'preact/hooks';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';

interface Props {
  onHomeClick?: (event: Event) => void;
}

const Header: FunctionalComponent<Props> = ({
  onHomeClick,
  children,
}: RenderableProps<Props>) => {
  return (
    <div class={styles.mainLayout}>
      <header class={styles.header}>
        <a
          href="/"
          class={styles.homeLink}
          onClick={(event) => onHomeClick?.(event)}
        >
          HTTP 203
        </a>
      </header>
      <div class={styles.main}>{children}</div>
    </div>
  );
};

export default Header;
