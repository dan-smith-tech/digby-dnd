function calculateNearestSibling(
	mousePos,
	element,
	container,
	previewElementClassName
) {
	var siblings = [];
	container.childNodes.forEach((sibling) => {
		if (
			sibling.nodeType != 3 &&
			sibling != element &&
			!sibling.classList.contains(previewElementClassName)
		) {
			siblings.push(sibling);
		}
	});

	var nearestSibling = undefined;
	var beforeNearestSibling = false;
	var sortIndex = 0;
	if (siblings.length > 0) {
		var currentSiblingDistance = null;
		siblings.forEach((sibling, i) => {
			var siblingRect = sibling.getBoundingClientRect();

			var tempDistance = siblingRect.y + siblingRect.height / 2 - mousePos.y;
			if (
				Math.abs(tempDistance) < currentSiblingDistance ||
				currentSiblingDistance === null
			) {
				currentSiblingDistance = Math.abs(tempDistance);
				// if (tempDistance >= 0) beforeNearestSibling = true;
				if (siblingRect.y + siblingRect.height / 2 >= mousePos.y) {
					beforeNearestSibling = true;
					sortIndex = i;
				} else {
					beforeNearestSibling = false;
					sortIndex = i + 1;
				}

				nearestSibling = sibling;
			}
		});
	}

	return { nearestSibling, beforeNearestSibling, sortIndex };
}

export { calculateNearestSibling };
