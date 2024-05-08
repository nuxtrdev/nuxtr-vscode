import { languages } from 'vscode';
import { ModulesCodelensProvider } from './modules'
import { PluginsCodelensProvider } from './plugins'
import { LayersCodeLensProvider } from './layers'

function activateCodelenses() {
    const modulesLens = new ModulesCodelensProvider()
    const pluginsLens = new PluginsCodelensProvider()
    const layersLens = new LayersCodeLensProvider()

    languages.registerCodeLensProvider({ scheme: 'file', language: 'typescript' }, modulesLens)
    languages.registerCodeLensProvider({ scheme: 'file', language: 'typescript' }, pluginsLens)
    languages.registerCodeLensProvider({ scheme: 'file', language: 'typescript' }, layersLens)
}


const codelens = {
    activateCodelenses,
}

export default codelens
