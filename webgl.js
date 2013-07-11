var PyramidVerts = [0.0, .25, 0.0,
				-.25, -.25, .25,
				.25, -.25, .25,
				-.25, -.25, -.25];
var PyramidColors = [0.5, 0.5, 0.5,	1.0,
					 1.0, 0.5, 0.5, 1.0,
					 0.5, 0.5, 1.0,	1.0,
					 0.5, 1.0, 0.5, 1.0];
var PyramidIndices =    [0,1,2/*,
						0,2,1,
						0,1,3,
						0,3,1*/];
var GL_FLOAT_SIZE = 4;
var model = {

	initBuffers : function(gl, vertex, color, indices){
		this.vertexBuffer = this.bindArrayBuffer(gl, vertex, 3, 4);
		this.colorBuffer = this.bindArrayBuffer(gl, color, 4, 4);
		this.indexBuffer = this.bindIndexBuffer(gl, indices, 3);
	},
	bindArrayBuffer : function(gl, data, itemSize, numItems) {
		var arrayBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer); //set arrayBuffer to be the current ARRAY_BUFFER so we can operate on it 
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		arrayBuffer.size = itemSize;
		arrayBuffer.numVerts = numItems;
		return arrayBuffer;
	},
	bindIndexBuffer : function(gl, data, numItems){
		var indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
		indexBuffer.numItems  = numItems;
		return indexBuffer;
	},
	createProgram : function(gl, vertName, fragName){
		vertShader = this.getShader(gl, vertName);
		fragShader = this.getShader(gl, fragName);

		this.shaderProgram = gl.createProgram();
		gl.attachShader(this.shaderProgram, vertShader);
		gl.attachShader(this.shaderProgram, fragShader);
		gl.linkProgram(this.shaderProgram);
		if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
        
		gl.useProgram(this.shaderProgram);

	},

	draw : function(gl, view, projection){
       //Should save the currently bound arrays/etc as to not mess up, but this is the only thing we are drawing so it's cool
       	var location = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
		gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "uPMatrix"),false, projection);
		gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "uMMatrix"), false, this.model);
		gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "uVMatrix"),false, view);

		var colorAttribLocation = gl.getAttribLocation(this.shaderProgram, "VertexColor");
		var vertexAttribLocation = gl.getAttribLocation(this.shaderProgram, "VertexPosition");


		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.enableVertexAttribArray(vertexAttribLocation);
		gl.vertexAttribPointer(vertexAttribLocation, 3, gl.FLOAT, false, 12, 0);

		//gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		//gl.enableVertexAttribArray(colorAttribLocation);
		//gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 16, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	},
	animate :function(){},
	getShader : function(gl, shaderName){
		var shaderNode = document.getElementById(shaderName);
		if(!shaderNode){
			alert("1");
			return null;
		}
		var shaderString = shaderNode.textContent;
		var shader;
		if(shaderNode.type == "x-shader/x-fragment"){
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		}else if(shaderNode.type == "x-shader/x-vertex"){
			shader = gl.createShader(gl.VERTEX_SHADER);
		}else{
			alert("2");
			return null;
		}
		gl.shaderSource(shader, shaderString);
		gl.compileShader(shader);
		
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
}

function WebGL () {
	var gl = initGl("webglCanvas");
	model.initBuffers(gl, PyramidVerts, PyramidIndices, PyramidColors);
	model.createProgram(gl,"shader-vs","shader-fs");
	model.model = mat4.create();
	var view = mat4.create();
	mat4.lookAt(view, [4, 3, 2], [0,0,0], [0,1,0]);
	var perspective = mat4.create();
	mat4.perspective(perspective, 3.14159/2,  gl.height/gl.width, .01, 100);
	gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	drawLoop(gl, model, view, perspective);
}

function initGl (canvasId) {
	var canvas = document.getElementById(canvasId);
	try{
		var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		gl.height = canvas.height;
		gl.width = canvas.width;
	}catch(ex){
		alert("Unable to creat GL context");
	}
	return gl;
}

function drawLoop(gl, thingToDraw, view, perspective){
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	webkitRequestAnimationFrame(function(){drawLoop(gl, thingToDraw,view, perspective );});
	thingToDraw.draw(gl, view, perspective)
	thingToDraw.animate();
}