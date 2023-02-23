import { insertElement } from "./helpers/insertElement.js";
import { previewElement, generatePreviewElement } from "./previewElement.js";
import { calculateElementPreview } from "./elementPreview.js";
import { calculateNearestSibling } from "./nearestSibling.js";
import { calculateNearestContainer } from "./nearestContainer.js";
import { highlightElement } from "./helpers/highlightElement.js";
import {
	checkContainerScroll,
	stopScrollThroughContainer,
} from "./scrollContainer.js";

import { hoverEdge } from "./helpers/hoverEdge";

class DragElement {
	static classes = undefined;
	static appendChildren = false;
	static dragContainer = undefined;

	static initDnD(classes, appendChildren) {
		DragElement.classes = classes;
		DragElement.appendChildren = appendChildren;

		// Generate drag area
		DragElement.dragContainer = document.createElement("DIV");
		DragElement.dragContainer.style.position = "fixed";
		DragElement.dragContainer.style.inset = "0";
		DragElement.dragContainer.style.pointerEvents = "none";
		DragElement.dragContainer.style.zIndex = "99999";
		document.querySelector("body").appendChild(DragElement.dragContainer);

		document.onmousemove = (e) => {
			if (DragElement.currentDragElement) {
				DragElement.currentDragElement.moveElement(e);
			} else if (DragElement.currentResizeElement) {
				DragElement.currentResizeElement.resizeElement(e);
				document.body.classList.add("resize-vertical");
			}
		};

		document.onmouseup = (e) => {
			if (e.button === 0 && DragElement.currentDragElement) {
				DragElement.currentDragElement.dropElement(e);
			} else if (e.button === 0 && DragElement.currentResizeElement) {
				DragElement.currentResizeElement.endResizeElement();
				DragElement.currentResizeElement = undefined;
				document.body.classList.remove("resize-vertical");
			}
		};
	}

	static initDragContainer(contentContainer, masterContainer) {
		DragElement.containers.push(contentContainer);
		DragElement.masterContainers.push(masterContainer);
	}

	static currentDragElement = undefined;
	originalDragContainer = undefined;
	static currentDragContainer = undefined;

	currentDOMElement = undefined;

	appendChildren = true;

	beginningHeight = 0;

	widthOffset;
	heightOffset;

	static containers = [];
	static masterContainers = [];
	classes = undefined;

	resizing = false;
	currentResizeElement = undefined;
	beginningHeight = 0;

	constructor(elementRef, newElement, verticalOnly, resize, height, events) {
		this.elementRef = elementRef;
		this.newElement = newElement;
		this.verticalOnly = verticalOnly;
		this.resize = resize;
		this.events = events;

		if (this.resize) {
			this.beginningHeight = elementRef.getBoundingClientRect().height;
			this.elementRef.style.height = height + "px";
		}

		this.elementRef.onmousedown = (e) => {
			if (e.button === 0) {
				this.elementRef.onmousemove = () => {
					this.elementRef.onmousemove = {};

					this.currentDOMElement = this.newElement
						? this.newElement
						: this.elementRef;

					if (this.resizing) {
						DragElement.currentResizeElement = this;
						return;
					}

					const mousePos = { x: e.clientX, y: e.clientY };
					const elementRect = this.elementRef.getBoundingClientRect();

					DragElement.currentDragElement = this;
					this.originalDragContainer = this.currentDOMElement.parentNode;
					if (verticalOnly)
						DragElement.currentDragContainer = this.originalDragContainer;

					generatePreviewElement(
						this.currentDOMElement,
						DragElement.classes.previewElement
					);

					this.currentDOMElement.classList.add(
						DragElement.classes.elementHighlight
					);

					if (this.events && this.events.onDragStart)
						this.events.onDragStart({
							element: this.currentDOMElement,
							container: DragElement.currentDragContainer,
							masterContainer:
								DragElement.masterContainers[
									DragElement.containers.indexOf(
										DragElement.currentDragContainer
									)
								],
						});

					const elementWidthOffset = this.calculateElementWidthOffset();

					this.widthOffset =
						mousePos.x - elementRect.x + elementWidthOffset;
					this.heightOffset =
						mousePos.y -
						elementRect.y +
						this.calculateElementHeightOffset();

					if (this.verticalOnly) {
						this.currentDOMElement.style.left =
							elementRect.x - elementWidthOffset + "px";
					}

					var containerWidth = calculateNearestContainer(
						mousePos,
						DragElement.containers,
						DragElement.masterContainers,
						DragElement.classes.containerHighlight
					).clientWidth;
					this.currentDOMElement.style.width = containerWidth + "px";

					DragElement.dragContainer.appendChild(this.currentDOMElement);
					document.body.classList.add("grab");
				};
			}
		};

		this.elementRef.onmouseup = (e) => {
			elementRef.onmousemove = {};
		};

		// adds this event listener whenever mouse down
		this.elementRef.addEventListener("mousemove", (e) => {
			const mousePos = { x: e.clientX, y: e.clientY };
			const elementRect = this.elementRef.getBoundingClientRect();

			if (hoverEdge(mousePos, elementRect)) {
				this.resizing = true;
				this.elementRef.classList.add(DragElement.classes.elementResize);
				document.body.classList.add("resize-vertical");
			} else {
				this.resizing = false;
				this.elementRef.classList.remove(DragElement.classes.elementResize);
				document.body.classList.remove("resize-vertical");
			}
		});

		this.elementRef.addEventListener("mouseleave", (e) => {
			if (!DragElement.currentResizeElement)
				document.body.classList.remove("resize-vertical");
		});
	}

	resizeElement(e) {
		const mousePos = { x: e.clientX, y: e.clientY };

		const elementRect = this.currentDOMElement.getBoundingClientRect();

		const maxChange = 135;

		var extraHeight = Math.min(
			Math.max(
				mousePos.y - (elementRect.y + this.beginningHeight),
				-maxChange
			),
			maxChange
		);

		this.height = Math.max(
			this.beginningHeight + extraHeight,
			this.beginningHeight
		);

		this.currentDOMElement.style.height = this.height + "px";
	}

	endResizeElement(e) {
		if (this.events && this.events.onResizeEnd)
			this.events.onResizeEnd({
				element: this.currentDOMElement,
				container: DragElement.currentDragContainer,
				masterContainer:
					DragElement.masterContainers[
						DragElement.containers.indexOf(
							DragElement.currentDragContainer
						)
					],
				height: this.height,
			});
	}

	// Account for more event listeners
	delete() {
		this.elementRef.onmousedown = {};
	}

	moveElement(e) {
		const mousePos = { x: e.clientX, y: e.clientY };

		if (this.events && this.events.onDrag)
			this.events.onDrag({
				element: this.currentDOMElement,
				container: DragElement.currentDragContainer,
				masterContainer:
					DragElement.masterContainers[
						DragElement.containers.indexOf(
							DragElement.currentDragContainer
						)
					],
			});

		// setElementToMousePosition(mousePos);
		this.setToMousePosition(mousePos);
		if (!this.verticalOnly)
			DragElement.currentDragContainer = calculateNearestContainer(
				mousePos,
				DragElement.containers,
				DragElement.masterContainers,
				DragElement.classes.containerHighlight
			);
		calculateElementPreview(
			mousePos,
			this.currentDOMElement,
			DragElement.currentDragContainer
		);

		checkContainerScroll(
			mousePos,
			this.currentDOMElement,
			DragElement.currentDragContainer
		);
	}

	dropElement(e) {
		const mousePos = { x: e.clientX, y: e.clientY };

		if (this.events && this.events.onDragEnd)
			this.events.onDragEnd({
				element: this.currentDOMElement,
				container: DragElement.currentDragContainer,
				masterContainer:
					DragElement.masterContainers[
						DragElement.containers.indexOf(
							DragElement.currentDragContainer
						)
					],
				sortIndex: calculateNearestSibling(
					mousePos,
					this.currentDOMElement,
					DragElement.currentDragContainer,
					DragElement.classes.previewElement
				).sortIndex,
			});

		this.currentDOMElement.classList.remove(
			DragElement.classes.elementHighlight
		);
		this.currentDOMElement.style.width = "auto";
		this.currentDOMElement.style.left = "auto";
		this.currentDOMElement.style.top = "auto";

		if (DragElement.appendChildren) {
			var siblingInfo = calculateNearestSibling(
				mousePos,
				this.currentDOMElement,
				DragElement.currentDragContainer,
				DragElement.classes.previewElement
			);
			insertElement(
				this.currentDOMElement,
				siblingInfo.nearestSibling,
				siblingInfo.beforeNearestSibling,
				DragElement.currentDragContainer
			);
		}

		if (this.newElement || !DragElement.appendChildren) {
			this.originalDragContainer.appendChild(this.currentDOMElement);
		}

		DragElement.masterContainers.forEach((masterContainer, i) => {
			highlightElement(
				masterContainer,
				DragElement.classes.containerHighlight,
				false
			);
		});

		stopScrollThroughContainer();

		previewElement.remove();
		DragElement.currentDragElement = undefined;
		DragElement.currentDragContainer = undefined;

		document.body.classList.remove("grab");
	}

	setToMousePosition(mousePos) {
		if (!this.verticalOnly) {
			this.currentDOMElement.style.left =
				mousePos.x - this.widthOffset + "px";
			this.currentDOMElement.style.top =
				mousePos.y - this.heightOffset + "px";
		} else {
			this.currentDOMElement.style.top =
				mousePos.y - this.heightOffset + "px";
		}
	}

	calculateElementWidthOffset() {
		return parseFloat(
			window
				.getComputedStyle(this.currentDOMElement)
				.getPropertyValue("margin-top")
		);
	}

	calculateElementHeightOffset() {
		return parseFloat(
			window
				.getComputedStyle(this.currentDOMElement)
				.getPropertyValue("margin-left")
		);
	}
}

export { DragElement };
