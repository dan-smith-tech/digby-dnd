import { highlightElement } from "./helpers/highlightElement.js";

function calculateNearestContainer(
	mousePos,
	containers,
	masterContainers,
	className
) {
	var smallestContainerIndex = 0;
	var val = null;
	for (var i = 0; i < containers.length; i++) {
		var rect = masterContainers[i].getBoundingClientRect();

		var xOffset = Math.abs(mousePos.x - rect.x - rect.width / 2);
		var yOffset = Math.abs(mousePos.y - rect.y - rect.height / 2);

		var distance = Math.sqrt(Math.pow(xOffset, 2) + Math.pow(yOffset, 2));

		if (distance < val || val === null) {
			smallestContainerIndex = i;
			val = distance;
		}
	}

	for (var i = 0; i < containers.length; i++) {
		if (i == smallestContainerIndex)
			highlightElement(masterContainers[i], className, true);
		else highlightElement(masterContainers[i], className, false);
	}

	return containers[smallestContainerIndex];
}

export { calculateNearestContainer };
