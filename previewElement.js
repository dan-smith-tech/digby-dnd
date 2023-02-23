var previewElement = null;

function generatePreviewElement(element, className) {
	previewElement = element.cloneNode();
	previewElement.innerHTML = element.innerHTML;
	previewElement.classList.add(className);
	previewElement.id = "";
}

export { previewElement, generatePreviewElement };
