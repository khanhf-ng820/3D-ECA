import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



const ALL_LAYERS = 0;
const INDIVIDUAL_LAYERS = 1;
const TRANSPARENT_OPACITY = 0.005;

var cells;
var cellsMesh = [];
var ruleSet = '10010110101101011101001010100101110111011111101101110111111101000111110000011100101000110011001110110001100101000001100000101010110001010110111001110111001011100000001100010000101110110011001011101010111011011111100111011111001110000110111001001001000001101010010111100101110111000001101011110111010101000011001000001100110001000010000110001101101110010001110011111101010100110011010100110010100010110010011111000001001100100110101101111100011111101111101111010101001111000110111110110001100111011101011111000110'; // Rule
var width = 21; // Width of grid of cells
var middle = (width - 1) / 2;
var boxWidth = 1; // Width (size) of each box
var gen = 0;
var totalGens = 15; // Number of layers / generations

var viewingMode = ALL_LAYERS;
var viewingLayer = 0;
var hideTransparentBlocks = false;


cells = Array.from({ length: width }, () => Array(width).fill(0));
cells[middle][middle] = 1;





var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  10000
);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x353935, 1);
document.body.appendChild(renderer.domElement);

var axesHelper = new THREE.AxesHelper( 50 );
scene.add( axesHelper );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
scene.add( directionalLight );








function drawCells() {
    let cellsMeshLayer = [];
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            if (cells[i][j] === 1) {
                const geometry = new THREE.BoxGeometry( boxWidth, boxWidth, boxWidth );
                const material = new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide, transparent: true, opacity: (hideTransparentBlocks ? 0.0 : TRANSPARENT_OPACITY) });
                const cube = new THREE.Mesh( geometry, material );
                cube.position.set( i * boxWidth - middle * boxWidth, - gen * boxWidth, j * boxWidth - middle * boxWidth );
                cellsMeshLayer.push( cube );
                scene.add( cube );
            }
        }
    }
    cellsMesh.push(cellsMeshLayer);
}

function wrap(x) {
    return (x + width) % width;
}

// Get neighboring cells of a cell and itself with wraparound
function getNeighbors(i, j) {
    return [
        cells[wrap(i - 1)][wrap(j - 1)],
        cells[wrap(i - 1)][j],
        cells[wrap(i - 1)][wrap(j + 1)],
        cells[i][wrap(j - 1)],
        cells[i][j],
        cells[i][wrap(j + 1)],
        cells[wrap(i + 1)][wrap(j - 1)],
        cells[wrap(i + 1)][j],
        cells[wrap(i + 1)][wrap(j + 1)]
    ];
}

function calculateState(cellArray) {
    let neighborhood = "";
    for (let i = 0; i < 9; i++) {
        neighborhood += (cellArray[i] === 1) ? "1" : "0";
    }
    let value = 511 - parseInt(neighborhood, 2);
    return parseInt(ruleSet[value]);
}


drawCells();
++gen;


while (gen < totalGens) {
    let nextCells = Array.from({ length: width }, () => Array(width).fill(0));
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            let state = calculateState(getNeighbors(i, j));
            nextCells[i][j] = state;
        }
    }
    cells = nextCells;
    drawCells();
    ++gen;
}



function opacify(layer, makeOpaque) {
    for (let i = 0; i < cellsMesh[layer].length; i++) {
        cellsMesh[layer][i].material.opacity = makeOpaque ? 1.0 : (hideTransparentBlocks ? 0.0 : TRANSPARENT_OPACITY);
    }
}


function viewLayers() {
    if (viewingMode === ALL_LAYERS) {
        for (let i = 0; i < cellsMesh.length; i++) {
            opacify(i, true);
        }
    } else if (viewingMode === INDIVIDUAL_LAYERS) {
        for (let i = 0; i < cellsMesh.length; i++) {
            opacify(i, false);
        }
        opacify(viewingLayer, true);
    }
}





window.addEventListener("keydown", (event) => {
    if (event.key === "1") {
        viewingMode = ALL_LAYERS;
    } else if (event.key === "2") {
        viewingMode = INDIVIDUAL_LAYERS;
    }
    if (viewingMode === INDIVIDUAL_LAYERS) {
        if (event.key === "ArrowUp") {
            viewingLayer = (viewingLayer - 1 + totalGens) % totalGens;
        }
        if (event.key === "ArrowDown") {
            viewingLayer = (viewingLayer + 1) % totalGens;
        }
    }
});










camera.position.set( 15, 0, 15 );
controls.update();







window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}



function render() {
    renderer.render(scene, camera);
}



function animate() {
    requestAnimationFrame( animate );


    viewLayers();
    
    
    controls.update();

    
    render();
}

animate();