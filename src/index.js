import * as THREE from './three';
import './OBJLoader';

// THREE.OBJLoader = OBJLoader;

var scene = new THREE.Scene();
// scene.background = new THREE.Color( 0xff0000 );
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

camera.position.z = 55;



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
		scene.add( object );

    animate();
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
  requestAnimationFrame( animate );
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  planeGroup.rotation.y += 0.01;
  planeGroup.rotation.x += 0.01;
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

      // meshObjects = [mesh, mesh2, mesh3]; // three.js objects with click handlers we are interested in
       
      var intersects = raycaster.intersectObjects(planeMeshes);

      if (intersects.length > 0) {
          // intersects[0].object.callback();
          // console.log("intersects");
          // intersects[0].object.material = material;
          selectedMesh = intersects[0].object;
          // get the current camera position
          const { x, y, z } = camera.position
          const start = new THREE.Vector3(x, y, z)

          // move camera to the target
          const point = intersects[0].point
          camera.lookAt(point);
          camera.position.z = 25;
          // const camDistance = camera.position.length()
          // camera.position
          //   .copy(point)
          //   .normalize()
          //   .multiplyScalar(camDistance)

          // save the camera position
          // const { x: a, y: b, z: c } = camera.position

          // invert back to original position
          // camera.position
          //   .copy(start)
          //   .normalize()
          //   .multiplyScalar(camDistance)

          // // animate from start to end
          // TweenMax.to(camera.position, 1, { x: a, y: b, z: c })
      } else {
        camera.position.z = 55;
      }

  }

  document.addEventListener('mousedown', onDocumentMouseDown, false);
};