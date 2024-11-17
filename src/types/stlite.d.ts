// types/stlite.d.ts
interface StliteInstance {
    writeFile: (path: string, content: string) => Promise<void>;
    install: (packages: string[]) => Promise<void>;
    unmount: () => void;
}

interface StliteMount {
    mount: (options: {
        requirements: string[];
        entrypoint: string;
        files: { [key: string]: string };
    }, container: HTMLElement) => Promise<StliteInstance>;
}

declare global {
    interface Window {
        stlite: StliteMount;
    }
}

export { };