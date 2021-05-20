import * as React from 'react'
import * as ReactDOM from 'react-dom'

/**
 * Adding the following imports will add them as dependencies to the generated app.asset.php file.
 * Those dependencies will then help WordPress decide in what order to load app.js.
 */
import { registerBlockType } from '@wordpress/blocks'
import { createElement } from '@wordpress/element'

/**
 * This is the element that will be added by the save method of the block's editor.
 * Since this script is loaded in the footer of the page (see enqueue_assets method in
 * wpo365-developer.php) this should be completely safe.
 */
const reactContainer = document.getElementById('wpo365Recent')

/**
 * Helper to try and parse value as an integer. Returns the defaultValue if value can't be parse
 *
 * @param {*} value
 * @param {*} defaultValue
 * @returns
 */
const getNumberOrDefault = (value, defaultValue) =>
  !!value && !isNaN(parseInt(value)) ? parseInt(value) : defaultValue

/**
 * Renders a simple table that will display the recently used documents.
 *
 * @param {*} items
 * @returns
 */
const renderTable = (items) => {
  return (
    <table>
      <tbody>
        <tr>
          <th>My recent documents</th>
        </tr>
        {Array.isArray(items) &&
          items.map((item, key) => (
            <tr key={'tr_' + key}>
              <td key={'td_' + key}>{item.resourceVisualization.title}</td>
            </tr>
          ))}
      </tbody>
    </table>
  )
}

/**
 * A simple React component that will look up the div with ID "wpo365Recent"
 * that the block's editor "saved" in the page when the block was added.
 *
 * The component will, when mounted, try and fetch the logged-in user's recently
 * viewed documents from Microsoft Graph. This request is transparently "proxied"
 * through the WPO365 | LOGIN RESTful API for Microsoft Graph.
 *
 * @param {*} _
 * @returns
 */
const App = (_) => {
  // From wp_add_inline_script when the block was enqueued
  const nonce = window.wpo365.blocks.nonce

  // From wp_add_inline_script when the block was enqueued
  const apiUrl = window.wpo365.blocks.apiUrl

  // Block attribute added as data attribute when the block was saved in the editor
  const pageSize = getNumberOrDefault(
    reactContainer.getAttribute('data-pagesize'),
    10
  )

  const [table, updateTable] = React.useState(<p>Table will appear here</p>)
  const [lastError, updateLastError] = React.useState('')

  React.useEffect(() => {
    fetch(apiUrl + '/me', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; odata=verbose',
        'X-WP-Nonce': nonce,
      },
      body: JSON.stringify({
        /**
         * The data to be posted to Microsoft Graph e.g. { "requests": [ { "entityTypes": [ "message" ], "query": { "queryString": "contoso" } } ] }.
         */
        data: null,

        /**
         * Additional headers to be included when fetching from Microsoft Graph e.g. {consistencylevel: 'eventual'}
         */
        headers: null,

        /**
         * The query string e.g. mainly when reading data e.g. [sites]/wpo365demo.sharepoint.com:/.
         */
        query:
          'insights/used?$orderby=LastUsed/LastAccessedDateTime+desc&$top=' +
          pageSize,

        /**
         * Scope for the permissions needed e.g. https://graph.microsoft.com/Sites.Read.All.
         */
        scope: 'https://graph.microsoft.com/Sites.Read.All',

        /**
         * Whether to use application instead of delegated permissions.
         */
        application: false,

        /**
         * Whether the payload is binary (the result will be an object with exactly one property: { "binary": "[base64 encoded string]"" })
         */
        binary: false,

        /**
         * How to fetch from Microsoft Graph (default: GET).
         */
        method: 'GET',
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        if (typeof data == 'object' && data.value) {
          updateTable(renderTable(data.value))
        } else {
          throw 'Fetch returned an unexpected result -> ' + JSON.stringify(data)
        }
      })
      .catch((err) => {
        if (err.response) {
          updateLastError(JSON.stringify(err.response.data))
        } else {
          updateLastError(JSON.stringify(err))
        }
      })
  }, [])

  return (
    <div>
      <div style={{ display: 'block' }}>{table}</div>
      {lastError && <div style={{ display: 'block' }}>{lastError}</div>}
    </div>
  )
}

ReactDOM.render(<App />, reactContainer)
