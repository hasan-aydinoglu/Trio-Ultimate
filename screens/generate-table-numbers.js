const generateTableNumbers = () => {

    const numbers = [];

    while(numbers.length !== 7) {
        const generatedNumber = (Math.floor(Math.random() * 9) + 1);
        
        if(!numbers.includes(generatedNumber)) {
            numbers.push(generatedNumber);
        }
    }

    return numbers;
}

export default generateTableNumbers;