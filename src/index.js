'use strict'
const log = require('logger')
const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000
const app = express()

const minio = require('minio-client')
app.use(bodyParser.json({
  limit: '1000MB',
  verify: (req, res, buf)=>{
    req.rawBody = buf.toString()
  }
}))
app.use(compression())
app.get('/getJSON/*', (req, res)=>{
  handleGetJSON(req, res)
})
app.post('/setJSON', (req, res)=>{
  handleSetJSON(req, res)
})
const handleGetJSON = async(req, res)=>{
  try{
    let args = req?.path?.replace('/get/', '')?.split('/')
    if(args.length < 2 || args.length > 3){
      res.sendStatus(400)
      return
    }
    let path, file = args[1]
    if(args[2]){
      path = args[1]
      file = args[2]
    }
    let data = await minio.getJSON(args[0], path, file)
    if(data){
      res.json(data)
    }else{
      res.sendStatus(400)
    }
  }catch(e){
    log.error(e)
    res.sendStatus(400)
  }
}
const handleSetJSON = async(req, res)=>{
  try{
    if(!req.body){
      res.sendStatus(400)
      return
    }
    let result = await minio.putJSON(req.body.bucket || req.body.cache, req.body.path, req.body.key, req.body.data, req.body.ttl)
    if(result){
      res.json(result)
    }else{
      res.sendStatus(400)
    }
  }catch(e){
    log.error(e)
    res.sendStatus(400)
  }
}
