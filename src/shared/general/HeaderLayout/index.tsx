import { h, FunctionalComponent, RenderableProps } from 'preact';
import {} from 'preact/hooks';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';

interface Props {}

const Header: FunctionalComponent<Props> = (props: RenderableProps<Props>) => {
  return (
    <div class={styles.mainLayout}>
      <header class={styles.header}>
        <a href="/" class={styles.homeLink}>
          HTTP 203
        </a>
      </header>
      <div class={styles.main}>{props.children}</div>
    </div>
  );
};

export default Header;
