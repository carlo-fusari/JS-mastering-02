import * as THREE from './node_modules/three/build/three.module.js';

const statsElement = document.getElementById('stats');

// Scene
const scene = new THREE.Scene();
const canvas = document.getElementById('three-canvas');

const axesHelper = new THREE.AxesHelper(0.5);
axesHelper.renderOrder = 2;
//scene.add(axesHelper);
const grid = new THREE.GridHelper();
//scene.add(grid);

// Classes
const cellHeight = 0.1;
const wallHeight = 0.5;
const maxLife = 9;
class MazeCell {
    constructor(x, z) {
        this.posX = x;
        this.posZ = z;
        this.life = maxLife;

        this.mesh = null;
        this.player = null;
        this.baseColor = new THREE.Color(Math.random(),0,0);
        
        this.leftWall = null;
        this.upWall = null;
        this.rightWall = null;
        this.downWall = null;
        this.wallColor = new THREE.Color(1,1,1);

        this.init();

        this.isVisited = false;
        this.isCurrent = false;
        this.isPassed = false;
        this.isTarget = false;
    }

    init() {
        // cell
        let geometry = new THREE.BoxGeometry(sizeCell, cellHeight, sizeCell);
        const material = new THREE.MeshLambertMaterial({color: this.baseColor});
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(this.posX * sizeCell, 0, this.posZ * sizeCell);
        scene.add(mesh);
        this.mesh = mesh;

        const wallMaterial = new THREE.MeshLambertMaterial({color: this.wallColor});
        // left wall
        geometry = new THREE.BoxGeometry(sizeWalls, wallHeight, sizeCell + sizeWalls);
        let meshWall = new THREE.Mesh(geometry, wallMaterial);
        meshWall.position.set(-sizeCell/2, 0, 0);
        mesh.add(meshWall);
        this.leftWall = meshWall;

        // up wall
        geometry = new THREE.BoxGeometry(sizeCell + sizeWalls, wallHeight, sizeWalls);
        meshWall = new THREE.Mesh(geometry, wallMaterial);
        meshWall.position.set(0, 0, -sizeCell/2);
        mesh.add(meshWall);
        this.upWall = meshWall;

        // right wall
        geometry = new THREE.BoxGeometry(sizeWalls, wallHeight, sizeCell + sizeWalls);
        meshWall = new THREE.Mesh(geometry, wallMaterial);
        meshWall.position.set(sizeCell/2, 0, 0);
        mesh.add(meshWall);
        this.rightWall = meshWall;

        // down wall
        geometry = new THREE.BoxGeometry(sizeCell + sizeWalls, wallHeight, sizeWalls);
        meshWall = new THREE.Mesh(geometry, wallMaterial);
        meshWall.position.set(0, 0, sizeCell/2);
        mesh.add(meshWall);
        this.downWall = meshWall;
    }

    show() {
        const factor = 0.01;
        if(this.mesh != null) {
            if(this.isCurrent) {
                this.mesh.material = new THREE.MeshLambertMaterial({color: 0x4a134f});
            }
            else if (this.isTarget) {
                this.mesh.material = new THREE.MeshLambertMaterial({color: 0x44ff44});
            }
            else if (this.isPassed) {
                this.mesh.material = new THREE.MeshLambertMaterial({color: new THREE.Color(this.baseColor.r * factor, 0, (this.baseColor.r * 0.8 + 0.2) * this.life / maxLife)});
            }
            else if (this.isVisited) {
                this.mesh.material = new THREE.MeshLambertMaterial({color: new THREE.Color(this.baseColor.r * factor, 0, 0)});
            }
            else {
                this.mesh.material = new THREE.MeshLambertMaterial({color: this.baseColor});
            }
        }
    }

    activate() {
        this.isVisited = true;
        this.isCurrent = true;
        this.life = maxLife;
    }
};

// Geometry
const meshArray = [];
const size = 3;
const mazeX = 14* size;
const mazeZ = 9* size;
const sizeCell = 1.0;
const sizeWalls = 0.1;
for (let i = 0; i < mazeX; i++) {
    meshArray[i] = [];
    for (let j = 0; j < mazeZ; j++) {
        const cell = new MazeCell(i, j);
        meshArray[i][j] = cell;
    }
}

// Player
let geometry = new THREE.CylinderGeometry(sizeCell * 0.3, sizeCell * 0.3, 0.2);
let material = new THREE.MeshLambertMaterial({color: 0xffff00});
const playerMesh = new THREE.Mesh(geometry, material);
playerMesh.position.set(0, cellHeight, 0);
scene.add(playerMesh);

// Target
geometry = new THREE.ConeGeometry(sizeCell * 0.2, 0.9);
material = new THREE.MeshStandardMaterial();
material.emissive = new THREE.Color(0x00ff00);
material.emissiveIntensity = 0.5;
const targetMesh = new THREE.Mesh(geometry, material);
targetMesh.position.set(1, cellHeight, 1);
targetMesh.rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI);
scene.add(targetMesh);

// Camera
const aspect = canvas.clientWidth / canvas.clientHeight;
const frustumSize = 2 * size;
const halfFrustumSize = frustumSize / 2;
const camera = new THREE.OrthographicCamera(-halfFrustumSize * aspect, halfFrustumSize * aspect, halfFrustumSize, -halfFrustumSize, 1, 1000);
camera.position.set(sizeCell * mazeX / 2, 10, sizeCell * mazeZ / 2);
camera.lookAt(sizeCell * mazeX / 2, 0, sizeCell * mazeZ / 2);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.setClearColor(0x2e2e2e, 1.0);

// Lights
const light = new THREE.DirectionalLight();
light.position.set(0,1,0).normalize();
light.intensity = 5;
scene.add(light);

// Page Functions
window.addEventListener('resize', () => {
    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera.left = -halfFrustumSize * aspect;
    camera.right = halfFrustumSize * aspect;
    camera.top = halfFrustumSize;
    camera.bottom = -halfFrustumSize;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
});
document.addEventListener("keydown", function(event) {
    if (event.key === "W" || event.key === "w" || event.key === "ArrowUp") {
        MovePosition('u');
    }
    else if (event.key === "A" || event.key === "a" || event.key === "ArrowLeft") {
        MovePosition('l');
    }
    else if (event.key === "S" || event.key === "s" || event.key === "ArrowDown") {
        MovePosition('d');
    }
    else if (event.key === "D" || event.key === "d" || event.key === "ArrowRight") {
        MovePosition('r');
    }
    else if (event.key === "R" || event.key === "r") {
        ResetSolution();
    }
    else if (event.key === "G" || event.key === "g") {
        GenerateMaze();
    }
});

// Functions
function MovePosition(direction) {
    switch(direction) {
        case 'l':
            if(currentCell.posX > 0) {
                if(isGenerated && currentCell.leftWall === null) {
                    currentCell.isCurrent = false;
                    currentCell = meshArray[currentCell.posX - 1][currentCell.posZ];
                    currentCell.activate();
                    currentCell.isPassed = true;
                    moveCounter++;
                    ReduceLife();
                    CheckIfFinished();
                }
            }
            break;
        case 'u':
            if(currentCell.posZ > 0) {
                if(isGenerated && currentCell.upWall === null) {
                    currentCell.isCurrent = false;
                    currentCell = meshArray[currentCell.posX][currentCell.posZ - 1];
                    currentCell.activate();
                    currentCell.isPassed = true;
                    moveCounter++;
                    ReduceLife();
                    CheckIfFinished();
                }
            }
            break;
        case 'r':
            if(currentCell.posX + 1 < mazeX) {
                if(isGenerated && currentCell.rightWall === null) {
                    currentCell.isCurrent = false;
                    currentCell = meshArray[currentCell.posX + 1][currentCell.posZ];
                    currentCell.activate();
                    currentCell.isPassed = true;
                    moveCounter++;
                    ReduceLife();
                    CheckIfFinished();
                }
            }
            break;
        case 'd':
            if(currentCell.posZ + 1 < mazeZ) {
                if(isGenerated && currentCell.downWall === null) {
                    currentCell.isCurrent = false;
                    currentCell = meshArray[currentCell.posX][currentCell.posZ + 1];
                    currentCell.activate();
                    currentCell.isPassed = true;
                    moveCounter++;
                    ReduceLife();
                    CheckIfFinished();
                }
            }
            break;
        default:
            // nothing
    }
}
function ReduceLife() {
    for(let i = 0; i < meshArray.length; i++) {
        for(let j = 0; j < meshArray[i].length; j++) {
            if(meshArray[i][j].isPassed) {
                meshArray[i][j].life = Math.max(0, meshArray[i][j].life -1);
            }
        }
    }
}
function CheckIfFinished() {
    if(currentCell.mesh.position.x == targetMesh.position.x && currentCell.mesh.position.z == targetMesh.position.z) {
        isCompleted = true;
    }
}
function ResetSolution() {
    if(!isResetted) {
        for(let i = 0; i < meshArray.length; i++) {
            for(let j = 0; j < meshArray[i].length; j++) {
                scene.remove(meshArray[i][j].mesh);
            }
        }
        for (let i = 0; i < mazeX; i++) {
            meshArray[i] = [];
            for (let j = 0; j < mazeZ; j++) {
                const cell = new MazeCell(i, j);
                meshArray[i][j] = cell;
            }
        }
        currentCell = meshArray[0][0];
        currentCell.activate();
        visitedCells = 1;
        tempArray = [];
        tempArray.push(currentCell);
        meshArray[mazeX-1][mazeZ-1].isTarget = true;
        isResetted = true;
        isCompleted = false;
        stopMaze = false;
        moveCounter = 0;
    }
}
function GenerateMaze() {
    if(!isResetted) {
        ResetSolution();
    }

    do {
        const successfull = AreCellsAvailable();
        if(successfull) {
            
        }
        else {
            currentCell.isCurrent = false;
            currentCell = tempArray[tempArray.length - 2];
            currentCell.isCurrent = true;
            tempArray.pop();
        }
    } while (visitedCells < mazeX * mazeZ);

    //go back to first
    currentCell.isCurrent = false;
    currentCell = meshArray[0][0];
    currentCell.activate();
    currentCell.isPassed = true;

    //open random walls
    for(let i = 0; i < meshArray.length; i++) {
        for(let j = 0; j < meshArray[i].length; j++) {
            const rand = Math.random();
            if(rand > 0.95) {
                const n = Math.round(rand * 3);
                console.log(n);
                if(n === 0) {
                    DeleteWallsBetweenCells(meshArray[i][j], meshArray[Math.max(0, i-1)][j]);
                }
                else if(n === 1) {
                    DeleteWallsBetweenCells(meshArray[i][j], meshArray[i][Math.max(0, j-1)]);
                }
                else if(n === 2) {
                    DeleteWallsBetweenCells(meshArray[i][j], meshArray[Math.min(mazeX-1, i+1)][j]);
                }
                else if(n === 3) {
                    DeleteWallsBetweenCells(meshArray[i][j], meshArray[i][Math.min(mazeZ-1, j+1)]);
                }
            }
        }
    }

    isResetted = false;
    isGenerated = true;
    statsElement.textContent = '';
}
function AreCellsAvailable() {
    let successufull = false;

    const availableCells = [];
    //cell on the left
    let cell = meshArray[Math.max(0, currentCell.posX -1)][currentCell.posZ];
    if(!cell.isVisited) availableCells.push(cell);
    //cell on the up
    cell = meshArray[currentCell.posX][Math.max(0, currentCell.posZ - 1)];
    if(!cell.isVisited) availableCells.push(cell);
    //cell on the right
    cell = meshArray[Math.min(mazeX - 1, currentCell.posX + 1)][currentCell.posZ];
    if(!cell.isVisited) availableCells.push(cell);
    //cell on the down
    cell = meshArray[currentCell.posX][Math.min(mazeZ - 1, currentCell.posZ + 1)];
    if(!cell.isVisited) availableCells.push(cell);
    
    if(availableCells.length > 0) {
        const ind = Math.round(Math.random() * (availableCells.length-1));
        const previousCell = currentCell;
        previousCell.isCurrent = false;
        currentCell = meshArray[availableCells[ind].posX][availableCells[ind].posZ];
        currentCell.activate();
        DeleteWallsBetweenCells(previousCell, currentCell);
        visitedCells++;
        tempArray.push(currentCell);
        successufull = true;
    }

    return successufull;
}
function DeleteWallsBetweenCells(prev, curr) {
    if(prev != curr) {
        if(curr.posX > prev.posX) {
            curr.mesh.remove(curr.leftWall);
            curr.leftWall = null;
            prev.mesh.remove(prev.rightWall);
            prev.rightWall = null;
        }
        else if(curr.posX < prev.posX) {
            curr.mesh.remove(curr.rightWall);
            curr.rightWall = null;
            prev.mesh.remove(prev.leftWall);
            prev.leftWall = null;
        }
        if(curr.posZ > prev.posZ) {
            curr.mesh.remove(curr.upWall);
            curr.upWall= null;
            prev.mesh.remove(prev.downWall);
            prev.downWall = null;
        }
        else if(curr.posZ < prev.posZ) {
            curr.mesh.remove(curr.downWall);
            curr.downWall = null;
            prev.mesh.remove(prev.upWall);
            prev.upWall = null;
        }
    }
}

// Initiate
let currentCell = meshArray[0][0];
currentCell.isPassed = true;
currentCell.activate();
let visitedCells = 1;
let tempArray = [];
tempArray.push(currentCell);
meshArray[mazeX-1][mazeZ-1].isTarget = true;
targetMesh.position.set(mazeX-1, 0, mazeZ-1);
const cameraXdelta = -1;
const cameraZdelta = 10;
camera.position.x = currentCell.posX + cameraXdelta;
camera.position.z = currentCell.posZ + cameraZdelta;
camera.lookAt(currentCell.mesh.position);
let moveCounter = 0;

// Animate
let isResetted = false;
let isGenerating = false;
let isGenerated = false;
let isCompleted = false;
let stopMaze = false;
const limDeltaCameraNearX = -1;
const limDeltaCameraNearZ = 8;
const limDeltaCameraFarX = 4;
const limDeltaCameraFarZ = 11;
let timeBezier = 0.0;
let invert = 1;
let lastExecutionTime = 0;
const interval = 100;
function animate(currentTime) {
    if(!stopMaze) {
        for(let i = 0; i < meshArray.length; i++) {
            for(let j = 0; j < meshArray[i].length; j++) {
                meshArray[i][j].show();
            }
        }
        playerMesh.position.x = currentCell.posX;
        playerMesh.position.z = currentCell.posZ;

        const distX = currentCell.posX - camera.position.x;
        const distZ = camera.position.z - currentCell.posZ;
        if(distX < limDeltaCameraNearX) camera.position.x--;
        else if(distX > limDeltaCameraFarX) camera.position.x++;
        if(distZ < limDeltaCameraNearZ) camera.position.z++;
        else if(distZ > limDeltaCameraFarZ) camera.position.z--;

        statsElement.textContent = moveCounter + ' moves';

        if(isCompleted) {
            statsElement.textContent = 'maze completed in ' + moveCounter + ' moves';
            stopMaze = true;
        }
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    //every tot seconds
    const elapsedTime = currentTime - lastExecutionTime;
    if (elapsedTime >= interval) {
        
        timeBezier += 0.1 * invert;
        if(timeBezier > 1.0 || timeBezier < 0.0) {
            invert = -invert;
            timeBezier += 0.1 * invert;
        }
        MoveTarget();

        lastExecutionTime = currentTime;
    }
}
animate();


function MoveTarget() {
    targetMesh.position.y = Math.pow(1-timeBezier, 3)*arrayY[0] + 3*Math.pow(1-timeBezier, 2)*timeBezier*arrayY[1] + 3*(1-timeBezier)*Math.pow(timeBezier, 2)*arrayY[2] + Math.pow(timeBezier, 3)*arrayY[3];
}

const arrayY = [];

arrayY.push(0.0);
arrayY.push(0.0);
arrayY.push(1.0);
arrayY.push(1.0);