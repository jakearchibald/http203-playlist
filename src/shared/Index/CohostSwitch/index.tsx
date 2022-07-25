import {
  h,
  FunctionalComponent,
  RenderableProps,
  Fragment,
  createRef,
} from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { cohosts } from 'shared/data';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';
import { usePageTransition } from 'shared/utils';

interface Props {
  selectedCohost?: typeof cohosts[number];
}

const CohostSwitch: FunctionalComponent<Props> = ({
  selectedCohost,
}: RenderableProps<Props>) => {
  const [modalOpen, setModalOpen] = useState(false);
  const dialogRef = createRef<HTMLDialogElement>();

  const startTransition = usePageTransition({
    incoming() {
      console.log('incoming');
      document.documentElement.classList.add('no-root-transition');
    },
    done() {
      console.log('done');
      document.documentElement.classList.remove('no-root-transition');
    },
  });

  // TODO: something screwy is happening with 'incoming' happening twice
  // Happens when dialog is closed with esc

  useEffect(() => {
    const listener = () => setModalOpen(false);
    const dialog = dialogRef.current!;
    dialog.addEventListener('close', listener);
    return () => dialog.removeEventListener('close', listener);
  }, [dialogRef]);

  useEffect(() => {
    dialogRef.current!.close();
  }, [selectedCohost]);

  const onButtonClick = () => {
    void startTransition().then(() => {
      dialogRef.current!.showModal();
      setModalOpen(true);
    });
  };

  return (
    <>
      <button
        class={styles.cohostSwitch}
        style={{ visibility: modalOpen ? 'hidden' : '' }}
        onClick={onButtonClick}
      >
        Cohost:{' '}
        <span class={styles.selectedCohost}>{selectedCohost || 'All'}</span>
      </button>
      <dialog ref={dialogRef} class={styles.modal}>
        <ol class={styles.cohostList}>
          <li>
            <a href="/">All</a>
          </li>
          {cohosts.map((cohost) => (
            <li>
              <a
                href={`/with-${cohost.toLowerCase()}/`}
                class={selectedCohost === cohost ? styles.currentInList : ''}
              >
                {cohost}
              </a>
            </li>
          ))}
        </ol>
      </dialog>
    </>
  );
};

export default CohostSwitch;
