fx_version 'cerulean'
game 'gta5'

lua54 'yes'

author 'Kamikai <kamikai@gmail.com>'
description 'Kamikai UI'
version '0.0.1'

ui_page 'assets/index.html'

shared_scripts {
  '@es_extended/imports.lua',
  '@kmk_lib/imports.lua',
}

server_scripts({
  'server/main.lua'
})

client_scripts({
  'client/main.lua'
})

files {
  'assets/index.html',
  'assets/script.js',
  'assets/style.css',
  'assets/components/*.html'
}
