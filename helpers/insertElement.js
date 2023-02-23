function insertElement(
	element,
	nearestSibling,
	beforeNearestSibling,
	container
) {
	if (nearestSibling) {
		if (beforeNearestSibling) nearestSibling.before(element);
		else nearestSibling.after(element);
	} else {
		container.appendChild(element);
	}
}

export { insertElement };
