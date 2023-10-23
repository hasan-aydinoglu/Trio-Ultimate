const generateTablePlace = () => {


    const numbers = [];

    while(numbers.length !== 2) {
        const generatedNumber = (Math.floor(Math.random() * 6) + 1);
        
        if(!numbers.includes(generatedNumber)) {
            numbers.push(generatedNumber);
        }
    }

    return numbers;
}

export default generateTablePlace;