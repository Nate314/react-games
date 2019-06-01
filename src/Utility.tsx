
export class Utility {
    static array(length: number, item?: any): any[] {
        return Array(length).fill(item ? item : null);
    }
}
