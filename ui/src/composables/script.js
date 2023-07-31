const fs = require('fs')

const modules = require('./content.json')
const fieldsToKeep = [
    'name',
    'description',
    'repo',
    'npm',
    'github',
    'website',
    'stars',
    'downloads',
    'tags',
    'icon',
    'category',
    'type',
    'isLayer',
    'dependency-type',
    'module-options',
]



for (const key in modules.modules) {
    const module = modules.modules[key]
    for (const field in module) {
        if (!fieldsToKeep.includes(field)) {
            delete module[field]
        }
    }
    Object.assign(module)
}

fs.writeFileSync('./newContent.json', JSON.stringify(modules), (err) => {
    if (err) throw err
    console.log('The file has been saved!')
})
