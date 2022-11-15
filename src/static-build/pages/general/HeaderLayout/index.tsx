import { h, RenderableProps, FunctionalComponent } from 'preact';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';

interface Props {
  showBackIcon?: boolean;
}

const Header: FunctionalComponent<Props> = ({
  children,
  showBackIcon,
}: RenderableProps<Props>) => (
  <div class={styles.mainLayout}>
    <div class={styles.headerContainer}>
      <header
        class={['header', styles.header, showBackIcon && styles.showBackIcon]
          .filter(Boolean)
          .join(' ')}
      >
        <a href="/" class={styles.homeLink}>
          <svg class={styles.backIcon} viewBox="0 0 24 24">
            <path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2z" />
          </svg>
          <span class={['header-text', styles.headerText].join(' ')}>
            HTTP 203
          </span>
        </a>
      </header>
    </div>
    <div class={styles.main}>{children}</div>
  </div>
);

export default Header;
