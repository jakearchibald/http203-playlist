import { h, FunctionalComponent, RenderableProps, createRef } from 'preact';
import {} from 'preact/hooks';
import { cohosts } from 'shared/data';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';

interface Props {
  selectedCohost?: typeof cohosts[number];
}

const CohostSwitch: FunctionalComponent<Props> = ({
  selectedCohost,
}: RenderableProps<Props>) => {
  return (
    <ol class={[styles.cohostSwitch, 'cohost-switch'].join(' ')}>
      <li class={selectedCohost ? '' : styles.currentCohost}>
        <a href="/">All</a>
      </li>
      {cohosts.map((cohost) => (
        <li class={selectedCohost === cohost ? styles.currentCohost : ''}>
          <a href={`/with-${cohost.toLowerCase()}/`}>{cohost}</a>
        </li>
      ))}
    </ol>
  );
};

export default CohostSwitch;
