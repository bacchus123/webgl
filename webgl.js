GL_FLOAT_SIZE = 4;
GL_SHORT_SIZE = 2;

function initGL(canvasId){
	var canvas = document.getElementById(canvasId);
	try{
		var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		gl.aspect = canvas.width/canvas.height;
		gl.viewWidth = canvas.width;
		gl.viewHeight = canvas.height;
		return gl;
	}catch(ex){
		alert("Unable to create WebGl Context");
	}

    return gl;
}
function initBuffer(gl, data, bufferType, vertSize, colorSize){
	var	buff = gl.createBuffer();
	gl.bindBuffer(bufferType, buff);
	
	if(bufferType == gl.ELEMENT_ARRAY_BUFFER){
		gl.bufferData(bufferType, new Uint16Array(data), gl.STATIC_DRAW );
	}else if(bufferType == gl.ARRAY_BUFFER){
		gl.bufferData(bufferType, new Float32Array(data), gl.STATIC_DRAW);
	}else{
		return null;
	}
	var elementSize = colorSize + vertSize;

	if(data.length % elementSize != 0){
		alert("Invalid number of elements in buffer");
		return null;
	}
	buff.vertSize = vertSize;
	buff.colorSize = colorSize;
	buff.elmSize = elementSize;
	buff.numItems = data.length/buff.elmSize;
	
	return buff;
}
function getShader (gl,shaderName) {
	var shaderNode = document.getElementById(shaderName);
	if(!shaderNode){
		return null;
	}
	var shaderText = shaderNode.textContent;
	if(!shaderText){
		return null;
	}
	var shader;
	if(shaderNode.type == "x-shader/x-fragment"){
		shader = gl.createShader(gl.FRAGMENT_SHADER)
	}else if(shaderNode.type == "x-shader/x-vertex"){
		shader = gl.createShader(gl.VERTEX_SHADER)
	}else{
		return null;
	}
	gl.shaderSource(shader, shaderText);
	gl.compileShader(shader);
	if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
			alert(gl.getShaderInfoLog(shader));
			return null;
	}
	gl.shaderSource(shader, shaderText);
	gl.compileShader(shader);
	return shader;
}
function getProgram (gl,fragName, vertName, uniformNames, variableNames) {
	var vertShader = getShader(gl, vertName);
	var fragShader = getShader(gl, fragName);

	var program = gl.createProgram();

	gl.attachShader(program, vertShader);
	gl.attachShader(program, fragShader);

	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
            return null;
    }
    gl.useProgram(program);

	for(var i = 0; i < uniformNames.length; i++){
		program[uniformNames[i]] = gl.getUniformLocation(program, uniformNames[i]);
	}
	for(var i = 0; i < variableNames.length; i++){
		program[variableNames[i]] = gl.getAttribLocation(program, variableNames[i]);
	}

	return program;
}

function main(){
	var gl = initGL('webglCanvas');
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
	var model = {
		verts : 
			 // Front face
      [
      -1.0, -1.0,  1.0, 1.0, 0.0, 0.0, 1.0,
       1.0, -1.0,  1.0, 1.0, 0.0, 0.0, 1.0,
       1.0,  1.0,  1.0, 1.0, 0.0, 0.0, 1.0,
      -1.0,  1.0,  1.0, 1.0, 0.0, 0.0, 1.0,

      // Back face
      -1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 1.0,
      -1.0,  1.0, -1.0, 1.0, 1.0, 0.0, 1.0,
       1.0,  1.0, -1.0, 1.0, 1.0, 0.0, 1.0,
       1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 1.0,

      // Top face
      -1.0,  1.0, -1.0, 0.0, 1.0, 0.0, 1.0,
      -1.0,  1.0,  1.0, 0.0, 1.0, 0.0, 1.0,
       1.0,  1.0,  1.0, 0.0, 1.0, 0.0, 1.0,
       1.0,  1.0, -1.0, 0.0, 1.0, 0.0, 1.0,

      // Bottom face
      -1.0, -1.0, -1.0, 1.0, 0.5, 0.5, 1.0,
       1.0, -1.0, -1.0, 1.0, 0.5, 0.5, 1.0,
       1.0, -1.0,  1.0, 1.0, 0.5, 0.5, 1.0,
      -1.0, -1.0,  1.0, 1.0, 0.5, 0.5, 1.0,

      // Right face
       1.0, -1.0, -1.0, 1.0, 0.0, 1.0, 1.0,
       1.0,  1.0, -1.0, 1.0, 0.0, 1.0, 1.0,
       1.0,  1.0,  1.0, 1.0, 0.0, 1.0, 1.0,
       1.0, -1.0,  1.0, 1.0, 0.0, 1.0, 1.0,

      // Left face
      -1.0, -1.0, -1.0, 0.0, 0.0, 1.0, 1.0,
      -1.0, -1.0,  1.0, 0.0, 0.0, 1.0, 1.0,
      -1.0,  1.0,  1.0, 0.0, 0.0, 1.0, 1.0,
      -1.0,  1.0, -1.0, 0.0, 0.0, 1.0, 1.0],
		

		indicies : [
	  0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23]  // Left face]
	};
	var vertBuff = initBuffer(gl, model.verts, gl.ARRAY_BUFFER , 3, 4);
	var indexBuffer = initBuffer(gl, model.indicies, gl.ELEMENT_ARRAY_BUFFER , 1, 0);

	var program = getProgram(gl, 'shader-fs', 'shader-vs', ['pMatrix', 'mvMatrix'], ['VertexPosition', 'VertexColor']);
	var model = mat4.create();
    mat4.translate(model, model, [0, 0.0, -3.0]);
    var perspective = mat4.perspective(mat4.create(), 90, gl.viewWidth/gl.viewHeight, 0.01, 1000);
    frame(draw, gl, model, perspective, program, indexBuffer, vertBuff);
}

function frame (draw, gl, model, perspective, program, indexBuffer, vertBuff) {
	model = animate(model);
	draw(gl, model, perspective, program, indexBuffer, vertBuff);
	requestAnimationFrame(function(){frame (draw, gl, model, perspective, program, indexBuffer, vertBuff);});
}
var lastTime = new Date().getTime(); 
function animate(model){
	var time  = new Date().getTime();
	var delta = time - lastTime;
	lastTime = time;
	return mat4.rotate(model, model, (3.14159)*(delta/1000), [0.33, 1.0, -0.48]);

}

	

function draw(gl, mvMatrix,pMatrix, program, indexBuffer, vertexBuffer){
	gl.viewport(0, 0, gl.viewWidth, gl.viewHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(program);

	gl.uniformMatrix4fv(program['pMatrix'], false,  pMatrix);
	gl.uniformMatrix4fv(program['mvMatrix'], false, mvMatrix);
  
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.enableVertexAttribArray(program['VertexPosition']);
	gl.vertexAttribPointer(program['VertexPosition'], vertexBuffer.vertSize, gl.FLOAT, false, vertexBuffer.elmSize * GL_FLOAT_SIZE, 0);
	
	gl.enableVertexAttribArray(program['VertexColor']);
	gl.vertexAttribPointer(program['VertexColor'], vertexBuffer.colorSize, gl.FLOAT, false, vertexBuffer.elmSize * GL_FLOAT_SIZE, vertexBuffer.vertSize * GL_FLOAT_SIZE);


	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.drawElements(gl.TRIANGLES, indexBuffer.numItems,gl.UNSIGNED_SHORT, 0);
}