import * as utilities from "./utilities.js";
import * as serverVariables from "./serverVariables.js"
import { API_EndPoint } from "./router.js";

let CachesExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");

global.repoChaches = [];
global.cacheCleanerStarted = false;

export default class CacheRequestManager {

    static startCachedRequestsCleaner() {
        setInterval(CacheRequestManager.flushExpired,CachesExpirationTime * 1000);
        console.log(BgWhite + FgBlue, "[Periodic caches cleaning process started...]");
    }
    static add(url, content, ETag = '') {
        if (!cacheCleanerStarted) {
            cacheCleanerStarted = true;
            CacheRequestManager.startCachedRequestsCleaner();
        }
        repoChaches.push({
            url,
            content,
            ETag,
            Expire_Time: utilities.nowInSeconds() + CachesExpirationTime,
        });
        console.log(BgWhite + FgBlue,url + ' Added to Url cache with Etag:  ' + ETag)
    }
    static find(url) {
        for (let cache of repoChaches)
            if (cache.url === url)
                return cache
    }
    static clear(url) {
        let index =0;
        for (let cache of repoChaches) {
            if (cache.url === url) {
                repoChaches.splice(index,1);
                index++
            }
        }
    }
    static flushExpired() {
        let now = utilities.nowInSeconds();
        for (let cache of repoChaches) {
            if (cache.Expire_Time <= now) {
                console.log(BgWhite + FgBlue, "Cache data of " + cache.url + ' as expired' );
                CacheRequestManager.clear(cache.url)
            }
        }
        
    }
    static get(httpContext) {
            let cache= CacheRequestManager.find(httpContext.req.url);
            if (cache !== undefined) {
                console.log(BgWhite + FgBlue, cache.url + ' fetched from cache')
                return httpContext.response.JSON(cache.content, cache.ETag, true);
            }
        }
        /*if (found ==false) {
            CacheRequestManager.add(httpContext.req.url, httpContext.payload);*/
    }







