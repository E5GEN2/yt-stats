import { Iproxy } from '@customTypes/index';
import fs from 'fs';
import path from 'path';

export class ProxyManager {
    // Static instance to hold the singleton instance
    private static instance: ProxyManager | null = null;

    // Proxies array, initialized as an empty array
    private proxies: Iproxy[] = [];

    // Private constructor to prevent external instantiation
    private constructor() {
        this.proxies = this.loadProxies(); // Load proxies during first instantiation
    }

    // Static method to get the singleton instance
    public static getInstance(): ProxyManager {
        if (!ProxyManager.instance) {
            ProxyManager.instance = new ProxyManager(); // Create a new instance if it doesn't exist
        }
        return ProxyManager.instance;
    }

    // Method to load proxies from the file
    private loadProxies(): Iproxy[] {
        const filePath = path.join(__dirname, '../../proxies.txt');

        // Read file content
        const data = fs.readFileSync(filePath, 'utf-8');

        // Split file content into an array of lines
        const lines = data.trim().split('\n');

        // Parse each line and store in an array of IProxy objects
        return lines.map((line) => {
            const [ip, port, username, password] = line.split(':').map((part) => part.trim());
            return { ip, port, username, password } as Iproxy;
        });
    }

    // Method to get a random proxy
    public getRandomProxy(): Iproxy {
        const randomIndex = Math.floor(Math.random() * this.proxies.length);
        return this.proxies[randomIndex];
    }

    // Method to get proxies
    public getProxies(): Iproxy[] {
        return this.proxies;
    }
}
