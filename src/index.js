import * as THREE from './three';
import './OBJLoader';

var scene = new THREE.Scene();
// scene.background = new THREE.Color( 0xff0000 );
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var icosahedronGeometry = new THREE.IcosahedronGeometry( 20, 0 );
var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );

var icosahedron = new THREE.Mesh( icosahedronGeometry, material );
var wireframeId = null;

reloadWireframe();
animate();
camera.position.z = 55;

function reloadWireframe() {
  var geo = new THREE.EdgesGeometry( icosahedronGeometry ); // or WireframeGeometry( geometry )
  var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1 } );
  var wireframe = new THREE.LineSegments( geo, mat );

  if (wireframeId == null) {
    scene.add(wireframe);
  } else {
    var currentWireframe = scene.getObjectById(wireframeId);
    var currentWireframeRotation = currentWireframe.rotation;
    
    currentWireframeRotation.x += 0.001;
    currentWireframeRotation.y += 0.001;
    wireframe.rotation.x = currentWireframeRotation.x;
    wireframe.rotation.y = currentWireframeRotation.y;

    scene.remove(currentWireframe);
    scene.add(wireframe);
  }

  wireframeId = wireframe.id;
}

// instantiate a loader
var loader = new THREE.OBJLoader();
var planeGroup;
var planeMeshes = [];
// load a resource
loader.load(
	// resource URL
	'models/airplane_scaled.obj',
	// called when resource is loaded
	function ( object ) {
    planeGroup = object;
    object.traverse(function (child) {

      if (child instanceof THREE.Mesh) {
          // child.material = material;
          planeMeshes.push(child);
      }

  });

  },

	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);
var selectedMesh = null;
function animate() {
  icosahedron.geometry.vertices.forEach(vertex => {
    // 1 - x+
    // 2 - y+
    // 3 - z+
    // 4 - x-
    // 5 - y-
    // 6 - z-
    var action = (Math.floor(Math.random() * 20) + 1);
    var adjust = Math.random();

    switch (action) {
      case 1:
        vertex.x += adjust;
        break;
      case 2:
        vertex.y += adjust;
        break;
      case 3:
        vertex.z += adjust;
        break;
      case 4:
        vertex.x -= adjust;
        break;
      case 5:
        vertex.y -= adjust;
        break;
      case 6:
        vertex.z -= adjust;
        break;
    }
    icosahedron.geometry.verticesNeedUpdate = true;
  });

  reloadWireframe();

  requestAnimationFrame( animate );
  icosahedron.rotation.y += 0.001;
  icosahedron.rotation.x += 0.001;

  // Testing to see if I can interact with part of a model through a mouse click.
  if (selectedMesh) {
    selectedMesh.rotation.y += 0.51;
  }
  renderer.render( scene, camera );
}

window.onload = function() {

  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  // See https://stackoverflow.com/questions/12800150/catch-the-click-event-on-a-specific-mesh-in-the-renderer
  // Handle all clicks to determine of a three.js object was clicked and trigger its callback
  function onDocumentMouseDown(event) {
      event.preventDefault();

      mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y =- (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      var intersects = raycaster.intersectObjects(planeMeshes);

      if (intersects.length > 0) {
          // Use this to "highlight" this clicked part of the model if it is made up
          // of different meshes.
          // intersects[0].object.material = material;
          selectedMesh = intersects[0].object;

          // get the current camera position
          const { x, y, z } = camera.position
          const start = new THREE.Vector3(x, y, z)

          // move camera to the target
          const point = intersects[0].point
          camera.lookAt(point);
          camera.position.z = 25;

      } else {
        camera.position.z = 55;

      }

  }

  document.addEventListener('mousedown', onDocumentMouseDown, false);
};