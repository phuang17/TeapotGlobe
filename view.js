/**
 * view.js
 * 
 * @fileoverview Manages camera motion.
 * @author Po-Han Huang <phuang17@illinois.edu>
 */



/** Unit vectors along each axis */
var X_AXIS = vec3.fromValues(1.0,0.0,0.0);
var Y_AXIS = vec3.fromValues(0.0,1.0,0.0);
var Z_AXIS = vec3.fromValues(0.0,0.0,1.0);

/** Radius of camera trajectory */
var VIEW_RADIUS = 1.5;

/** Camera position */
var viewOrigin = vec3.fromValues(VIEW_RADIUS,0.0,0.0);
/** Camera rotation angle */
var viewAngle = 0;
/** Camera rotation speed */
var viewAngleStep = degToRad(0.2);

/** Up vector */
var viewUp = vec3.clone(Y_AXIS);
/** LookAt vector */
var viewLookAt = vec3.create();
/** LookAt center (always (0,0,0)) */
var viewCenter = vec3.create();

/** Viewing matrix */
var mvMatrix = mat4.create();
/** Perspective projection matrix */
var pMatrix = mat4.create();

/** Field of view */
var VIEWPORT = 50;

/** Initialization of view.js */
function viewInit(){
  /** Generate perpective projection matrix. */
  mat4.perspective(pMatrix, degToRad(VIEWPORT), gl.viewportWidth / gl.viewportHeight, 0.001, 7.0);
}

/** Update viewing vectors and matrices. */
function viewUpdateMatrix(){

  /** Rotate. */
  viewAngle += viewAngleStep;

  /** Update up and lookAt vector based on current angle. */
  viewOrigin = vec3.fromValues(VIEW_RADIUS * Math.cos(viewAngle), 0.0, VIEW_RADIUS * Math.sin(viewAngle));
  viewLookAt = vec3.fromValues(-Math.cos(viewAngle), 0.0, -Math.sin(viewAngle));

  /** Update viewing matrix */
  mat4.lookAt(mvMatrix, viewOrigin, viewCenter, viewUp);

}

