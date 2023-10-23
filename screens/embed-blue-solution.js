import generateTablePlace from "./generate-table-place";

const embedBlueSolution = (tableNumbers, solution) => {
    const embedType = (Math.floor(Math.random() * 3) + 1);

    if (embedType === 1) {
        console.log('Yatay');
        return embedHorizontal(tableNumbers, solution);
    }
    else if (embedType === 2) {
        console.log('Dikey');
        return embedVertical(tableNumbers, solution);
    } else {
        console.log('Capraz');
        return embedCross(tableNumbers, solution);
    }
}

const embedHorizontal = (tableNumbers, solution) => {

    solution.shift();

    let tableReplaceArray = generateTablePlace();

    let xPosition = tableReplaceArray[0];
    let yPosition = tableReplaceArray[1];

    tableNumbers[xPosition][yPosition] = solution[0];
    console.log('horizontal: ' + xPosition + "," + yPosition);
    console.log('solution: ' + solution[0] + "," + solution[1] + "," + solution[2]);

    if ((yPosition + 2) > 6) {
        tableNumbers[xPosition][yPosition - 1] = solution[1];
        tableNumbers[xPosition][yPosition - 2] = solution[2];
    } else {
        tableNumbers[xPosition][yPosition + 1] = solution[1];
        tableNumbers[xPosition][yPosition + 2] = solution[2];
    }

    return tableNumbers;
}

const embedVertical = (tableNumbers, solution) => {

    solution.shift();

    let tableReplaceArray = generateTablePlace();

    let xPosition = tableReplaceArray[0];
    let yPosition = tableReplaceArray[1];

    tableNumbers[xPosition][yPosition] = solution[0];
    console.log('solution: ' + solution[0] + "," + solution[1] + "," + solution[2]);
    console.log('vertical: ' + xPosition + "," + yPosition);

    if ((xPosition + 2) > 6) {
        tableNumbers[xPosition - 1][yPosition] = solution[1];
        tableNumbers[xPosition - 2][yPosition] = solution[2];
    } else {
        tableNumbers[xPosition + 1][yPosition] = solution[1];
        tableNumbers[xPosition + 2][yPosition] = solution[2];
    }

    return tableNumbers;
}

const embedCross = (tableNumbers, solution) => {

    solution.shift();

    let tableReplaceArray = generateTablePlace();

    let xPosition = tableReplaceArray[0];
    let yPosition = tableReplaceArray[1];
    tableNumbers[xPosition][yPosition] = solution[0];

    console.log('solution: ' + solution[0] + "," + solution[1] + "," + solution[2]);
    console.log('x position: ' + xPosition);
    console.log('y position: ' + yPosition);

    if ((xPosition + 2) > 6) {
        if ((yPosition + 2) > 6) {
            console.log('First');
            tableNumbers[xPosition - 1][yPosition - 1] = solution[1];
            tableNumbers[xPosition - 2][yPosition - 2] = solution[2];
        } else {
            console.log('Second');
            tableNumbers[xPosition - 1][yPosition + 1] = solution[1];
            tableNumbers[xPosition - 2][yPosition + 2] = solution[2];
        }
    }

    else if ((xPosition - 2) < 0) {
        if (yPosition + 2 > 6) {
            console.log('Third');
            tableNumbers[xPosition + 1][yPosition - 1] = solution[1];
            tableNumbers[xPosition + 2][yPosition - 2] = solution[2];
        } else {
            console.log('Fourth');
            tableNumbers[xPosition + 1][yPosition + 1] = solution[1];
            tableNumbers[xPosition + 2][yPosition + 2] = solution[2];
        }
    } else {
        const direction1 = (Math.floor(Math.random() * 2) + 1);
        if (direction1 === 1) {
            const direction2 = (Math.floor(Math.random() * 2) + 1);
            if (direction2 === 1) {
                console.log('Fifth');
                tableNumbers[xPosition - 1][yPosition + 1] = solution[1];
                tableNumbers[xPosition - 2][yPosition + 2] = solution[2];
            } else {
                console.log('Sixth');
                tableNumbers[xPosition + 1][yPosition - 1] = solution[1];
                tableNumbers[xPosition + 2][yPosition - 2] = solution[2];
            }
        } else {
            const direction3 = (Math.floor(Math.random() * 2) + 1);
            if (direction3 === 1) {
                console.log('Seventh');
                tableNumbers[xPosition + 1][yPosition + 1] = solution[1];
                tableNumbers[xPosition + 2][yPosition + 2] = solution[2];
            } else {
                console.log('Eigth');
                tableNumbers[xPosition - 1][yPosition - 1] = solution[1];
                tableNumbers[xPosition - 2][yPosition - 2] = solution[2];
            }
        }
    }

    return tableNumbers;
}

export default embedBlueSolution;
