# html4express
##Julian Frank's Fluid html Loader for Express

[![NPM](https://nodei.co/npm/jffl4express.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/jffl4express/)

[![NPM](https://nodei.co/npm-dl/jffl4express.png)](https://nodei.co/npm/jffl4express/) 

To use in your app from 
```
npm install jffl4express --save
```

inside your code

```
'use strict'                                        //Just asking the engine to be strict...Needed for ES6 Complaince
const app = require('express')()                    //Load  Express into app
const loadJFFL = require('jffl').loadjffl           //Load the jffl engine
app.set('views', '<jffl View Directory')            //Tell Express to use the provided directory for asset loading
app.set('view engine', 'jffl')                      //Tell Express that jffl is a view Engine
app.engine('jffl', loadJFFL)                        //Tell Express to use the loadJFFL engine wheever jffl files are to be rendered
```

Usage 

```
res.render('jffl file',{variables you want to inject into the html file generated}
```

To see a sample checkout the 'testjffl' folder inside node_modules\jffl