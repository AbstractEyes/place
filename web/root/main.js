function main() {
	let cvs = document.querySelector("#viewport-canvas");
	let glWindow = new GLWindow(cvs);

	if (!glWindow.ok()) return;

	let place = new Place(glWindow);
	place.initConnection();

	let gui = GUI(cvs, glWindow, place);
}

const GUI = (cvs, glWindow, place) => {
	let color = new Uint8Array([0,0,0]);
	let dragdown = false;
	let lastMovePos = {x:0,y:0};
	let touchstartTime;

	const colorField = document.querySelector("#color-field");
	const colorSwatch = document.querySelector("#color-swatch");
	const colorPalette = document.querySelector("#color-palette");

	// ***************************************************
	// ***************************************************
	// Event Listeners
	//
	document.addEventListener("keydown", ev => {
		switch (ev.keyCode) {
		case 189:
		case 173:
			ev.preventDefault();
			zoomOut();
			break;
		case 187:
		case 61:
			ev.preventDefault();
			zoomIn();
			break;
		}
	});

	window.addEventListener("wheel", ev => {
		let zoom = glWindow.getZoom();
		if (ev.deltaY > 0) {
				zoom /= 1.05;
			} else {
				zoom *= 1.05;
			}
		glWindow.setZoom(zoom);
		glWindow.draw();
	});

	document.querySelector("#zoom-in").addEventListener("click", () => {
		zoomIn();
	});

	document.querySelector("#zoom-out").addEventListener("click", () => {
		zoomOut();
	});

	window.addEventListener("resize", ev => {
		glWindow.updateViewScale();
		glWindow.draw();
	});

	cvs.addEventListener("mousedown", (ev) => {
		switch (ev.button) {
		case 0:
			dragdown = true;
			lastMovePos = {x:ev.clientX, y:ev.clientY};
			break;
		case 1:
			pickColor({x:ev.clientX,y:ev.clientY});
			break;
		case 2:
			if (ev.ctrlKey) {
				pickColor({x:ev.clientX,y:ev.clientY});
			} else {
				drawPixel({x:ev.clientX,y:ev.clientY}, color);
			}
		}
	});

	document.addEventListener("mouseup", (ev) => {
		dragdown = false;
		document.body.style.cursor = "auto";
	});

	document.addEventListener("mousemove", (ev) => {
		const movePos = {x:ev.clientX, y:ev.clientY};
		if (dragdown) {
			glWindow.move(movePos.x - lastMovePos.x, movePos.y - lastMovePos.y);
			glWindow.draw();
			document.body.style.cursor = "grab";
		}
		lastMovePos = movePos;
	});

	cvs.addEventListener("touchstart", (ev) => {
		touchstartTime = (new Date()).getTime();
		lastMovePos = {x:ev.touches[0].clientX, y:ev.touches[0].clientY};
	});

	document.addEventListener("touchend", (ev) => {
		let elapsed = (new Date()).getTime() - touchstartTime;
		if (elapsed < 100) {
			drawPixel(lastMovePos, color);
		}
	});

	document.addEventListener("touchmove", (ev) => {
		let movePos = {x:ev.touches[0].clientX, y:ev.touches[0].clientY};
		glWindow.move(movePos.x - lastMovePos.x, movePos.y - lastMovePos.y);
		glWindow.draw();
		lastMovePos = movePos;
	});

	cvs.addEventListener("contextmenu", () => {return false;});

	colorField.addEventListener("change", ev => {
		let hex = colorField.value.replace(/[^A-Fa-f0-9]/g, "").toUpperCase();
		hex = hex.substring(0,6);
		while (hex.length < 6) {
			hex += "0";
		}
		color[0] = parseInt(hex.substring(0,2), 16);
		color[1] = parseInt(hex.substring(2,4), 16);
		color[2] = parseInt(hex.substring(4,6), 16);
		hex = "#" + hex;
		colorField.value = hex;
		colorSwatch.style.backgroundColor = hex;
	});

	

	// ***************************************************
	// ***************************************************
	// Helper Functions
	//
	const pickColor = (pos) => {
		color = glWindow.getColor(glWindow.click(pos));
		let hex = "#";
		for (let i = 0; i < color.length; i++) {
			let d = color[i].toString(16);
			if (d.length == 1) d = "0" + d;
			hex += d;
		}
		colorField.value = hex.toUpperCase();
		colorSwatch.style.backgroundColor = hex;
	}

	const drawPixel = (pos, color) => {
		pos = glWindow.click(pos);
		if (pos) {
			const oldColor = glWindow.getColor(pos);
			for (let i = 0; i < oldColor.length; i++) {
				if (oldColor[i] != color[i]) {
					place.setPixel(pos.x, pos.y, color);
					break;
				}
			}
		}
	}
	
	const zoomIn = () => {
		let zoom = glWindow.getZoom();
		glWindow.setZoom(zoom * 1.2);
		glWindow.draw();
	}
	
	const zoomOut = () => {
		let zoom = glWindow.getZoom();
		glWindow.setZoom(zoom / 1.2);
		glWindow.draw();
	}
}