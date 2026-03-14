let buildUrlPreloader = 'https://sales.upgradecrm.ru/build/'
fetch(buildUrlPreloader + 'manifest.json', { cache: 'no-store' }).
    then((response) => response.json()).
    then((manifest) => {
        let s = document.createElement('script')
        s.src = buildUrlPreloader + manifest['resources/js/bootstrap.js'].file
        s.type = 'module'
        document.head.appendChild(s)
        let l = document.createElement('link')
        l.rel = 'stylesheet'
        l.href = buildUrlPreloader + manifest['resources/css/app.scss'].file
        document.head.appendChild(l)
        s = document.createElement('script')
        s.src = buildUrlPreloader + manifest['resources/js/block-loader.js'].file
        s.type = 'module'
        document.body.appendChild(s)
        s.onload=()=>{
            blockLoader.init()
        }
    })

