import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App.jsx';

/**
 * SSR render function called by Express for GET /.
 * Returns an HTML string to inject into <div id="root">.
 *
 * @param {string} url - the request URL (e.g. '/')
 * @returns {string} rendered HTML
 */
export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
}
