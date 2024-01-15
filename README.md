# 部署前后端分离项目

1. [Creating and Managing a Node.js Server on AWS - Part 1](https://hackernoon.com/tutorial-creating-and-managing-a-node-js-server-on-aws-part-1-d67367ac5171) 
2. [Tutorial: Creating and managing a Node.js server on AWS, part 2](https://medium.com/hackernoon/tutorial-creating-and-managing-a-node-js-server-on-aws-part-2-5fbdea95f8a1#.mnlkymeti) #medium 

```sh
# 安装NVM以及Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bashcurl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.zshrc
nvm install node

# HTTP Server
mkdir server
cd server
npm init
npm install express --save-dev

vim index.js
const express = require('express')
const app = express()
app.get('/', (req, res) => {res.send('HEY!')})
app.listen(3000, () => console.log('Server running on port 3000'))

node index.js
ctrl+z
bg %1  

```

```sh
sudo apt-get install nginx

# 如果上述命令未启动Nginx
sudo /etc/init.d/nginx start

## Nginx配置文件
cd /etc/nginx/sites-available/

sudo rm /etc/nginx/sites-enabled/default
sudo vim /etc/nginx/sites-available/tutorial

# Forward all HTTP traffic from port 80 to port 3000
server {
    listen 80;
    server_name tutorial;

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $http_host;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}

sudo ln -s /etc/nginx/sites-available/tutorial /etc/nginx/sites-enabled/tutorial
sudo service nginx restart

# 不使用crtl-z + bg来后台运行，安装pm2（支持本地开发并在本地实现云端部署）
npm i -g pm2
pm2 start index.js

## make sure that your PM2 restarts when your server restarts
pm2 startup
pm2 save
pm2 ls

# Use the number listed in `pm2 ls` to stop the daemon  
pm2 stop index # Remove it from the list  
pm2 delete index # Start it again, but give it a  
# catchy name  
pm2 start index.js --name “Tutorial”
pm2 save

# -----------------------本地端开发------------------------------------
# 在Github上新建一个仓库，并将本地和远程仓库关联（本地开发，push云端，server pull下来）
mkdir tutorial-pt-2
cd tutorial-pt-2

git init
echo "# serverFront" >> README.md
git add README.md
git commit --allow-empty -m "Well this is my first commit, *yay*"
git branch -M main
## 这里要写具体的仓库，使用SSH协议
git remote add origin git@github.com:Phobia-Cosmos/1.git
git push -u origin main

vim index.js
const express = require('express')  
const app = express()  
app.get('/', (req, res) => {  
  res.send('HEY!')  
})app.listen(3000, () => console.log('Server running on port 3000'))

npm install express --save

## 由于在本地开发，因此.DS_Store需要被忽略
vim .gitignore
node_modules  
.DS_Store

git add .  
git commit -m "Ze server."  
git push

# -----------------------服务器端开发----------------------------------
ssh-keygen -t ed25519 -C "2078719076@qq.com" # -C email是为了识别不同的key
cat ~/.ssh/id_ed25519.pub # 把这个上传到Github上
ssh -T git@github.com

ssh-add # 这个可以不使用

pm2 ls
pm2 delete tutorial # Only do this if a task is still running

# -----------------------本地端开发------------------------------------
vim ecosystem.config.js
module.exports = {
  apps: [{
    name: 'tutorial-2',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'root',
      host: '47.99.89.157',
      key: '~/.ssh/id_rsa',
      ref: 'origin/main',
      repo: 'git@github.com:Phobia-Cosmos/tutorial-pt-2.git',
      path: '/root',
      'post-deploy': '/root/.nvm/versions/node/v21.5.0/bin/npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
};

# 注意这里使用的是bash，zsh的配置有些问题，不会自动加载nvm等环境变量
pm2 deploy ecosystem.config.js production setup
git add .  
git commit -m "Setup PM2"  
git push

## 要提前设置好shell，参考上述表示解释
pm2 deploy ecosystem.config.js production

vim package.json
{
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "pm2": "^5.3.0"
  },
  "scripts": {
    "start": "node index.js",
    "restart": "pm2 startOrRestart ecosystem.config.js",
    "deploy": "pm2 deploy ecosystem.config.js production",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}

npm i pm2 --save-dev
npm run-script deploy

### Server side
pm2 save

# Serving HTML
vim index.js
const express = require('express')  
const app = express()
app.use(express.static('public'))  
app.listen(3000, () => console.log('Server running on port 3000'))

npm run-script deploy
```

## 未解决

1. 如何在zsh中也可以正常部署云运行
