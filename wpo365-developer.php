<?php

    /**
     *  Plugin Name: WPO365 | DEVELOPER
     *  Plugin URI: https://github.com/wpo365/pintra-fx-examples
     *  Description: A simple plugin that will add a Gutenberg Block that will display the logged-in user's recently used and accessed documents (requires WPO365 | LOGIN >= v13).
     *  Version: 1.0.0
     *  Author: marco@wpo365.com
     *  Author URI: https://www.wpo365.com
     *  License: GPL2+
     */

namespace Wpo;

class Developer {

    public function __construct() {
        add_action( 'enqueue_block_editor_assets', function() {
            $this->enqueue_editor_assets( 'recent', __DIR__, \plugins_url() . '/' . basename( __DIR__ ) );
        } );
        
        add_action( 'enqueue_block_assets', function() {
            $this->enqueue_assets( 'recent', __DIR__, \plugins_url() . '/' . basename( __DIR__ )  );
        } );
    }
    /**
     * Enqueues js / css assets that will only be loaded for the back end.
     * 
     * @since   1.0.0
     * 
     * @return  void
     */
    private function enqueue_editor_assets( $app, $plugins_dir, $plugins_url ) {
        $editor_block_path = "/dist/$app/editor.js";
        $editor_block_asset_file = include( $plugins_dir . "/dist/$app/editor.asset.php" );
        
        // Enqueue the bundled block JS file
        \wp_enqueue_script(
            "wpo365-$app-editor",
            $plugins_url . $editor_block_path,
            $editor_block_asset_file['dependencies'],
            $editor_block_asset_file['version'],
        );
        \wp_add_inline_script( "wpo365-$app-editor", 'window.wpo365 = window.wpo365 || {}; window.wpo365.blocks = ' . json_encode( array(
            'nonce' => \wp_create_nonce( 'wp_rest' ),
            'apiUrl' => \trailingslashit( \get_option( 'home' ) ) . 'wp-json/wpo365/v1/graph',
        ) ), 'before' );
    }
    /**
     * Enqueues js / css assets that will be loaded for both front and back end.
     * 
     * @since   1.0.0
     * 
     * @return  void
     */
    private function enqueue_assets( $app, $plugins_dir, $plugins_url ) {
        $app_block_path = "/dist/$app/app.js";
        $app_block_asset_file = include( $plugins_dir . "/dist/$app/app.asset.php");

        if ( is_singular() ) {
            $id = get_the_ID();
            
            if ( has_block( 'wpo365/' . \strtolower( $app ), $id ) ) {

                \wp_enqueue_script( 'wpo365-unpkg-react', 'https://unpkg.com/react@16/umd/react.production.min.js' );
                \wp_enqueue_script( 'wpo365-unpkg-react-dom', 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js' );
            
                \wp_enqueue_script( 
                    "wpo365-$app-block",
                    $plugins_url . $app_block_path,
                    \array_merge( $app_block_asset_file['dependencies'], array( 'wpo365-unpkg-react', 'wpo365-unpkg-react-dom' ) ),
                    $app_block_asset_file['version'],
                    true ); // Load in footer so the page has rendered and the block with the class can be found
                
                \wp_add_inline_script( "wpo365-$app-block", 'window.wpo365 = window.wpo365 || {}; window.wpo365.blocks = ' . json_encode( array(
                    'nonce' => \wp_create_nonce( 'wp_rest' ),
                    'apiUrl' => \trailingslashit( \get_option( 'home' ) ) . 'wp-json/wpo365/v1/graph',
                ) ), 'before' );
            }
        }
    }
}

new Developer();
