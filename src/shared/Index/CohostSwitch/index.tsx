import { h, FunctionalComponent, RenderableProps, Fragment } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
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
  const dialogRef = useRef<HTMLDialogElement>(null);

  const startDialogOpenTransition = usePageTransition({
    incoming() {
      document.documentElement.classList.add('no-root-transition');
    },
    done() {
      document.documentElement.classList.remove('no-root-transition');
    },
  });

  const startDialogCloseTransition = usePageTransition({
    incoming() {
      document.documentElement.classList.add('no-root-transition');
    },
    done() {
      document.documentElement.classList.remove('no-root-transition');
    },
  });

  useEffect(() => {
    const listener = () => setModalOpen(false);
    const dialog = dialogRef.current!;
    dialog.addEventListener('close', listener);
    return () => dialog.removeEventListener('close', listener);
  }, [dialogRef]);

  useEffect(() => {
    const listener = (event: Event) => {
      event.preventDefault();
      console.log('close from cancel');
      void startDialogCloseTransition().then(() => {
        dialogRef.current!.close();
      });
    };
    const dialog = dialogRef.current!;
    dialog.addEventListener('cancel', listener);
    return () => dialog.removeEventListener('cancel', listener);
  }, [dialogRef]);

  useEffect(() => {
    if (!dialogRef.current?.open) return;
    console.log('close from cohost change');

    void startDialogCloseTransition().then(() => {
      dialogRef.current!.close();
    });
  }, [selectedCohost, startDialogCloseTransition]);

  const onButtonClick = () => {
    void startDialogOpenTransition().then(() => {
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
