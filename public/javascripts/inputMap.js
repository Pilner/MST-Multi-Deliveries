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
				return obj.index === index;
			})
			
			
			
			if (!pointAlreadyExists) {
				let point = [e.lngLat.lng, e.lngLat.lat];
				let index = delMarker.push(marker) - 1;
				locations.push({point: point, mode: mode, index: index});
				// input.value = `${point[0]}, ${point[1]}`;
				marker.setLngLat(point).addTo(map);
				console.log(index);
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
console.log(required);

function checkRequired() {
	for (let input of required) {
		if (input.value === "") {
			return false;
		}
	}
	return true;
}

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