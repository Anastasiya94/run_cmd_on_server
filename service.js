var express = require('express');
var jsonParser = require("body-parser").json();
const exec = require('child_process').exec
var encoding = require("encoding");
var htmlspecialchars = require('htmlspecialchars');
var striptags = require('striptags');
var pgp = require("pg-promise")();
var config = require("./config");
var unescape = require('unescape');
var isWin = /^win/.test(process.platform);
var array = [];
var connected = false;

var db = pgp(config.database);
db.connect().then(obj => {
        connected = true;
        db.any("SELECT * FROM template left JOIN statuses ON statuses.id = template.id_status").then(data => {
          data.forEach((row, index, data) => {
            array.push({command:unescape(data[index].command),param:data[index].parameter?unescape(data[index].parameter):data[index].parameter,comment:data[index].comment?unescape(data[index].comment):data[index].comment,id_status:data[index].id_status,name_status:data[index].name,time_start:new Date(data[index].time_start).toLocaleString(),time_end:new Date(data[index].time_end).toLocaleString(),result:data[index].result});
          });
          array.sort(function(a, b) { return a.time_start < b.time_start;});
        });
    }).catch(error => {
        console.log("Can't connect to database, no history will be loaded");
    });
      
var app = express();

app.use(express.static(__dirname + '/public/')); 

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

app.post('/play', jsonParser, function(req, res)
{
  var command = striptags(req.body.command.replace(/\s+/, ' '));
  var comman_split = command.split(' ');
  var opts = isWin ? {encoding:'cp866'} : {} ;
  var element = {command:comman_split[0], param:comman_split[1]?comman_split.slice(1):"",comment:striptags(req.body.comment),id_status:2,name_status:"В процессе",time_start:new Date().toLocaleString(),time_end:0,result:"Нет результата"};
  array.push(element);
  array.sort(function(a, b) { return a.time_start < b.time_start;});
  
  exec(command, opts, (error, stdout, stderr) => {
   element.time_end= new Date().toLocaleString();
   if (isWin) {
      stdout = encoding.convert(stdout, "utf8", "cp866").toString();
      stderr = encoding.convert(stderr, "utf8", "cp866").toString();
    }
    if (error)
    {
      element.result = stderr.replaceAll('\n','<br />').replaceAll('\r','');
      element.id_status = 3;
      element.name_status = "Ошибка";
    } 
    else
    {
      element.result = stdout.replaceAll('\n','<br />').replaceAll('\r','');
      element.id_status = 1;
      element.name_status = "Завершено";
      if (connected) {
          db.any("INSERT INTO template(command,parameter,id_status,comment,time_start,time_end,result) VALUES (${command},${parameter},${id_status},${comment},${time_start},${time_end},${result})", {command:htmlspecialchars(element.command),parameter:htmlspecialchars(element.param),id_status:element.id_status,comment:htmlspecialchars(element.comment),time_start:element.time_start,time_end:element.time_end,result:element.result }).then(data => {
          console.log("запись добавлена");
        });
      }
    } 
  });

  res.send(array);
  res.end();
});

app.post('/refresh', jsonParser, function(req, res)
{
   res.send(array);
   res.end();
});
  
app.listen(config.server.port ,function(){
  console.log("Server running at Port "+config.server.port);
});
