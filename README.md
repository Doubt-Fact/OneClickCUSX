# OneClickCUSX
山传内网一键达油猴插件


# 山传内网一键达油猴插件版-代码分析及原理解释

## 介绍
本脚本**(山传内网一键达)**是一个将当前网页使用山传校园网打开的油猴脚本。打开任意网页，单击页面右下角的**“内网打开”**即可实现与在学校校园网登录的同等体验（需要登录到山传的系统，可以点击上面的**“登录山传内网”**按钮）。

## 需求与问题
### 大背景
各大高校出于提供学术资源、促进学术交流、支持教学和科研等目的，一般会在各大机构（如知网）购买论文数据库供师生免费使用除了论文、文献等，除此之外，一些针对教育、科研的网站也往往对高校师生提供了优惠政策（如读秀、人大资源网等）。山传也不例外。但是，往往需要在校园网环境下登录，使用特定的IP进行访问才能获得这些资源（**可以在校图书馆官网上查看学校购买的资源列表**）。
### 校外登录条件和问题
山传借助第三方（大名鼎鼎的`深信服`）的技术，让师生可以在验证身份后通过代理，以校园网的身份访问其他网站。（登录后可以在综合服务大厅上看到几个常用的链接，如`中国知网`、`金山文档（教育版）`等）但是，这几个链接相对较少，而且只能固定的指向几个网站的首页，**不能**直接将具体的网页通过内网条件打开。这时我们现在正在进行的这个**“山传内网一键达（油猴插件版）”**就有了用武之地。

## 网址分析
### 代理访问
登录山传的系统后，我们在非校园网环境下通过山传的“内网”访问其他网页，其实就是山传将我们访问网页的需求进行了**“代理”**，由`用户-需求服务器`的端对端访问流程变为了`用户-学校-需求服务器`的流程（这里省略了DNS服务器等流程，实际上域名需要进行dns解析等步骤，比上述流程更加复杂），我们的主机并没有直接访问需求服务器，而是通过代理转发的方式完成了一次访问。
### -s.vpn.cusx.edu.cn:8118
我们在校外按照前述流程进行一次操作，注意观察网址。以知网为例，
知网的URL（网址）是：
`https://www.cnki.net/`
而在使用学校校园网进行代理后URL变成了：
`http://www-cnki-net-s.vpn.cusx.edu.cn:8118/`
有什么变化？我们发现，原本的URL中的`https`变成了`http`，`.`变成了`-`，最后还加上了`-s.vpn.cusx.edu.cn:8118/`。我们似乎发现规律了。但是，仅此而已吗？
我们再试一个网页，以新华社·山西频道的报道《第九届丝绸之路国际电影节·青年短片嘉年华在山西成功举办》（https://h.xinhuaxmt.com/vh512/share/11545162?d=134b1d3）为例，我们通过山传校园网代理打开，我们发现，网页内容没有任何变化，而网址变成了`http://h-xinhuaxmt-com-s.vpn.cusx.edu.cn:8118/vh512/share/11545162?d=134b1d3`,可以看到，`-s.vpn.cusx.edu.cn:8118`并不是直接加在整个URL的最后，而是加在了域名的最后，URL最后仍然是**路径**

## 功能实现
### 头部信息
我们在油猴中新建一个脚本，头部信息分别代表什么意思我就不过多叙述了，可以看我上一篇文章（`自动评教`）有写。
需要注意的是，上次我们只让其在山传（cusx.edu.cn）的网站中启用，而现在，为了让在任意网页中使用，我们要给起改成“应用于所有网站”
```javascript
// @match        *://*/*
```
### 转换URL
要想转换URL，我们首先要读取当前网页的URL。
还是新建一个函数：
```javascript
    function convertUrl() {
}
```
接着，我们可以使用`window.location.href`来获取当前URL，使用`window.location.pathname`来获取当前网页的域名，通过`window.location.pathname`来获取当前网页的path部分（也就是我们看到的`/`的部分），通过`window.location.search`来确定提交的内容（也就是我们在百度搜索等地方可以看到的`?=`部分,如果没有这个部分，我们在某些网页并不能正确获得当前的网址，例如在bing搜索中搜索`山西传媒学院`的URL是`https://cn.bing.com/search?q=山西传媒学院`，而如果没有这个部分，只是`https://cn.bing.com/`）
最后，我们使用一个简单的正则将`hostname`中的`.`转换为`-`，拼贴为一个新的`http`的URL并在新的窗口中打开： 
```javascript
        // 只改变域名的部分，排除路径部分
        let hostname = window.location.hostname;
        let path = window.location.pathname;
        let search = window.location.search;
        if (hostname.includes('.')) { // 如果域名中包含 "."
            hostname = hostname.replace(/\./g, '-'); // 将 "." 转换为 "-"
        }
        hostname += '-s.vpn.cusx.edu.cn:8118'; // 添加 "-s.vpn.cusx.edu.cn:8118"
        url = 'http://' + hostname + path + search; // 统一使用http
        window.open(url);
```
###在页面上添加一个按钮
函数有了，我们需要再添加个按钮来让函数可以被调用，我们可以添加一个按钮：
```javascript
    let button = document.createElement('button');
    button.innerHTML = '内网打开';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.addEventListener('click', convertUrl);
    // 将按钮添加到页面中
    document.body.appendChild(button);
```
这时，我们的按钮就添加到网页中了。但还有一个问题，很多网页并不是只有一层，图片等往往会阻挡住我们的按钮（例如我的网站之一`doubt-fact.top`）我们需要再给其添加一个样式，
```javascript
    button.style.zIndex = '9999';
```
zindex的值越大越靠上，我们直接加到9999，相信可以应对绝大部分的网页了（没有哪个前端会疯狂到添加一万层内容吧）

## 脚本安装
还是老规矩，脚本上传到**Greasy Fork**了，可以直接访问`https://greasyfork.org/zh-CN/scripts/470497`安装，或者搜索`山传内网一键达（山传内网打开）`安装。
（！！注意免责声明，遵守`MIT`协议！！）

## 完整代码

```javascript
// ==UserScript==
// @name         山传内网一键达（山传内网打开）
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  !!登录山传内网后!!点击按钮将使用山西传媒学院内网打开当前网页
// @match        *://*/*
// @grant        none
// @author       Doubt-Fact
// @license MIT
// ==/UserScript==

(function() {
    'use strict';

    // 创建按钮
    let button = document.createElement('button');
    button.innerHTML = '内网打开';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.addEventListener('click', convertUrl);

    // 将按钮添加到页面中
    document.body.appendChild(button);

    // 创建按钮
    let button2 = document.createElement('button');
    button2.innerHTML = '登录山传内网';
    button2.style.position = 'fixed';
    button2.style.bottom = '70px';
    button2.style.right = '20px';
    button2.style.zIndex = '9999';
    button2.addEventListener('click', LogIn);

    // 将按钮添加到页面中
    document.body.appendChild(button2);

    function convertUrl() {
        // 获取当前网址
        let url = window.location.href;

        // 只改变域名的部分，排除路径部分
        let hostname = window.location.hostname;
        let path = window.location.pathname;
        let search = window.location.search;
        if (hostname.includes('.')) { // 如果域名中包含 "."
            hostname = hostname.replace(/\./g, '-'); // 将 "." 转换为 "-"
        }
        hostname += '-s.vpn.cusx.edu.cn:8118'; // 添加 "-s.vpn.cusx.edu.cn:8118"
        url = 'http://' + hostname + path + search; // 统一使用http
        window.open(url);
    }
    function LogIn() {
        let scurl = 'http://authserver-cusx-edu-cn-s.vpn.cusx.edu.cn:8118/authserver/login?service=https%3A%2F%2Fvpnehall.cusx.edu.cn%3A8000%2Fauth%2Fcas_validate%3Fentry_id%3D2';
        window.open(scurl);
    }
})();
```
