const generateNumbers = () => {

    const numbers = [];

    while(numbers.length !== 50) {
        const generatedNumber = (Math.floor(Math.random() * 50) + 1);
        
        if(!numbers.includes(generatedNumber)) {
            numbers.push(generatedNumber);
        }
    }

    return numbers;
}

export default generateNumbers;