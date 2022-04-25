import { h, hydrate } from 'preact';
import videos from 'video-data:';
import App from './App';

hydrate(<App videos={videos} />, document.getElementById('app')!);
