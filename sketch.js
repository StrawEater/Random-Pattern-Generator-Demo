
let widthPointsInput;
let heightPointsInput;
let maxStepsInput;
let maxChildrenInput;
let maxBranchSizeInput;
let maxConnectionsInput;
let duplicationFactorInput;
let perfomanceInMillis;


function setup() {

  createP("The number of Points along side the X axis. Recommended is 10");
  widthPointsInput = createInput("10");

  createP("The number of Points along side the Y axis. Recommended is 10");
  heightPointsInput = createInput("10");

  createP("The number of Steps a Branch can take before trying to spread. Recommended is 6");
  maxStepsInput = createInput("6");

  createP("The number of Children a Branch can have (4 is the maximum). recommended is 4");
  maxChildrenInput = createInput("4");

  createP("How many branches can originate from the Starting Point. Recommended is 5");
  maxBranchSizeInput = createInput("5");

  createP("The number of connections a Point can have (4 is the maximum). Recommended is 4");
  maxConnectionsInput = createInput("4");

  createP("The number of times the base will be duplicated. Staying on the range from 1 to 4 is Recommended");
  duplicationFactorInput = createInput("2");

  perfomanceInMillis = createP("The pattern was drawn in 0.0 millis.");

  let canvas = createCanvas(windowWidth*0.58, windowHeight);
  canvas.position(windowWidth*0.42,0);

  createRandomPattern();

}

function findClosestPointToWall(grid) {

  for (var x = grid[0].length - 1; x >= 0; x--) {
    for (var y = 0; y < grid.length; y++) {
      if (grid[y][x].connections.length > 0) {
        return x;
      }
    }

  }

}

function findClosestPointToFloor(grid) {

  for (var y = grid.length - 1; y >= 0; y--) {
    for (var x = 0; x < grid[0].length; x++) {
      if (grid[y][x].connections.length > 0) {
        return y;
      }
    }

  }

}

function mirrorGridHorizontally(grid) {
  let mirroredGrid = [];
  let gridWidth = grid[0].length;

  for (var gridRow of grid) {
    let mirroedRow = [];
    for (var pointToMirror of gridRow) {
      let newCoordinateX = ((gridWidth - 1) - pointToMirror.coordinates[0]);
      let newConnections = [];

      for (var connection of pointToMirror.connections) {
        switch (connection) {
          case 0:
            newConnections.push(0);
            break;

          case 1:
            newConnections.push(7);
            break;

          case 2:
            newConnections.push(6);
            break;

          case 3:
            newConnections.push(5);
            break;

          case 4:
            newConnections.push(4);
            break;

          case 5:
            newConnections.push(3);
            break;

          case 6:
            newConnections.push(2);
            break;

          case 7:
            newConnections.push(1);
            break;
          default:

        }
      }

      let mirroedPoint = new GridPoint(newCoordinateX, pointToMirror.coordinates[1], 23);
      mirroedPoint.connections = newConnections;
      mirroedPoint.pathId = pointToMirror.pathId;
      mirroedRow.unshift(mirroedPoint);
    }
    mirroredGrid.push(mirroedRow);
  }
  return mirroredGrid;
}

function mirrorGridVertically(grid) {
  let mirroredGrid = [];
  let gridHeight = grid.length;
  let gridWidth = grid[0].length;
  for (var gridRow of grid) {
    let mirroedRow = [];
    for (var pointToMirror of gridRow) {
      let newCoordinateY = ((gridHeight - 1) - pointToMirror.coordinates[1]);
      let newConnections = [];

      for (var connection of pointToMirror.connections) {
        switch (connection) {
          case 0:
            newConnections.push(4);
            break;

          case 1:
            newConnections.push(3);
            break;

          case 2:
            newConnections.push(2);
            break;

          case 3:
            newConnections.push(1);
            break;

          case 4:
            newConnections.push(0);
            break;

          case 5:
            newConnections.push(7);
            break;

          case 6:
            newConnections.push(6);
            break;

          case 7:
            newConnections.push(5);
            break;
          default:

        }
      }

      let mirroedPoint = new GridPoint(pointToMirror.coordinates[0], newCoordinateY, 23);
      mirroedPoint.connections = newConnections;
      mirroedPoint.pathId = pointToMirror.pathId;
      mirroedRow.push(mirroedPoint);
    }
    mirroredGrid.unshift(mirroedRow);
  }
  return mirroredGrid;
}

function connectGrids(grid1, grid2, connectX, connectY) {
  let newGrid = [];
  let newGridWidth;
  let newGridHeight;

  //Find the new size of the Grid
  if (grid1.length < grid2.length + connectY) {
    newGridHeight = ((grid1.length + grid2.length) - ((grid1.length - 1) - connectY)) - 1;
  } else {
    newGridHeight = (grid1.length);
  }
  if (grid1[0].length < grid2[0].length + connectX) {
    newGridWidth = ((grid1[0].length + grid2[0].length) - ((grid1[0].length - 1) - connectX)) - 1;
  } else {
    newGridWidth = (grid1[0].length);
  }

  //Go through every point of the new empty grid
  for (var y = 0; y < newGridHeight; y++) {
    let newRow = [];
    for (var x = 0; x < newGridWidth; x++) {

      // If there are only grid1 points on that area, just copy them.
      if (((y < connectY) && (x <= grid1[0].length - 1)) || ((y <= grid1.length - 1) && (x < connectX))) {
        let newPoint = new GridPoint(x, y, 23);
        newPoint.connections = [...grid1[y][x].connections];
        newPoint.pathId = grid1[y][x].pathId;
        newRow.push(newPoint);

        // TODO: There is no need for the blank points after the base is fully complete
        // If none of the grid is there, fill it with new points
      } else if (((y < connectY) && (x > grid1[0].length - 1)) || ((y > grid1.length - 1) && (x < connectX))) {

        newRow.push(new GridPoint(x, y, 23));

        //In the intersection, combine the connections of the point if both grid have a Point on that Coordinate.
        //If only one grid has it, just copy the point.
        //If none of them have a Point, create a new one.
      } else if (((y >= connectY) && (x >= connectX) && (y <= grid1.length - 1) && (x <= grid1[0].length - 1))) {

        if (grid1[y][x].connections.length > 0 && grid2[y - connectY][x - connectX].connections.length > 0) {
          let newPoint = new GridPoint(x, y, 23);
          newPoint.connections = grid1[y][x].connections.concat(grid2[y - connectY][x - connectX].connections);
          newRow.push(newPoint);
        } else if (grid1[y][x].connections.length > 0) {

          let newPoint = new GridPoint(x, y, 23);
          newPoint.connections = [...grid1[y][x].connections];
          newPoint.pathId = grid1[y][x].pathId;
          newRow.push(newPoint);

        } else if (grid2[y - connectY][x - connectX].connections.length > 0) {
          let newPoint = new GridPoint(x, y, 23);
          newPoint.connections = [...grid2[y - connectY][x - connectX].connections];
          newPoint.pathId = grid2[y - connectY][x - connectX].pathId;
          newRow.push(newPoint);

        } else {
          newRow.push(new GridPoint(x, y, 23));

        }

        // If there are only grid2 points on that area, just copy them.
      } else if (((y >= connectY) && (x > grid1[0].length - 1)) || (y > grid1.length - 1)) {

        let newPoint = new GridPoint(x, y, 23);
        newPoint.connections = [...grid2[y - connectY][x - connectX].connections];
        newPoint.pathId = grid2[y - connectY][x - connectX].pathId;
        newRow.push(newPoint);

      }
    }
    newGrid.push(newRow);
  }
  return newGrid;
}

function duplicateGrid(grid,duplicationOrder){

  let duplicatedGrid =  grid;
  for (var i = 0; i < duplicationOrder; i++) {

    let mirroedGrid = mirrorGridHorizontally(duplicatedGrid);
    let closestPointToTheWallX = findClosestPointToWall(duplicatedGrid);
    let halfImage;
    if (closestPointToTheWallX - ((duplicatedGrid[0].length - 1) - closestPointToTheWallX) >= 0) {
      halfImage = connectGrids(duplicatedGrid, mirroedGrid, closestPointToTheWallX - ((duplicatedGrid[0].length - 1) - closestPointToTheWallX), 0);
    } else {
      halfImage = connectGrids(duplicatedGrid, mirroedGrid, 0, 0);
    }
    let mirroedGridVertically = mirrorGridVertically(halfImage);
    let closestPointToTheFloorY = findClosestPointToFloor(halfImage);
    let fullImage;
    if (closestPointToTheFloorY - ((halfImage.length - 1) - closestPointToTheFloorY) >= 0) {
      fullImage = connectGrids(halfImage, mirroedGridVertically, 0, closestPointToTheFloorY - ((halfImage.length - 1) - closestPointToTheFloorY));
    } else {
      fullImage = connectGrids(halfImage, mirroedGridVertically, 0, 0);
    }
    duplicatedGrid = fullImage;
  }
  return duplicatedGrid;
}

function getNewBase(widthPoints, heightPoints, maxSteps, maxChildren, maxBranchSize, maxConnections){

  let grid = [];
  for (var y = 0; y < heightPoints; y ++) {
    let gridRows = [];
    for (var x = 0; x < widthPoints; x ++) {
      gridRows.push(new GridPoint(gridRows.length, grid.length));
    }
    grid.push(gridRows);
  }

  baseMaker = new GridCrawler(grid);

  for (var i = 0; i < 4; i++) {
    baseMaker.createBranchSystem(maxSteps, maxChildren, maxBranchSize, maxConnections, grid[round(grid.length *0.5)][round(grid[0].length*0.23)]);
  }
  return grid;

}

function drawPattern(grid, x, y, width, height, Color, weight){

  let patterDrawer = new GridCrawler(grid);

  let horizontalGap = width / (grid[0].length - 1);
  let verticalGap = height / (grid.length - 1)

  patterDrawer.drawConnections(grid, horizontalGap, verticalGap, x, y, Color, weight);


}

function createRandomPattern(){

  let startingTime = performance.now();

  background(0);

  widthPoints = widthPointsInput.value();
  heightPoints = heightPointsInput.value();
  maxSteps = maxStepsInput.value();
  maxChildren = maxChildrenInput.value();
  maxBranchSize = maxBranchSizeInput.value();
  maxConnections = maxConnectionsInput.value();
  duplicationFactor = duplicationFactorInput.value();

  let basePattern = getNewBase(widthPoints, heightPoints, maxSteps, maxChildren, maxBranchSize, maxConnections);
  let basePatternWidth = width*0.25;
  let basePatternHeight = height*0.25;
  let basePatternX = width*0.25;
  let basePatternY = height*0.5
  drawPattern(basePattern, basePatternX - basePatternWidth/2, basePatternY - basePatternHeight/2, basePatternWidth, basePatternHeight, color(255), 10);
  drawPattern(basePattern, basePatternX - basePatternWidth/2, basePatternY - basePatternHeight/2, basePatternWidth, basePatternHeight, color(0), 7);

  let fullPattern = duplicateGrid(basePattern,duplicationFactor);
  let fullPatternWidth = width*0.50;
  let fullPatternHeight = height*0.75;
  let fullPatternX = width*0.5 + width*0.20;
  let fullPatternY = height*0.5
  drawPattern(fullPattern, fullPatternX - fullPatternWidth/2, fullPatternY - fullPatternHeight/2, fullPatternWidth, fullPatternHeight, color(255), 10);
  drawPattern(fullPattern, fullPatternX - fullPatternWidth/2, fullPatternY - fullPatternHeight/2, fullPatternWidth, fullPatternHeight, color(0), 7);

  let finishingTime = performance.now()
  perfomanceInMillis.html("The pattern was drawn in " + (finishingTime - startingTime) + " millis");

}
