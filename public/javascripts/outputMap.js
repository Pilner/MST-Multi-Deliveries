mapboxgl.accessToken =
  "pk.eyJ1IjoicGlsbmVyIiwiYSI6ImNsanBxczIzcTAxazQzZm5xaHF3OHNrOTMifQ.k7dqkEdQZZ-l4gBWwZh46A";

// navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {enableHighAccuracy: true});

// function successLocation(position) {
//   console.log(position)
//   setupMap([position.coords.longitude, position.coords.latitude]);
// }
let locations = [];
let markers = [];
let longestTime = 0;

const urlParams = new URLSearchParams(window.location.search);
const dataParam = urlParams.get('data');

const data = JSON.parse(decodeURIComponent(removeEmpty(dataParam) || '{}'));

locations = convertUrl(data);

function removeEmpty(string) {
  return string.replace(/,""/g, '');
}

function convertUrl(data) {
  data.warehouse = data.warehouse.split(', ');
  data.warehouse[0] = parseFloat(data.warehouse[0]);
  data.warehouse[1] = parseFloat(data.warehouse[1]);

  for (let i = 0; i < data.delivery.length; i++) {
    data.delivery[i] = data.delivery[i].split(', ');
    data.delivery[i][0] = parseFloat(data.delivery[i][0]);
    data.delivery[i][1] = parseFloat(data.delivery[i][1]);
  }
  return {warehouse: data.warehouse, delivery: data.delivery};
}

let allLocations = [locations.warehouse, ...locations.delivery];


const manila = new mapboxgl.LngLatBounds([120.7617187, 14.386892905], [121.053525416, 14.691678901])
function setupMap(center) {}
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  // style: "mapbox://styles/mapbox/satellite-v9", // style URL SATELLITE
  center: locations.warehouse, // starting position [lng, lat]
  // maxBounds: manila,
  zoom: 14, // starting zoom
  testMode: true,
});

const warehouseMarker = new mapboxgl.Marker({color: "red"})
  .setLngLat(locations.warehouse)
  .addTo(map);

for (let i = 0; i < locations.delivery.length; i++) {
  markers.push(new mapboxgl.Marker({})
    .setLngLat(locations.delivery[i])
    .addTo(map));
}



function decodePolyline(encoded) {
  const coordinates = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63; //finds ascii                                                                                    //and subtract it by 63
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    coordinates.push([lng * 1e-5, lat * 1e-5]);
  }

  return coordinates;
}

// Helper function to find the parent of a vertex
function findParent(parent, i) {
  if (parent[i] === i) {
    return i;
  }
  return findParent(parent, parent[i]);
}

// Kruskal's algorithm to find the minimum spanning tree
function kruskalsAlgorithm(durations) {
  // Create an array to store the edges of the graph
  const edges = [];

  // Number of locations (vertices)
  const numLocations = durations.length;

  // Build the edges list from the durations matrix
  for (let i = 0; i < numLocations; i++) {
    for (let j = i + 1; j < numLocations; j++) {
      edges.push({ u: i, v: j, weight: durations[i][j] });
    }
  }

  // Sort the edges in non-decreasing order of weight
  edges.sort((a, b) => a.weight - b.weight);

  // Initialize the parent and rank arrays for the disjoint set
  const parent = new Array(numLocations).fill(0).map((_, i) => i);
  const rank = new Array(numLocations).fill(0);

  // Initialize the MST and total weight
  const minimumSpanningTree = [];
  let totalWeight = 0;

  // Perform Kruskal's algorithm to find the MST
  for (const edge of edges) {
    const uParent = findParent(parent, edge.u);
    const vParent = findParent(parent, edge.v);

    // If including this edge does not form a cycle, add it to the MST
    if (uParent !== vParent) {
      minimumSpanningTree.push(edge);
      totalWeight += edge.weight;
      union(parent, rank, uParent, vParent);
    }
  }

  return { mst: minimumSpanningTree, weight: totalWeight };
}

// Helper function to perform the union of two sets
function union(parent, rank, x, y) {
  const xRoot = findParent(parent, x);
  const yRoot = findParent(parent, y);

  if (rank[xRoot] < rank[yRoot]) {
    parent[xRoot] = yRoot;
  } else if (rank[yRoot] < rank[xRoot]) {
    parent[yRoot] = xRoot;
  } else {
    parent[yRoot] = xRoot;
    rank[xRoot]++;
  }
}

// function findLongestPathFromVertex(vertex) {
//   let maxWeight = 0;
//   let longestPath = [];

//   // Helper function to perform DFS
//   function dfs(currentVertex, parentVertex, currentWeight, currentPath) {
//     currentPath.push(currentVertex);

//     if (currentWeight > maxWeight) {
//       maxWeight = currentWeight;
//       longestPath = [...currentPath];
//     }

//     for (const edge of result.mst) {
//       const u = edge.u;
//       const v = edge.v;
//       const weight = edge.weight;

//       if (u === currentVertex && v !== parentVertex) {
//         dfs(v, u, currentWeight + weight, [...currentPath]);
//       } else if (v === currentVertex && u !== parentVertex) {
//         dfs(u, v, currentWeight + weight, [...currentPath]);
//       }
//     }
//   }

//   // Start DFS from the given vertex
//   dfs(vertex, -1, 0, []);

//   return {longestPath, maxWeight};
// }


async function getDurations() {
  const profile = 'driving';
  const durationCoords = `${locations.warehouse};${locations.delivery.join(';')}`
  const durationUrl = `https://api.mapbox.com/directions-matrix/v1/mapbox/${profile}/` + `${durationCoords}` + `?access_token=${mapboxgl.accessToken}`;

  const response = await fetch(durationUrl);
  const data = await response.json();
  return data.durations;
}

//get longest time
async function getLongestTime() {
  const durations = await getDurations();
  const result = kruskalsAlgorithm(durations);
  // console.log(result.mst[0].u);

  let maxWeight = 0;
  let longestPath = [];
  let pathTimes = []

  // Helper function to perform DFS
  function dfs(currentVertex, parentVertex, currentWeight, currentPath) {
    currentPath.push(currentVertex);

    // if node has no more children (is a leaf) and is not the first node
    if (result.mst.filter(edge => edge.u === currentVertex || edge.v === currentVertex).length === 1 && currentVertex !== 0) {
      pathTimes.push({path: currentPath, time: currentWeight});
    }



    if (currentWeight > maxWeight) {
      maxWeight = currentWeight;
      longestPath = [...currentPath];
    }

    for (const edge of result.mst) {
      const u = edge.u;
      const v = edge.v;
      const weight = edge.weight;

      if (u === currentVertex && v !== parentVertex) {
        dfs(v, u, currentWeight + weight, [...currentPath]);
      } else if (v === currentVertex && u !== parentVertex) {
        dfs(u, v, currentWeight + weight, [...currentPath]);
      }
    }
  }


  // Start DFS from the given vertex
  dfs(0, -1, 0, []);

  // console.log(result.mst);
  // console.log(maxWeight);

  //convert seconds to hours, minutes and seconds with 2 decimal places
  let hours = Math.floor(maxWeight / 3600);
  let minutes = Math.floor(maxWeight / 60);
  let seconds = Math.floor(maxWeight - minutes * 60);

  document.getElementById("longestTime").innerHTML = `${hours}h ${minutes}m ${seconds}s`;
  document.getElementById("vehicleNo").innerHTML = `${pathTimes.length}`
  return {longestTime: maxWeight, pathTimes};
}
let pathTimes = getLongestTime().then((data) => {
  console.log(data)
});

async function getRoutedLine(source, destination) {
  const lineUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${source[0]},${source[1]};${destination[0]},${destination[1]}?access_token=${mapboxgl.accessToken}`;
  const response = await fetch(lineUrl);
  const data = await response.json();
  return data;
}


async function drawRoutedLine() {
  const durations = await getDurations();
  const result = kruskalsAlgorithm(durations);

  const color = ["red", "orange", "yellow", "green", "blue", "purple", "pink"]

  result.mst.forEach(async (edge, index) => {
    const source = allLocations[edge.u];
    const destination = allLocations[edge.v];

    const data = await getRoutedLine(source, destination);
    const routeGeometry = data.routes[0].geometry;
    const routedCoords = decodePolyline(routeGeometry);

    // Use unique names for each source and layer
    const sourceId = `route-source-${index}`;
    const layerId = `route-layer-${index}`;

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: routedCoords,
        },
      },
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": color[index],
        "line-width": 5,
      },
    })
  })
};

async function drawSimpleLine() {
  const durations = await getDurations();
  const result = kruskalsAlgorithm(durations);

  const color = ["red", "orange", "yellow", "green", "blue", "purple", "pink"]

  result.mst.forEach(async (edge, index) => {
    const source = allLocations[edge.u];
    const destination = allLocations[edge.v];

    // Use unique names for each source and layer
    const sourceId = `route-source-${index}`;
    const layerId = `route-layer-${index}`;

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [source, destination],
        },
      },
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": color[index],
        "line-width": 5,
      },
    })
  })
};

const straightButton = document.getElementById("straightButton");
const routedButton = document.getElementById("routedButton");

drawSimpleLine();


straightButton.addEventListener("click", (button) => {
  mode = "simple";
  routedButton.classList.remove("activeButtonA");
  straightButton.classList.add("activeButtonA");
  // remove all layers with name = 'line' from map
  map.getStyle().layers.forEach((layer) => {
    if (layer.id.includes("route-layer")) {
      map.removeLayer(layer.id);
      map.removeSource(layer.source)
    }
  });
  drawSimpleLine();
});

routedButton.addEventListener("click", (button) => {
  mode = "routed";
  straightButton.classList.remove("activeButtonA");
  routedButton.classList.add("activeButtonA");
  // remove all layers with name = 'line' from map
  map.getStyle().layers.forEach((layer) => {
    if (layer.id.includes("route-layer")) {
      map.removeLayer(layer.id);
      map.removeSource(layer.source)
    }
  });
  
  drawRoutedLine();
});

map.addControl(
  new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl
  })
);