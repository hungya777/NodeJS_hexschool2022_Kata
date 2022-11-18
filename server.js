const http = require("http"); //建立web server需要的套件
const mongoose = require("mongoose"); //載入mongoose套件，目的用來連接資料庫
const dotenv = require('dotenv'); //載入dotenv套件，用來管理環境變數
const Room = require("./models/room"); //載入自訂義的Model-Room（房型模組規格）
//載入自訂義 回應處理資訊
const headers = require("./service/headers");  
const errorHandle = require("./service/errorHandle");  //失敗:錯誤處理
const successHandle = require("./service/successHandle"); //成功，回傳資訊

dotenv.config({path:"./config.env"}); //根目錄上的.env的檔案路徑

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD); //用replace()去替換字串的方法

//連接資料庫
mongoose.connect(DB)
  .then(()=>{
    console.log('資料庫連線成功');
  })
  .catch((error)=>{
    console.log(error);
  })

const requestListener = async(req, res) =>{
  // console.log(req.url);
  // res.end();
  let body = ""; //宣告一個body 字串，來接收前端丟過來的資料
  req.on('data', (chunk) => { //透過req.on('data')來接chunk(片段)資料
    body+=chunk; //將chunk(片段)的資料組合後放在body
  })
  if(req.url == '/rooms' && req.method == "GET"){ //取得所有資料
    try{
      const totalRooms = await Room.find();
      successHandle(res, totalRooms);
    }catch(err){
      // console.log(err);
      errorHandle(res, err);
    }
  }else if(req.url == '/rooms' && req.method == "POST" ) { //新增單筆資料
    req.on('end', async ()=>{  //透過req.on('end')方法來使用接回來的資料; 需使用 async確保資料都已經接回來
      try { //加上try catch的目的是避免資料出現問題(因編譯資料有可能會失敗)
        const data = JSON.parse(body); //JSON.parse() 將 JSON 字串轉換為物件。
        const newRoom = await Room.create( //加上await等待將資料寫回資料庫
          {
            name: data.name,
            price: data.price,
            rating: data.rating
          }
        )
        successHandle(res, newRoom);
        res.end();
      }catch(err){
        errorHandle(res, err);
      }
    })
  }else if(req.url.startsWith("/rooms/") && req.method == "DELETE"){ //刪除單筆資料
    try{
      const id = req.url.split('/').pop();
      // console.log(id);
      const delteRoom = await Room.findByIdAndDelete(id);
      successHandle(res, delteRoom);
    }catch(err){
      errorHandle(res, err);
    }
  }else if(req.url.startsWith("/rooms") && req.method == "PATCH"){ //編輯單筆代辦
    try{
      const id = req.url.split('/').pop();
      req.on('end', async ()=>{
        const updateData = JSON.parse(body);
        const updateRoom = await Room.findByIdAndUpdate(id, updateData);
        successHandle(res, updateRoom);
      })
    }catch(err){
      errorHandle(res, err);
    }
  }else if(req.method == "OPTIONS"){ //cors跨網域
    res.writeHead(200, headers);
    res.end();
  }else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      "status": "false",
      "message": "找無此網路路由"
    }))
    res.end();
  }
}

const server = http.createServer(requestListener); //開啟一個伺服器, 然後建立requestListener額外將函式抽出來
server.listen(process.env.PORT || 3005); //監聽 環境變數的PORT 或 3005