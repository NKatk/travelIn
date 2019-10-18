const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');

const app = express();

const home = require ('./DB/homepage');
const allArticles = require ('./DB/allArticles');
const article = require ('./DB/article');

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(favicon(path.join(__dirname + '/public/images/favicon.ico')));

app.get('/', (req, res)=>{
    res.end(__dirname +'/public/index.html');
});

app.post('/api/takehomepage/', (req, res)=>{
    const homeReq = takeHomePage(allArticles);
    homeReq.topPhoto = home.topPhoto;
    setTimeout(()=>{
        res.json(homeReq).status(200);
    },500)
});

app.post('/api/takebloglist', (req, res)=>{
    setTimeout(()=> {
        res.json(takeBlog(allArticles)).status(200);
    },500)
});

app.post(`/api/takearticle`, (req, res)=>{
    const articleReq = takeArticle(allArticles, (+req.body.id));
    if(articleReq)articleReq.recommendArticles = article.recommendArticles;
    setTimeout(()=> {
        if(!articleReq) return res.json(articleReq).status(404);
        return res.json(articleReq).status(200);
    },500)
});

app.get('*', (req, res)=>{
    res.sendFile(__dirname +'/public/index.html');
});


app.listen(5000, (err)=>{
    if (err) throw err;
    console.log('Server is running in port 5000')
});


function takeHomePage(arr){
    const lastNew = {};
    const topNews = [];
    let lastNewIndex = 0;
    let newArrTopId = [];
    for(let i = 0; i < arr.length; i++){
        if(arr[lastNewIndex].date < arr[i].date){
            lastNewIndex = i;
        }
        if(newArrTopId.length){
            for(let c =0; newArrTopId.length > c; c++){
                if(arr[newArrTopId[c]].views < arr[i].views){
                    newArrTopId.splice(c, 0, i);
                    break;
                }
                if(newArrTopId.length-1 === c){
                    newArrTopId.push(i);
                    break;
                }
            }
        }else{
            newArrTopId.push(i);
        }

    }

    for(let item in arr[lastNewIndex]){
        if(arr[lastNewIndex].hasOwnProperty(item)){
            if(item === 'body'){
                lastNew[item] = arr[lastNewIndex][item].slice(0, 701).replace(/(\<(\/?[^>]+)>)/g, '');
            }else if(item === 'comments'){
                lastNew[item] = arr[lastNewIndex][item].length;
            }else{
                lastNew[item] = arr[lastNewIndex][item];
            }
        }
    }

    newArrTopId.splice(4, newArrTopId.length-4);
    for(let r = 0; newArrTopId.length > r; r++){
        topNews.push({});
        for(let item in arr[newArrTopId[r]]){
            if(arr[newArrTopId[r]].hasOwnProperty(item)){
                if(item === 'body'){
                    topNews[r][item] = arr[newArrTopId[r]][item].slice(0, 401).replace(/(\<(\/?[^>]+)>)/g, '');
                }else if(item === 'comments'){
                    topNews[r][item] = arr[newArrTopId[r]][item].length;
                }else{
                    topNews[r][item] = arr[newArrTopId[r]][item];
                }
            }
        }
    }

    return {lastNew: lastNew, topNews: topNews};
}

function takeBlog(arr){
    const copyBlog = [];
    for(let i = 0; arr.length > i; i++){
        copyBlog.push({});
        for(let item in arr[i]){
            if(arr[i].hasOwnProperty(item)) {
                if (item === 'body') {
                    copyBlog[i][item] = arr[i][item].slice(0, 501).replace(/(\<(\/?[^>]+)>)/g, '');
                } else if (item === 'comments') {
                    copyBlog[i][item] = arr[i][item].length;
                } else {
                    copyBlog[i][item] = arr[i][item];
                }
            }
        }
    }

    return copyBlog;
}

function takeArticle(arr, id) {
    let article = {};
    for(let i = 0; arr.length > i; i++){
        if(id === arr[i].id){
            for(let item in arr[i]){
                if(arr[i].hasOwnProperty(item)){
                    article[item] = arr[i][item];
                }
            }
        }
    }
    //recommend list
    /*
    if(article.keys.length){
        let lastNewIndex = 0;
        let topNewTimeIndex = 0;
        let date = new Date();
        for(let i = 1; arr.length > i; i++){
            if(arr[lastNewIndex].date < arr[i].date && arr[i].id !== article.id){
                lastNewIndex = i;
            }
            if(((date - arr[topNewTimeIndex].date)/2) < (date - arr[i].date)/2 && arr[i].id !== article.id){
                topNewTimeIndex = i;
            }
        }
    }*/


    console.log();
    if(!Object.keys(article).length) return null;
    return article;
}
