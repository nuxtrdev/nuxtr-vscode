import content from "./modules.json";
const layers = new Set(["seo-kit", "umami"]);

export interface Module {
    name: string;
    description: string;
    repo: string;
    npm: string;
    icon: string;
    github: string;
    website: string;
    learn_more: string;
    category: string;
    type: string;
    maintainers: Maintainer[];
    compatibility: Compatibility;
    stats: Stats;
    contributors: Contributor[];
    isLayer?: boolean; // Add the isLayer property if it's applicable
}

export interface Maintainer {
    name: string;
    github: string;
    avatar: string;
}

export interface Compatibility {
    nuxt: string;
    requires: Record<string, boolean>;
}

export interface Stats {
    downloads: number;
    stars: number;
    watchers: number;
    forks: number;
    defaultBranch: string;
    publishedAt: number;
    createdAt: number;
}

export interface Contributor {
    id: number;
    username: string;
    contributions: number;
}


export function useModules() {
    const modules = content.modules as unknown as Module[];
    modules.forEach((module: Module) => {
        module.isLayer = layers.has(module.name) ? true : false;
    });

    return modules
}
