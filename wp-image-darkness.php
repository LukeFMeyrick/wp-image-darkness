<?php

/**
 *
 * @wordpress-plugin
 * Plugin Name: WP Image Darkness
 * Description: Meta Field Image Darkness
 * Author: Luke Meyrick
 * Version: 1.0
 * Author URI: http://lukemeyrick.com/
 */


if (!defined('ABSPATH')) exit;


class ImageDarkness {

	public $errors = false;
	public $notices = false;

	function __construct() {

		$this->path = plugin_dir_path(__FILE__);
		$this->folder = basename($this->path);
		$this->dir = plugin_dir_url(__FILE__);
		$this->version = '1.0';

		$this->errors = false;
		$this->notice = false;

		// Actions
		if(is_admin()){

			add_action('init', array($this, 'setup'), 10, 0);
			add_action('admin_enqueue_scripts', array($this, 'scripts'),999, 0);
			add_action('rest_api_init', array($this, 'setup_darkness_meta'));

		}

	}

	/**
	 * Setup The Plugin
	 * @return null
	 */

	public function setup() {
	}

	/**
	 * Add Custom scriptions
	 * @return type
	 */

	public function scripts() {

		 wp_enqueue_script('image_darkness_js', $this->dir.'assets/darkness.js', array('media-upload', 'swfupload', 'plupload'), $this->version, true);

		 wp_localize_script( 'image_darkness_js', 'IMAGE_DARKNESS', array(
			 'root' => esc_url_raw( rest_url() ),
			 'nonce' => wp_create_nonce( 'wp_rest' ),
			 'success' => 'Success',
			 'saved' => 'The image darkness has been set.',
			 'failure' => 'Sorry, the image darkness could not be set.',
			 'current_user_id' => get_current_user_id()
		 ));

	}

	public function setup_custom_meta() {

		register_rest_field( 'post', 'image_darkness',
			array(
				'get_callback'    => array( $this, 'get_image_meta'),
				'update_callback' => array( $this, 'update_image_meta'),
				'schema'          => null,
			)
		);
	}

	public function get_image_meta( $object, $field_name, $request ) {
		trace($object,'GET');
		return get_post_meta( $object['id'], $field_name, (int) $value );
	}

	public function update_image_meta( $value, $object, $field_name ) {
		return update_post_meta( $object->ID, $field_name, (int) $value );
	}

}


// ------------------------------------
// Go
// ------------------------------------

$image_darkness = new ImageDarkness();
