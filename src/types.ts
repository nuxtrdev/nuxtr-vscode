/** Shared contracts for extension settings, dependency data and sidebar messages. */
import type { TSConfig } from 'pkg-types'

export interface ConfigurationProperty {
    title?: string;
    description?: string;
    tags?: string[];
    tsType?: string;
    markdownType?: string;
    id?: string;
    properties?: { [key: string]: ConfigurationProperty };
    default?: any;
    type?: string;
}

export interface NuxtrConfiguration {
    terminal: { reuse: boolean };
    scaffolding: { defaultLanguage: 'ts' | 'js'; composableUsePrefix: boolean };
    fileTemplates: { components: { defaultTemplate: string }; composables: { defaultTemplate: string }; apis: { defaultTemplate: string } };
    openItemsAfterCreation: boolean;
    defaultPackageManager: 'null' | 'Yarn' | 'NPM' | 'pnpm' | 'Bun';
    monorepoMode: {
        DirectoryName: string | null;
    };
    vueFiles: {
        template: {
            defaultLanguage: 'html' | 'pug';
        }
        firstTag: 'template' | 'script';
        script: {
            type: 'setup' | 'options';
            defaultLanguage: 'js' | 'ts';
        };
        style: {
            addStyleTag: boolean;
            alwaysScoped: boolean;
            defaultLanguage:
            | 'css'
            | 'scss'
            | 'sass'
            | 'less'
            | 'stylus'
            | 'postcss';
        };
        pages: {
            defaultTemplate: string;
        };
        layouts: {
            defaultTemplate: string;
        };
    };
    intellisense: {
        nuxtModules: boolean;
        vueFiles: boolean;
        nuxtignore: boolean;
        nuxtrc: boolean;
    };
    snippets: {
        nuxt: boolean;
        nitro: boolean;
    }

    piniaFiles: {
        defaultTemplate: 'options' | 'setup';
    }

    projectTemplates: UserProjectTemplate[];
}

export interface TSConfigNuxt extends TSConfig {
    vueCompilerOptions?: {
        plugins?: string[] | undefined;
    }
}

export type nuxtModule = {
    name: string;
    description: string;
    repo: string;
    npm: string;
    github: string;
    category: string;
    type: string;
    compatibility: {
        nuxt: string;
        requires: Record<string, any>;
    };
    tags: string[];
};

export type NuxtOfficialTemplate = {
    name: string;
    repo: string;
    branch: string;
    docs: string;
    description: string;
};


export type UserProjectTemplate = {
    name: string;
    description: string;
    repoURL: string;
    branch?: string;
}