import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

const app = express();

/**
 * 端口号
 * @type {number} _port
 */
const _port: number = 3001;

// bodyParser 解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 跨域
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");

  // 允许content-type
  res.header("Access-Control-Allow-Origin", "*");
  // 允许前端请求中包含Content-Type这个请求头
  res.header(
    "Access-Control-Allow-Headers",
    "DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type, X-Custom-Header, Access-Control-Expose-Headers, Token, Authorization",
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// 路由
import test from '@/router/test/test';
app.use("/test", test);

/**
 * 启动服务器
 * @param {number} port - 端口号
 */
function startServer(port: number) {
  app.get("/", (req: Request, res: Response) => {
    console.log(req);
    res.status(200).json("hello world");
  });

  // 指定 error链接
  app.use("/error", (req: Request, res: Response) => {
    res.status(404).send("error");
  });

  // 将未定义URL重定向 为 错误处理：未知请求
  app.use((req: Request, res: Response) => {
    res.status(404).json({ 
      code: 404,
      error: 'Pages Not Found' });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer(_port);
