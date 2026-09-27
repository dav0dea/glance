/** Program construction. A compile error is a bug in this package, so it throws. */

export interface Program {
	prog: WebGLProgram;
	u: Record<string, WebGLUniformLocation>;
	/** The attribute state the program draws with; `null` is the default one, which has none. */
	vao: WebGLVertexArrayObject | null;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
	const sh = gl.createShader(type)!;
	gl.shaderSource(sh, src);
	gl.compileShader(sh);
	if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
		throw new Error(`plotluck shader: ${gl.getShaderInfoLog(sh)}`);
	}
	return sh;
}

export function program(gl: WebGL2RenderingContext, vs: string, fs: string): Program {
	const prog = gl.createProgram()!;
	gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, vs));
	gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, fs));
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		throw new Error(`plotluck program: ${gl.getProgramInfoLog(prog)}`);
	}
	const u: Record<string, WebGLUniformLocation> = {};
	const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
	for (let i = 0; i < n; i++) {
		const name = gl.getActiveUniform(prog, i)!.name.replace('[0]', '');
		u[name] = gl.getUniformLocation(prog, name)!;
	}
	return { prog, u, vao: null };
}

/** A segment buffer bound to the line program's four attribute slots, one point apart. */
export function bindSegments(gl: WebGL2RenderingContext, vbo: WebGLBuffer): void {
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	// Slot k reads point k of the window: the previous point, the two ends, the next point.
	for (let k = 0; k < 4; k++) {
		gl.enableVertexAttribArray(k);
		gl.vertexAttribPointer(k, 2, gl.FLOAT, false, 8, 8 * k);
		gl.vertexAttribDivisor(k, 1);
	}
}
