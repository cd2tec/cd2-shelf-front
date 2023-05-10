const express = require('express');
const {resolve} = require('path')
const app = express();

app.use('/',
        express.static(resolve(__dirname,
          './build',
          
          
          ))
          
)


app.get('/', function(req, res) {
  res.render('index.html');
});

app.listen(process.env.PORT || 3000, (err) =>{

  if(err){return console.log(err)}
  console.log('Tudo funcionando certinho ');
  console.log(__dirname+'/build');
});