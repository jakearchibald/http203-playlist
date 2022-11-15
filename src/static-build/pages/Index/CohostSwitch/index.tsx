import { h, FunctionalComponent, RenderableProps } from 'preact';
import { cohosts } from 'static-build/data';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';

interface Props {
  selectedCohost?: typeof cohosts[number];
}

const CohostSwitch: FunctionalComponent<Props> = ({
  selectedCohost,
}: RenderableProps<Props>) => (
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

export default CohostSwitch;
