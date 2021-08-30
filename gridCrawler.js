class GridCrawler {

  constructor(grid) {
    this.grid = grid;
    this.gridRows = grid.length;
    this.gridColumns = grid[0].length;
  }

  // By passing a Starting Point and a Direction, it returns the closest Point from that Direction or null if no Point exist (Starting Point is on one of the four edges of the array)
  /*
      The directions are ordered clockwise.
      * = Starting Point

      0: |  1: /  2: *---  3: *  4: *  5: *  6: ---*  7 \
         *    *                \    |    /               *

  */
  getNeighbourPoint(gridPoint, direction) {

    //let gridColums = this.grid[0].length;
    //let gridRows = this.grid.length;

    switch (direction) {
      case 0:

        if (gridPoint.coordinates[1] == 0) {
          return null;
        }

        return this.grid[gridPoint.coordinates[1] - 1][gridPoint.coordinates[0]];
        break;

      case 1:
        if ((gridPoint.coordinates[0] == (this.gridColums - 1)) || (gridPoint.coordinates[1] == 0)) {
          return null;
        }

        return this.grid[gridPoint.coordinates[1] - 1][gridPoint.coordinates[0] + 1];
        break;

      case 2:
        if (gridPoint.coordinates[0] == (this.gridColums - 1)) {
          return null;
        }

        return this.grid[gridPoint.coordinates[1]][gridPoint.coordinates[0] + 1];
        break;

      case 3:
        if ((gridPoint.coordinates[0] == (this.gridColums - 1)) || (gridPoint.coordinates[1] == (this.gridRows - 1))) {
          return null;
        }

        return this.grid[gridPoint.coordinates[1] + 1][gridPoint.coordinates[0] + 1];
        break;

      case 4:
        if (gridPoint.coordinates[1] == (this.gridRows - 1)) {
          return null;
        }

        return this.grid[gridPoint.coordinates[1] + 1][gridPoint.coordinates[0]];
        break;

      case 5:
        if ((gridPoint.coordinates[0] == 0) || (gridPoint.coordinates[1] == (this.gridRows - 1))) {
          return null;
        }

        return this.grid[gridPoint.coordinates[1] + 1][gridPoint.coordinates[0] - 1];
        break;

      case 6:
        if (gridPoint.coordinates[0] == 0) {
          return null;

        }

        return this.grid[gridPoint.coordinates[1]][gridPoint.coordinates[0] - 1];
        break;

      case 7:
        if ((gridPoint.coordinates[0] == 0) || (gridPoint.coordinates[1] == 0)) {
          return null;

        }

        return this.grid[gridPoint.coordinates[1] - 1][gridPoint.coordinates[0] - 1];
        break;

      default:
        return null;
    }

  }

  //Returns an array of all the possible Directios a Point can connect to while following the Rules:

  /* Ruless:

  1- The Point can't go back after moving forward. --> if the last movement was | , then * is discarded.
                                                                                |        |
                                                                                *        |

  2- The Point can't have a direction immediately next to a previous one. --> if the last movement was | , then  * and * are discarded.
                                                                                                       |        /       \
                                                                                                       *       /         \
                                                                                                 0
  3- No Point can ever break Rule 2, even if the connection is made by another point. --> ..*---*---*---...
                                                                                               /
                                                                                              /
                                                                                     ...*---*    <-- Point 1 can't connect to Point 0, Point 0 would be breaking Rule 2 by being connected to it.
                                                                                              1

  4- Branches can't connect to themself nor to their father, but they can connect between brothers.

                                                         0   1
  5- Connections can't go through alredy made ones. -->  *   *
                                                           /    <-- Point 0 can't connect to Point 3 because it would have to go through the Connection from Point 1 to Point 2.
                                                          /
                                                         *   *
                                                         2   3
  */
  getPossibleConnections(gridPoint, parentId, maxConnections = 4) {

    let possibleConnections = [0, 1, 2, 3, 4, 5, 6, 7];

    // If the Point is on an Edge or has already met the max number of Connections allowed, is consider as Dead.
    if ((gridPoint.coordinates[0] == 0) || (gridPoint.coordinates[0] == this.gridColumns - 1) || (gridPoint.coordinates[1] == 0) || (gridPoint.coordinates[1] == this.gridRows - 1) || (gridPoint.connections.length >= maxConnections)) {

      return [];

    }

    // Compare every Direction with the Rules.
    for (var i = possibleConnections.length - 1; i >= 0; i--) {

      // Checking Rule 2.
      let directionErased = false;
      for (var myConnection of gridPoint.connections) {

        // TODO: FIND A BETTER WAY TO COMPARE 7 AND 0
        if ((possibleConnections[i] == 7 && myConnection == 0) || (possibleConnections[i] == 0 && myConnection == 7)) {
          possibleConnections.splice(i, 1);
          directionErased = true;
          break;

        }

        if (abs(possibleConnections[i] - myConnection) == 1) {
          possibleConnections.splice(i, 1);
          directionErased = true;
          break;
        }

      }
      if (directionErased) {
        continue;
      }

      // On Diagonal Lines (Directions 1, 3, 5 and 7) check for Rule 5, see if the Point between the connection are alredy connected.
      let neighbourPoint;
      if (possibleConnections[i] % 2 == 1) {
        neighbourPoint = this.getNeighbourPoint(gridPoint, possibleConnections[i - 1]);
        if (neighbourPoint == null) {
          continue;
        }

        for (var connection of neighbourPoint.connections) {
          if (((possibleConnections[i] + 2) % 8) == connection) {
            possibleConnections.splice(i, 1);
            continue;
          }

        }

      }

      // If there isn't any Point in that direction, and if it is but has alredy met the max number of Connections or connecting to it goes against Rule 4, discard it.
      neighbourPoint = this.getNeighbourPoint(gridPoint, possibleConnections[i]);
      if ((neighbourPoint == null) || (neighbourPoint == undefined) || (neighbourPoint.pathId == parentId) || (neighbourPoint.pathId == gridPoint.pathId) || (neighbourPoint.connections.length >= maxConnections)) {
        possibleConnections.splice(i, 1);
        continue;
      }

      // Checking for rule 1 and 3.
      for (var connection of neighbourPoint.connections) {
        // TODO: FIND A BETTER WAY TO COMPARE 7 AND 0
        if ((abs(((possibleConnections[i] + 4) % 8) - connection) == 1) || (((possibleConnections[i] + 4) % 8) - connection == 0) || ((possibleConnections[i] == 3) && (connection == 0)) || ((possibleConnections[i] == 4) && (connection == 7))) {
          possibleConnections.splice(i, 1);
          continue;
        }

      }

    }

    return possibleConnections;


  }

  //Connect the Starting Point with the one at the direction giver.
  connectPoints(gridPoint, direction) {
    let pointToConnect = this.getNeighbourPoint(gridPoint, direction);

    gridPoint.connections.push(direction);
    pointToConnect.connections.push((direction + 4) % 8);

  }

  // Recursive Function that build the initial skeleton of the pattern
  /*
    builderPoint: The Starting Point.
    builId: The identifier of all the points of this Branch.
    parentId: The identifier of all the points of the fathers Branch.
    currentBranchSize: How many Branches away i'm from the startin point.
  */

  createBranchSystem(maxSteps, maxChildren, maxBranchSize, maxConnections, builderPoint, buildId = 0, parentId = 0, currentBranchSize = 0) {

    let previousPointCoordinates = builderPoint.coordinates;
    let stepCounter = 0;

    builderPoint.pathId = buildId;

    // While it still have steps(movements) to take or if there isn't any available directios for it to branch off, it keeps moving to a random Point.
    while ((stepCounter < maxSteps) || (this.getPossibleConnections(builderPoint).length == 0)) {

      // Find all the possible directions it can move to, if there is none, then go back, if the Previous Point also have none, the Branch is dead.
      let possibleDirections = this.getPossibleConnections(builderPoint);
      if (possibleDirections.length == 0) {
        if (builderPoint.coordinates != previousPointCoordinates) {
          builderPoint = this.grid[previousPointCoordinates[1]][previousPointCoordinates[0]];
          continue;
        } else {
          return buildId;
        }
      }

      // It chooses a Random Direction, connects the Points and makes them part of its Branch.
      let randomIndex = Math.floor(Math.random() * possibleDirections.length);
      let randomDirection = possibleDirections[randomIndex];
      this.connectPoints(builderPoint, randomDirection);
      let connectedPoint = this.getNeighbourPoint(builderPoint, randomDirection);
      connectedPoint.pathId = buildId;

      // If the Point had an previous connection, go back.
      if (connectedPoint.connections.length > 1) {
        builderPoint = this.grid[previousPointCoordinates[1]][previousPointCoordinates[0]];
        continue;

      }

      // Move to Random Direction and start again.
      previousPointCoordinates = builderPoint.coordinates;
      builderPoint = this.getNeighbourPoint(builderPoint, randomDirection);
      stepCounter++;
    }


    // It will continue to call itself until the limit is hit.
    if (currentBranchSize < maxBranchSize) {

      let childCounter = 0;
      let lastIds = buildId + 1;

      // Branching off
      while ((childCounter < maxChildren) && (builderPoint.connections.length < maxConnections)) {

        let possibleSpreadDirections = this.getPossibleConnections(builderPoint);

        // If there is no available direction to branch off, the Branch is dead.
        if (possibleSpreadDirections.length == 0) {
          return buildId;
        }

        let randomIndex = Math.floor(Math.random() * possibleSpreadDirections.length);
        let randomSpreadDirection = possibleSpreadDirections[randomIndex];
        this.connectPoints(builderPoint, randomSpreadDirection);
        let childBranchPoint = this.getNeighbourPoint(builderPoint, randomSpreadDirection);

        // Create a new Branch by calling buildBrach on the Random Point.
        // The id is the sum of all the previous id to ensure that is .
        currentBranchSize++;
        lastIds += this.createBranchSystem(maxSteps, maxChildren, maxBranchSize, maxConnections, childBranchPoint, lastIds, buildId, currentBranchSize);
        currentBranchSize--;
        childCounter++;
      }
    }
    return buildId;
  }

  // Draw lines for every connection a Point on a Grid has.
  // This is just for debugging, it will be later change to its own class.
  // TODO: CREATE PATTERN DRAWER CLASS.
  drawConnections(gridToDraw, horizontalGap, verticalGap, offsetX, offsetY, Color, weight) {
    let pointsWalked = []
    for (var gridToDrawRow of gridToDraw) {
      for (var pointToDraw of gridToDrawRow) {
        for (var connection of pointToDraw.connections) {

          let endPoint = this.getNeighbourPoint(pointToDraw, connection, null);
          if (!pointsWalked.includes(endPoint)) {
            stroke(Color);
            strokeWeight(weight)
            line((pointToDraw.coordinates[0] * horizontalGap) + offsetX, (pointToDraw.coordinates[1] * verticalGap) + offsetY, (endPoint.coordinates[0] * horizontalGap) + offsetX, (endPoint.coordinates[1] * verticalGap) + offsetY);
          }

        }
        pointsWalked.push(pointToDraw);
      }

    }

  }

}
