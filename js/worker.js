// import unirest from 'unirest';
// import parse5 from 'parse5';
// import { os } from 'os';
importScripts('../node_modules/jsonpath/jsonpath.js');
let jp = jsonpath;
let $ = jp.query;
/*
class FileTree {
    parent = {};
    lookup = {};
    constructor(d) {
        this.d = d;
        this.dd = {};
        this.flatten();
    }
    flatten() {
        let d = this.d;
        let e;
        for (e of d) {
            this.add(e);
        }
        this.setparent('', this.dd, 0);
    }
    addpath(prefix, path) {
        let dd = this.dd;
        let pp = prefix;
        let ddd = dd;
        for (let p of path) {
            pp = pp + p;
            if (!(pp in ddd)) {
                ddd[pp] = {};
            }
            ddd = ddd[pp];
            pp += "/";
        }
        return { path: pp, leaf: ddd };
    }
    add(e) {
        let result = null;
        if (e.self.match(/.*\.JPG$/i) || e.self.match(/.*\.PNG$/i) || e.self.match(/.*\.JPEG$/i)) {
            let dd = this.dd;
            let path1 = decodeURI(e.name).substring(root.length);
            if (e.directory) {
                let path = path1.split("/").filter(a => a.length > 0);
                let prefix = "";
                let pp;
                result = this.addpath(prefix, path);
                let ddd = dd;
                pp = prefix;
                for (let p of path) {
                    pp = pp + p;
                    ddd = ddd[pp];
                    pp += "/";
                    if (e.children) {
                        for (let c of e.children) {
                            this.add(c);
                            // let child = dd[c];
                        }
                    }
                }
            }
            else {
                let path = path1.split("/").filter(a => a.length > 0);
                path.pop();
                result = this.addpath("", path);
                result.leaf[path1] = null;
            }
            return result;
        }
        else {
            return result;
        }
    }
    setparent(prefix, p, depth) {
        if (p) {
            for (let c in p) {
                let cc = prefix + c;
                if (depth < 2) {
                    console.log(cc);
                }
                this.parent[cc] = p;
                this.lookup[cc] = p[c];
                this.setparent(prefix, p[c], depth + 1);
            }
        }
    }
    getbinarydata = function (filename) {
        return new Promise(function (resolve, reject) {
            var oReq = new XMLHttpRequest();
            // oReq.open("GET", "Pictures/Screenshot from 2023-06-22 17-30-39.png", true);
            oReq.open("GET", filename, true);
            oReq.responseType = "arraybuffer";

            oReq.onload = function (oEvent) {
                var arrayBuffer = oReq.response;
                let t = filename.substr(filename.lastIndexOf(".") + 1);
                var byteArray = new Uint8Array(arrayBuffer);
                // var blob = new Blob([arrayBuffer], { type: `image/${t}` });
                var blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
                var url = URL.createObjectURL(blob);
                resolve(url);
            };

            oReq.send();
        });
    };
    saveurl = function (filename, url) {
        let link = document.createElement("a");
        link.download = filename;
        //link.innerHTML = "Download File";
        // link.href = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.onclick = () => {
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(link.href);
            }, 100);
        };
        link.click();
    };
    static callit = async function (directory) {
        return new Promise(async function (resolve) {
            let allchildren = await FileTree.gettree(directory, 0);
            let children = allchildren;
            while (true) {
                if (!children || children.length == 0) {
                    break;
                }
                let nextchildren = [];
                for (let c of children) {
                    if (c.directory) {
                        let cc = await FileTree.gettree(c.name, c.depth + 1);
                        c.children = cc;
                        // console.log(cc)
                        nextchildren = nextchildren.concat(cc);
                    }
                }
                allchildren = allchildren.concat(nextchildren);
                children = nextchildren.filter(c => c.directory);
            }
            resolve(allchildren);
        });
    };
    static canonicalize = function (name) {
        if (name.indexOf("/../") != -1) {
            let i = name.indexOf("/../");
            let path = name.substr(0, i);
            path = path.substr(0, path.lastIndexOf('/'));
            return path + name.substr(i + 3);
        }
        else if (name.indexOf("/./") != -1) {
            return name.substr(0, name.indexOf("/./")) + name.substr(name.indexOf("/./") + 2);
        }
        if (name.startsWith("../")) {
            throw new Exception();
        }
        else if (name.startsWith("./")) {
            return name.substr(2);
        } else {
            return name;
        }
    };
}
    */
let debug = false;
class HTMLParser {
    static parse(html) {
        let document = { name: null, children: [], parent: null };
        let stack = [document];
        function print(str) {
            if (debug) {
                console.log(' '.repeat(stack.length - 1) + str);
            }
        }
        while (html.length > 0) {
            if (html.startsWith('</')) {
                let endtag = html.match('</(.*?)>');
                html = html.substr(endtag[0].length);
                let starttag = stack[stack.length - 1];
                if (endtag[1] == starttag.name) {
                    stack.pop();
                    print(endtag[0]);
                }
                else {
                    print(endtag[1]);
                }
            }
            else if (html.startsWith('<')) {
                let tag = html.match('<(.*?)>');
                let currenttag = stack[stack.length - 1];
                let attributes = [];
                print(tag[0]);
                html = html.substr(tag[0].length);
                if (tag[0].indexOf(" ") != -1) {
                    let sattributes = tag[0].substr(tag[0].indexOf(" ") + 1);
                    sattributes = sattributes.substr(0, sattributes.length - 1);
                    tag[1] = tag[1].substr(0, tag[1].indexOf(" "));
                    while (sattributes.length > 0) {
                        let attr = sattributes.match('[a-z]+=".*?"')[0];
                        let attr_ = {
                            name: attr.substr(0, attr.indexOf("=")),
                            value: attr.substr(attr.indexOf("=") + 2,
                                attr.length - attr.indexOf("=") - 3)
                        };
                        attributes.push(attr_);
                        sattributes = sattributes.substr(attr.length).trim();
                    }
                }
                let nexttag = { name: tag[1], children: [], parent: currenttag, attributes: attributes };
                currenttag.children.push(nexttag);
                if (['img', 'hr'].includes(nexttag.name)) {
                    continue;
                }
                stack.push(nexttag);
            }
            else {
                let text = html.substr(0, html.indexOf('<'));
                let currenttag = stack[stack.length - 1];
                currenttag.text = text;
                html = html.substr(html.indexOf('<'));
                print(text);
            }
        }
        return document;
    }
}

async function get(url) {
    return new Promise((resolve, reject) => {
        var client = new XMLHttpRequest();
        client.open('GET', url);
        client.onreadystatechange = function () {
            if (client.readyState == 4) {
                resolve(client.responseText.replaceAll('&amp;', '&'));
            }
        };
        client.send();
    });
}
async function processurl(url) {
    let text = await get(url);
    // console.log(text);
    let lines = text.split('\n');
    let html = [];
    let tags = [];
    for (let l of lines) {
        // console.log(lines);
        if (l.startsWith('<!')) {
            continue;
        }
        html.push(l.trim());
    }
    return HTMLParser.parse(html.join(''));
}
onmessage = async (e) => {
    let root = 'http://192.168.3.15/musicplayer/Music/';
    async function process(url) {
        if (debug) {
            console.log(url);
        }
        // let msg=url.substring(url.lastIndexOf('/'))
        // postMessage({ type: 'url', url: url });
        let document = await processurl(url);
        let json = { href: url, children: [] };
        let q = jp.query(document, '$.children[0].children[?(@.name=="body")]');
        let rows = jp.query(document, '$.children[0].children[?(@.name=="body")].children[?(@.name=="table")].children[?(@.name=="tr")]');
        let links = [];
        for (r of rows) {
            let tds = jp.query(r, '$.children[?(@.name=="td")]');
            let ths = jp.query(r, '$.children[?(@.name=="th")]');
            if (ths.length > 0) {
                continue;
            }
            if (tds.length > 0) {
                for (let td of tds) {
                    let img = jp.query(td, '$.children[?(@.name=="img")]')[0];
                    if (img) {
                        let alt = img.attributes.filter(a => {
                            return a.name == 'alt';
                        })[0];
                        if (alt.value == '[DIR]') {
                            let anchor = jp.query(r, '$.children[?(@.name=="td")]').filter(
                                a => {
                                    return a.children.length > 0 && a.children[0].name == 'a';
                                })[0].children[0];
                            let href = anchor.attributes.filter(a => a.name == 'href')[0].value;
                            // console.log(href);
                            let child = await process(url + href);
                            child.type = 'directory';
                            child.text = anchor.text;
                            json.children.push(child);
                            continue;
                        }
                        if (alt.value == '[SND]') {
                            let anchor = jp.query(r, '$.children[?(@.name=="td")]').filter(
                                a => {
                                    return a.children.length > 0 && a.children[0].name == 'a';
                                })[0].children[0];
                            let href = anchor.attributes.filter(a => a.name == 'href')[0].value;
                            json.children.push({ href: url + href, type: 'file', text: anchor.text });
                            let msg = decodeURI(url).substring(root.length) + ' ' + anchor.text;
                            postMessage({ type: 'url', url: msg });
                            // console.log(href);
                            continue;
                        }
                        continue;
                    }
                }
                continue;
            }
            continue;
        }
        return json;
    }
    let json = await process(root, { name: '<none>', children: [], type: null });
    console.log("Message received from main script");
    const workerResult = `Result: ${e.data[0] * e.data[1]}`;
    console.log("Posting message back to main script");
    postMessage({ type: 'result', data: json });
};