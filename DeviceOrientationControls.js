import * as THREE from 'three'
/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

export const DeviceOrientationControls = function( object, offsetDeg ) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( "YXZ" );

	this.enabled = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	this.alpha = 0;
	this.alphaOffsetAngle = offsetDeg?.alpha || 0;
	this.betaOffsetAngle = offsetDeg?.beta || 0;
	this.gammaOffsetAngle = offsetDeg?.gamma || 0;


	var onDeviceOrientationChangeEvent = function( event ) {

		scope.deviceOrientation = event;

	};

	// var onScreenOrientationChangeEvent = function() {

	// 	scope.screenOrientation = 0;

	// };

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	var setObjectQuaternion = function() {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function( quaternion, alpha, beta, gamma, orient ) {

			euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler ); // orient the device

			quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation

		};

	}();

	this.connect = function() {

		//onScreenOrientationChangeEvent(); // run once on load

		//window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = true;

	};

	this.disconnect = function() {

		//window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;

	};

	this.update = function() {

		if ( scope.enabled === false ) return;

		if(typeof scope.deviceOrientation.alpha === 'number') {
			if(typeof this.alphaOffsetAngle === 'undefined') {
				this.alphaOffsetAngle = -scope.deviceOrientation.alpha;
				this.betaOffsetAngle = -scope.deviceOrientation.beta;
				this.gammaOffsetAngle = -scope.deviceOrientation.gamma;
			}

			var alpha = scope.deviceOrientation.alpha ? THREE.MathUtils.degToRad( scope.deviceOrientation.alpha + this.alphaOffsetAngle ) : 0; // Z
			var beta = scope.deviceOrientation.beta ? THREE.MathUtils.degToRad( scope.deviceOrientation.beta + this.betaOffsetAngle ) : 0; // X'
			var gamma = scope.deviceOrientation.gamma ? THREE.MathUtils.degToRad( scope.deviceOrientation.gamma + this.gammaOffsetAngle ) : 0; // Y''
			var orient = scope.screenOrientation ? THREE.MathUtils.degToRad( scope.screenOrientation ) : 0; // O

			setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
			this.alpha = alpha;

			console.log(this.object.rotation)
		}
	};

	this.updateAlphaOffsetAngle = function( angle ) {

		this.alphaOffsetAngle = angle;
		this.update();

	};

	this.updateBetaOffsetAngle = function( angle ) {

		this.betaOffsetAngle = angle;
		this.update();

	};

	this.updateGammaOffsetAngle = function( angle ) {

		this.gammaOffsetAngle = angle;
		this.update();

	};

	this.dispose = function() {

		this.disconnect();

	};

	this.connect();

};