function highlightElement(element, className, isHighlighted) {
	if (isHighlighted) element.classList.add(className);
	else element.classList.remove(className);
}

export { highlightElement };
