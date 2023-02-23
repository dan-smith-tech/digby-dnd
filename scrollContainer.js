import { calculateElementPreview } from "./elementPreview.js";

var scrollingThroughContainerRepeater;
var scrollingThroughContainer = false;

function checkContainerScroll(mousePos, element, container) {
	var currentContainerRect = container.getBoundingClientRect();
	// Stop invoking scroll function when container is fully scrolled
	if (
		mousePos.y - currentContainerRect.y <= 35 &&
		scrollingThroughContainer == false
	) {
		scrollThroughContainer(mousePos, element, container, -6.5);
	} else if (
		mousePos.y - currentContainerRect.y - currentContainerRect.height >=
			-35 &&
		scrollingThroughContainer == false
	) {
		scrollThroughContainer(mousePos, element, container, 6.5);
	} else if (
		mousePos.y - currentContainerRect.y > 35 &&
		mousePos.y - currentContainerRect.y - currentContainerRect.height < -35
	) {
		stopScrollThroughContainer();
	}
}

function scrollThroughContainer(mousePos, element, container, scrollVelocity) {
	scrollingThroughContainer = true;
	scrollingThroughContainerRepeater = setInterval(() => {
		calculateElementPreview(mousePos, element, container);
		container.scrollBy(0, scrollVelocity);
	}, 15);
}

function stopScrollThroughContainer() {
	scrollingThroughContainer = false;
	clearInterval(scrollingThroughContainerRepeater);
}

export { checkContainerScroll, stopScrollThroughContainer };
