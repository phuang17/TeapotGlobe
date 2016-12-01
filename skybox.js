/**
 * skybox.js
 * 
 * @fileoverview Manages buffers, arrays, and other data related to skybox.
 * @author Po-Han Huang <phuang17@illinois.edu>
 */

/** Identification prefix for skybox shader. */
var SKYBOX_PREFIX = "skybox";

/** Size of skybox */
var SKYBOX_SIZE = 3.0;

/** GL buffers for skybox. */
var skyboxPositionBuffer;
var skyboxIndexBuffer;

/** Data array for skybox. */
var skyboxPositionArray = [];
var skyboxIndexArray = [];

/** Shader program for skybox. */
var skyboxShaderProgram;
/** Variable locations in shader program. */
var skyboxLocations = {};
/** Environment texture for skybox. */
var skyboxTexture;

/** Initialization of skybox.js */
function skyboxInit(){

  /** Register shaders, draw calls, animate calls. */
  shaderPrefix.push(SKYBOX_PREFIX);
  shaderInit[SKYBOX_PREFIX] = skyboxShaderInit;
  bufferInit[SKYBOX_PREFIX] = skyboxBufferInit;
  drawFunctions[SKYBOX_PREFIX] = skyboxDraw;
  animateFunctions[SKYBOX_PREFIX] = skyboxAnimate;

  /** Initialize skybox and cube map. */
  skyboxGenerateShape();
  setupCubeMap();
}

/** Initialize skybox's shader programs and variable locations. */
function skyboxShaderInit(){
  skyboxShaderProgram = shaderPrograms[SKYBOX_PREFIX];

  /** Attributes */
  skyboxLocations["aVertexPosition"] = gl.getAttribLocation(skyboxShaderProgram, "aVertexPosition");

  /** Uniforms */
  skyboxLocations["uPMatrix"] = gl.getUniformLocation(skyboxShaderProgram, "uPMatrix");
  skyboxLocations["uMVMatrix"] = gl.getUniformLocation(skyboxShaderProgram, "uMVMatrix");
  skyboxLocations["uEnv"] = gl.getUniformLocation(skyboxShaderProgram, "uEnv");
  
}

/** Initialize skybox's buffer. */
function skyboxBufferInit(){

  /** Create buffers. */
  skyboxPositionBuffer = gl.createBuffer();
  skyboxIndexBuffer = gl.createBuffer();

  /** Bind buffers. */
  skyboxPositionBuffer.itemSize = 3;
  skyboxPositionBuffer.numOfItems = skyboxPositionArray.length / skyboxPositionBuffer.itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, skyboxPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skyboxPositionArray), gl.STATIC_DRAW);
  
  skyboxIndexBuffer.itemSize = 1;
  skyboxIndexBuffer.numOfItems = skyboxIndexArray.length / skyboxIndexBuffer.itemSize;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(skyboxIndexArray), gl.STATIC_DRAW);
  
}

/** Airplane draw call */
function skyboxDraw(){

  /** Setup variables. */
  gl.useProgram(skyboxShaderProgram);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, skyboxPositionBuffer);
  gl.enableVertexAttribArray(skyboxLocations["aVertexPosition"]);
  gl.vertexAttribPointer(skyboxLocations["aVertexPosition"], skyboxPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxIndexBuffer);

  gl.uniformMatrix4fv(skyboxLocations["uPMatrix"], false, pMatrix);
  gl.uniformMatrix4fv(skyboxLocations["uMVMatrix"], false, mvMatrix);
  gl.uniform1i(skyboxLocations["uEnv"], 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

  /** Draw! */
  gl.drawElements(gl.TRIANGLES, skyboxIndexBuffer.numOfItems, gl.UNSIGNED_SHORT, 0);

  /** Destructor */
  gl.disableVertexAttribArray(skyboxLocations["aVertexPosition"]);
  
}

/**
 * Airplane animate call
 *
 * @param {float} lapse timelapse since last frame in sec
 */
function skyboxAnimate(){

}

/** Generate skybox model. */
function skyboxGenerateShape(){

  /** Boundaries of skybox. */
  var sizes = [-SKYBOX_SIZE, SKYBOX_SIZE];

  /** Generate six faces. */
  for(var z in sizes){
    for(var y in sizes){
      for(var x in sizes){
        skyboxPositionArray.push(sizes[x]);
        skyboxPositionArray.push(sizes[y]);
        skyboxPositionArray.push(sizes[z]);
      }
    }
  }

  /** Generate indices. */
  skyboxIndexArray = [
    0,1,2, 2,1,3,
    4,5,6, 6,5,7,
    0,4,1, 4,5,1,
    2,6,3, 6,7,3,
    0,2,4, 2,6,4,
    1,3,5, 3,7,5
  ];

}

/** Setup cube map. */
function setupCubeMap() {

  /** Set up texture. */
  skyboxTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  /** Setup sixe faces. */
  loadCubeMapFace(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_X, skyboxTexture, posx);
  loadCubeMapFace(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, skyboxTexture, negx);
  loadCubeMapFace(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, skyboxTexture, posy);
  loadCubeMapFace(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, skyboxTexture, negy);
  loadCubeMapFace(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, skyboxTexture, posz);
  loadCubeMapFace(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, skyboxTexture, negz, function(){
    /** Generate mipmap after all faces are loaded. */
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  });
}

/**
 * Load one face of cube map.
 *
 * @param {gl} gl instance
 * @param {target} target face to load
 * @param {texture} texture instance
 * @param {url} url of image
 * @param {callback} callback funcion
 */
function loadCubeMapFace(gl, target, texture, url, callback){
  var img = new Image();
  img.src = url;
  img.onload = function (){
    gl.activeTexture(gl.TEXTURE0);
    gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    if(callback){
      callback();
    }
  }
}