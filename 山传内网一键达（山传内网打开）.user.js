// ==UserScript==
// @name         山传内网一键达（山传代理打开）
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  !!登录山传代理后!!点击按钮将使用山西传媒学院代理打开当前网页
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
