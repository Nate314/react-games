
export class Utility {
    // returns an array filled with the specified item with the specified length
    static array = (length: number, item?: any): any[] => Array(length).fill(item ? item : null)
    // sets the title of the document
    static setTitle = (game: string) => document.title = `Nate314 | react-games | ${game}`;
    // returns true if num passed is odd
    static isOdd = (num: number): boolean => num % 2 === 1;
    // returns true if num passed is even
    static isEven = (num: number): boolean => !Utility.isOdd(num);
}
