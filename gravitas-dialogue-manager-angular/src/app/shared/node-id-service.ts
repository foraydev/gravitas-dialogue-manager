export class NodeIdService {
    private static idsDistributed: string[] = [];

    public static getUniqueId() {
        let validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let id;
        do {
            id = validChars.charAt(this.randInt(0, validChars.length)) +
                 validChars.charAt(this.randInt(0, validChars.length)) +
                 validChars.charAt(this.randInt(0, validChars.length)) +
                 validChars.charAt(this.randInt(0, validChars.length));
        } while (this.idsDistributed.includes(id));
        this.register(id);
        return id;
    }

    public static idIsValid(id: string) {
        return !this.idsDistributed.includes(id.toUpperCase());
    }

    public static reset() {
        this.idsDistributed = [];
    }

    public static register(id: string) {
        this.idsDistributed.push(id.toUpperCase());
    }

    static randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min) + min);
    }
}