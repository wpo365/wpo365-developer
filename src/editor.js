import { InspectorControls } from '@wordpress/block-editor'
import { PanelBody, PanelRow, TextControl } from '@wordpress/components'
import { registerBlockType } from '@wordpress/blocks'

registerBlockType('wpo365/recent', {
  title: 'WPO365 | RECENT',
  description: "Display the logged-in user's recently used documents.",
  category: 'widgets',
  icon: 'screenoptions',
  supports: {
    html: false,
  },
  attributes: {
    pageSize: {
      type: 'string',
      default: '10',
    },
  },
  edit: (props) => {
    return [
      <InspectorControls>
        <PanelBody
          className={props.className}
          title={'Configuration'}
          initialOpen={false}>
          <PanelRow>
            <TextControl
              label={'Pagesize'}
              help={'The number results to retrieve from Microsoft Graph'}
              value={props.attributes.pageSize}
              onChange={(newValue) => {
                props.setAttributes({ pageSize: newValue })
              }}
            />
          </PanelRow>
        </PanelBody>
      </InspectorControls>,
      <div className={props.className}>
        Publish the page to see the last {props.attributes.pageSize} of your
        recently used documents ...
      </div>,
    ]
  },
  save: (props) => (
    <div
      id='wpo365Recent'
      data-pagesize={props.attributes.pageSize.toString()}></div>
  ),
})
