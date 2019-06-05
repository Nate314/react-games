
export class Utility {
    // returns an array filled with the specified item with the specified length
    static array = (length: number, item?: any): any[] => Array(length).fill(item ? item : null)
    // sets the title of the document
    static setTitle = (game: string) => document.title = `Nate314 | react-games | ${game}`;
    // returns true if num passed is odd
    static isOdd = (num: number): boolean => num % 2 === 1;
    // returns true if num passed is even
    static isEven = (num: number): boolean => !Utility.isOdd(num);
    // returns true if the first two numbers in both arrays are equal to each other
    static arePositionsEqual = (p1: number[], p2: number[]) => p1[0] === p2[0] && p1[1] === p2[1];
}
