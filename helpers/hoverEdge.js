const edgeBuffer = 10;

function hoverEdge(mousePos, elementRect) {
	return (
		mousePos.y > elementRect.y + elementRect.height - edgeBuffer &&
		mousePos.y <= elementRect.y + elementRect.height
	);
}

export { hoverEdge };
