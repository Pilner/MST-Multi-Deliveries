mapboxgl.accessToken =
  "pk.eyJ1IjoicGlsbmVyIiwiYSI6ImNsanBxczIzcTAxazQzZm5xaHF3OHNrOTMifQ.k7dqkEdQZZ-l4gBWwZh46A";


const manila = new mapboxgl.LngLatBounds([120.7617187, 14.386892905], [121.053525416, 14.691678901])


function setupMap(center) {}
const map = new mapboxgl.Map({
  container: "inputMap", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: [120.98177916, 14.58678841], // starting position [lng, lat]
//   maxBounds: manila,
  zoom: 12, // starting zoom
  testMode: true,
});
  
let locations = [];
let whMarker, delMarker = [];
let markers = [];

let mode = "warehouse";
let index = 0;

let deliveries = document.getElementsByClassName("delivery").length;


map.on("click", (e) => {
	let input;
	let marker;
	
	if (mode == "warehouse") {
		input = document.getElementById("warehouse");
		marker = new mapboxgl.Marker({color: 'red', draggable: true});

		let warehouseCheck = locations.some((obj) => {
			return obj.mode === "warehouse";
		})

		if (!warehouseCheck) {
			let point = [e.lngLat.lng, e.lngLat.lat];
			locations.push({point: point, mode: mode});
			input.value = `${point[0]}, ${point[1]}`;
			marker.setLngLat(point).addTo(map);
			whMarker = marker;
		}

		((marker) => {
			marker.on("dragend", () => {
				point = [marker.getLngLat().lng, marker.getLngLat().lat];
				input.value = `${point[0]}, ${point[1]}`;
			});
		})(marker);
	

	} else {
		inputs = document.getElementsByClassName("delivery");
		marker = new mapboxgl.Marker({draggable: true});

		
		// for (let input of inputs) {
			
			let pointAlreadyExists = locations.some((obj) => {
				console.log(index)
				return obj.index === index;
			})
			
			
			if (!pointAlreadyExists) {
				let point = [e.lngLat.lng, e.lngLat.lat];
				let index = delMarker.push(marker) - 1;
				locations.push({point: point, mode: mode, index: index});
				// input.value = `${point[0]}, ${point[1]}`;
				marker.setLngLat(point).addTo(map);
				inputs[index].value = `${point[0]}, ${point[1]}`;
			}
		// }
		
		((marker) => {
			marker.on("dragend", () => {
				point = [marker.getLngLat().lng, marker.getLngLat().lat];

				let index = delMarker.indexOf(marker);
				console.log(index);
				inputs[index].value = `${point[0]}, ${point[1]}`;
			});
		})(marker);

	}

	markers = [whMarker, ...delMarker];

});


const selectors = document.querySelectorAll("svg");

selectors.forEach((selector) => {
	selector.addEventListener("click", () => {
		selector.setAttribute("data-selected", "true");
		mode = selector.getAttribute("data-mode");
		index = (selector.getAttribute("data-index") - 1) || 0;
		selectors.forEach((check) => {
			if (check !== selector) {
				check.setAttribute("data-selected", "false");
			}
		})
	});
});		


let required = [document.querySelector("#warehouse"), document.querySelectorAll(".delivery")[0]];

function checkRequired() {
	for (let input of required) {
		if (input.value === "") {
			return false;
		}
	}
	return true;
}

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementsByClassName('dlInput')[0];
	const addButton = document.getElementById('addButton');

	addButton.addEventListener('click', () => {
		const currentIndex = document.getElementsByClassName('delivery').length;
		// maximum of 10
		if (currentIndex >= 10) {
			return;
		}
		const newDiv1 = document.createElement('div');
		const newInput = document.createElement('input');
		const newDiv2 = document.createElement('div');
		
		newInput.setAttribute('type', 'text');
		newInput.setAttribute('name', 'delivery');
		newInput.setAttribute('placeholder', `Location #${currentIndex + 1} Address Coordinates`);
		newInput.setAttribute('class', 'delivery');
		newInput.setAttribute('data-index', currentIndex + 1);
		newInput.setAttribute('readonly', true);

		newDiv2.classList.add('marker');

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		svg.setAttribute('width', '46');
		svg.setAttribute('height', '46');
		svg.setAttribute('viewBox', '0 0 36 46');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('data-mode', 'delivery');
		svg.setAttribute('data-index', currentIndex + 1);
		svg.setAttribute('data-selected', 'false');

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', `
		M18 0C13.2278 0.0056522 8.65274 1.91142 5.27831 5.29924C1.90388 8.68707 0.00564901 13.2803 1.91502e-05 18.0714C-0.00569649 21.9867 1.26817 25.7958 3.6262 28.9143C3.6262 28.9143 4.11711 29.5632 4.19729 29.6569L18 46L31.8093 29.6486C31.8813 29.5616 32.3738 28.9143 32.3738 28.9143L32.3754 28.9094C34.7323 25.7922 36.0056 21.9849 36 18.0714C35.9944 13.2803 34.0961 8.68707 30.7217 5.29924C27.3473 1.91142 22.7722 0.0056522 18 0ZM18 24.6429C16.7054 24.6429 15.4399 24.2575 14.3635 23.5354C13.2872 22.8133 12.4482 21.787 11.9528 20.5862C11.4574 19.3854 11.3278 18.0641 11.5803 16.7894C11.8329 15.5147 12.4563 14.3438 13.3717 13.4247C14.2871 12.5057 15.4534 11.8798 16.723 11.6263C17.9927 11.3727 19.3088 11.5028 20.5048 12.0002C21.7009 12.4976 22.7231 13.3399 23.4423 14.4205C24.1616 15.5012 24.5454 16.7717 24.5454 18.0714C24.5433 19.8136 23.853 21.4838 22.6259 22.7157C21.3989 23.9476 19.7353 24.6407 18 24.6429Z
		`)
		path.setAttribute('fill', '#4FBEE1');

		svg.appendChild(path);
		newDiv2.appendChild(svg);
		newDiv1.appendChild(newInput);
		newDiv1.appendChild(newDiv2);
		container.appendChild(newDiv1);

		const selectors = document.querySelectorAll(".dlInput svg");
		console.log(selectors);

		// make newly created variables have the same functionality as the old ones
		selectors.forEach((selector) => {
			selector.addEventListener("click", () => {
				selector.setAttribute("data-selected", "true");
				mode = selector.getAttribute("data-mode");
				index = (selector.getAttribute("data-index") - 1) || 0;
				selectors.forEach((check) => {
					if (check !== selector) {
						check.setAttribute("data-selected", "false");
					}
				})
			});
		});
			
	});


});
  

document.getElementById("inputForm").addEventListener("submit", (event) => {
	if (!checkRequired()) {
		event.preventDefault();
		alert("Please have at least one warehouse and one delivery.");
	}
})

map.addControl(
	new MapboxGeocoder({
	accessToken: mapboxgl.accessToken,
	mapboxgl: mapboxgl
	})
);