import { GenericFileSystem } from "../FileSystem";

interface GraphStore {
    client: any; // Replace with actual type depending on your usage
    get(subj: string): string[][];
    getRelMap(subjs?: string[], depth?: number): {[key: string]: string[][]};
    upsertTriplet(subj: string, rel: string, obj: string): void;
    delete(subj: string, rel: string, obj: string): void;
    persist(persistPath: string, fs?: GenericFileSystem): void;
}
