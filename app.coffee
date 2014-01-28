oneDay = 60 * 60 * 24
SerialPort = require("serialport").SerialPort

portName = '/dev/tty.usbmodem1421';
sp = new SerialPort portName, 
   baudRate: 9600
, false

sp.open ->
  console.log('open');
  sp.on 'data', (data) ->
    console.log('data received: ' + data);
  
writeHandler = (err, results) ->
  console.log('err ' + err) if err
  console.log('results ' + results) if results

express = require('express.io')
partials = require('express-partials')

app = express()

app.engine 'hamlc', require('haml-coffee').__express

app.use partials()

app.configure ->
  app.set('view engine', 'hamlc')
  app.set('layout', 'layout')

app.get '/', (req, res) ->
  res.render 'index.hamlc'

app.use(express.compress())
app.use(express.static(__dirname + '/public', { maxAge: oneDay }))

app.http().io()

app.io.route 'control', (req) ->
  sp.write "#{req.data}\n", writeHandler

app.listen(process.env.PORT || 5000)