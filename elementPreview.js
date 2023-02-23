import { insertElement } from "./helpers/insertElement.js";
import { previewElement } from "./previewElement.js";
import { calculateNearestSibling } from "./nearestSibling.js";

function calculateElementPreview(mousePos, element, container) {
	var siblingInfo = calculateNearestSibling(mousePos, element, container);
	insertElement(
		previewElement,
		siblingInfo.nearestSibling,
		siblingInfo.beforeNearestSibling,
		container
	);
}

export { calculateElementPreview };
