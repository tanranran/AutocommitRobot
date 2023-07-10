const request = require("request");
const path = require("path");
const fs = require("fs");
// 定义重试次数和间隔时间
const maxRetries = 3;
const retryInterval = 1000; // 1秒
const id = (~~(Math.random() * 100000)).toString(); // 获取小于10w的数字
const url = `https://robohash.org/${id}`;
const dirPath = path.resolve(__dirname, "pictures");
// 判断文件夹是否存在
if (!fs.existsSync(dirPath)) {
    // 创建文件夹
    fs.mkdirSync(dirPath);
} 
const fileName = new Date().toISOString().slice(0, 10);
// 定义一个重试函数
function retryRequest(url, retries) {
  return new Promise((resolve, reject) => {
    request(url)
      .on("response", response => {
        if (response.statusCode === 200) {
          resolve(response);
        } else {
          reject(new Error(`Request failed with status code: ${response.statusCode}`));
        }
      })
      .on("error", error => {
        if (retries > 0) {
          console.log(`Request failed, ${retries} retries left. Retrying in ${retryInterval}ms...`);
          setTimeout(() => {
            retryRequest(url, retries - 1)
              .then(resolve)
              .catch(reject);
          }, retryInterval);
        } else {
          reject(new Error("Maximum number of retries reached."));
        }
      })
      .pipe(fs.createWriteStream(`${dirPath}/${fileName}.png`));
  });
}
// 调用重试函数
retryRequest(url, maxRetries)
  .then(() => {
    console.log("图片下载成功");
  })
  .catch(error => {
    console.error("图片下载失败:", error);
  });