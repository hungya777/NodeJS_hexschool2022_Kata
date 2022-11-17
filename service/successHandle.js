const headers = require('./headers');

function successHandle (res, data){
  res.writeHead(200, headers);
  res.write(JSON.stringify({  //JSON.stringify() 將 JSON 物件格式轉換為字串。
    "status": "success",
    "data": data
  }))
  res.end();
}

module.exports = successHandle;
