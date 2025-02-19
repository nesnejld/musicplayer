define(["overlay"], function (Overlay) {
    var root = 'Pictures/';
    let folderopen = 'fa fa-folder-open';
    let folderclosed = 'fa fa-folder fa-4x';
    let arrowup = 'fa fa-arrow-up fa-2x';
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
        parenthandler = function (prefix, e) {
            console.log(e);
            let name = $(e.currentTarget).prop("name");
            let folder = this.parent[name];
            $("div.pictures").empty();
            let offset = 0;
            if (name.lastIndexOf("/") != -1) {
                let buttonbar = $("<div>").addClass(arrowup).addClass("arrowup buttonbar");//.text("Go to parent");
                buttonbar.css("color", "var(--bs-link-color)");
                $("div.pictures").append(buttonbar);
                let parentname = name.substring(0, name.lastIndexOf("/"));
                let parent = this.lookup[parentname];
                buttonbar.prop('folder', parent);
                buttonbar.prop('name', parentname);
                buttonbar.on('click', (e) => {
                    this.parenthandler(prefix, e);
                });
                offset = buttonbar.height();
            }
            // parentdiv.prop('name', n);
            let renderdiv = $("<div>").css({
                "margin-top": `${offset}px`
            });
            $("div.pictures").append(renderdiv.append(this.render(prefix, folder, $("div.pictures"))));
        }.bind(this);
        render = function (prefix, d, parentdiv) {
            let table = $("<table>").addClass("table table-striped");
            let tbody = $("<tbody>");
            table.append(tbody);
            let i = 0;
            let tr = null;
            let ncolumns = parseInt(parentdiv.width() / 500);
            for (let n in d) {
                if (i % ncolumns == 0) {
                    tr = $("<tr>");
                    tbody.append(tr);
                }
                ++i;
                let td = $("<td>");
                let e = d[n];
                td.prop("data", e);
                td.prop("path", prefix + n);
                if (e) {
                    //directory
                    let self = this;
                    let directorydiv = $("<div>").css("display", "flex").css("flex-direction", "column");
                    td.append(directorydiv);
                    let span = $("<span>").addClass(folderclosed).css('text-align', 'center').css("color", "var(--bs-link-color)");
                    directorydiv.append(span);
                    span.on("mouseenter", function () {
                        $(this).css("color", "yellow");
                    }
                    ).on("mouseleave", function () {
                        $(this).css("color", "var(--bs-link-color)");
                    });
                    directorydiv.append($("<span>").css('text-align', 'center').css("color", "var(--bs-link-color)").text(`${n}`));
                    span.prop("folder", e);
                    span.prop("name", n);
                    span.on('click', e => {
                        console.log($(e.currentTarget));
                        let folder = $(e.currentTarget).prop('folder');
                        let n = $(e.currentTarget).prop('name');
                        $("div.pictures").empty();
                        let buttonbar = $("<div>").addClass(arrowup).addClass("arrowup buttonbar");//.text("Go to parent");
                        buttonbar.css("color", "var(--bs-link-color)");
                        buttonbar.prop('folder', folder);
                        buttonbar.prop('name', n);
                        buttonbar.on("mouseenter", function () {
                            $(this).css("color", "yellow");
                        }
                        ).on("mouseleave", function () {
                            $(this).css("color", "var(--bs-link-color)");
                        });
                        buttonbar.on('click', (e) => {
                            self.parenthandler(prefix, e);
                        });
                        $("div.pictures").append(buttonbar);
                        let offset = buttonbar.height();
                        let renderdiv = $("<div>").css({
                            "margin-top": `${offset}px`
                        });
                        $("div.pictures").append(renderdiv.append(this.render(prefix, folder, $("div.pictures"))));
                    });
                }
                else {
                    //leaf
                    let div = $("<div>");
                    div.attr("class", "thumbnail").css({ "display": "flex", "flex-direction": "column" }).css("color", "var(--bs-link-color)");
                    let imgdiv = $("<div>").addClass("image").css("flex-grow", "1").css("overflow", "hidden");
                    let topdiv = $("<div>").addClass("top");
                    let bottomdiv = $("<div>").addClass("bottom");
                    let filename = decodeURI(n);
                    let name = decodeURI(prefix + n);
                    // topdiv.text(name);
                    topdiv.append($("<a>").attr("data-href", name).attr("href", "#").text(name.substring(prefix.length))).on("click", () => { });
                    div.append(topdiv);
                    div.append(imgdiv);
                    div.append(bottomdiv);
                    // let anchor = $("<a>").attr("href", name).attr("download", `/tmp/${name}`).text(name);
                    // bottomdiv.append(anchor);
                    // div3.append('<button type="button" class="btn btn-primary btn-small">Primary</button>');
                    // div3.append('<button class="btn"><i class="fa fa-home"></i></button>');
                    let download = $('<button>').addClass("btn").append($("<i>").addClass("fa fa-download").css("color", "var(--bs-link-color)"));
                    let trash = $('<button>').addClass("btn").append($("<i>").addClass("fa fa-trash").css("color", "var(--bs-link-color)"));
                    let rotate = $('<button>').addClass("btn").append($("<i>").addClass("fa fa-rotate-right").css("color", "var(--bs-link-color)"));
                    let select = $('<input>').addClass("form-check-input").css({ "position": "relative", "top": "7px", "left": "10px" }).attr({ "type": "checkbox", "value": "somthing" });
                    let buttonbar = $("<div>");
                    topdiv.append(buttonbar);
                    buttonbar.append(download);
                    buttonbar.append(trash);
                    buttonbar.append(rotate);
                    buttonbar.append(select);
                    // div3.append('<button class="btn"><i class="fa fa-close"></i></button>');
                    // div3.append('<button class="btn"><i class="fa fa-folder"></i></button>');
                    let img = $("<img>").on("load", () => function () {
                        alert(this.width + 'x' + this.height);
                    });
                    const img_ = new Image();
                    var imageLoaded = function () {
                        // Run onload code.
                        console.log(`${this.src} : ${this.naturalWidth}  x  ${this.naturalHeight}`);
                    };
                    img_.onload = imageLoaded;
                    img = $(img_);
                    img_.src = prefix + n;
                    img.attr("src", prefix + n);
                    img.attr("class", "thumbnail");
                    img.attr("width", "250px");
                    img.css("transform", "rotate(0deg)");
                    imgdiv.append(img);
                    // td.append($("<a>").attr("href", prefix + n).text(n));
                    td.append(div);
                    download.prop('image', img);
                    trash.prop('image', img);
                    rotate.prop('image', img);
                    rotate.prop('angle', 0);
                    img.on("click", async function (e) {
                        let tags = await FileTree.gettags(e.target);
                        let width = 200;
                        // let orientation = tags["Orientation"];
                        let imageWidth; // = "ImageWidth" in tags ? tags["ImageWidth"] : tags["PixelXDimension"];
                        let imageHeight; //= "ImageHeight" in tags ? tags["ImageHeight"] : tags["PixelYDimension"];
                        imageWidth = e.target.naturalWidth;
                        imageHeight = e.target.naturalHeight;
                        /*
                    orientation values:
                    1  = 0 degrees: the correct orientation, no adjustment is required.
                    2  = 0 degrees, mirrored: image has been flipped back-to-front.
                    3  = 180 degrees: image is upside down.
                    4  = 180 degrees, mirrored: image has been flipped back-to-front and is upside down.
                    5  = 90 degrees: image has been flipped back-to-front and is on its side.
                    6  = 90 degrees, mirrored: image is on its side.
                    7  = 270 degrees: image has been flipped back-to-front and is on its far side.
                    8  = 270 degrees, mirrored: image is on its far side.
                    
                         if (orientation == 6) {
                             let temp = imageHeight;
                             imageHeight = imageWidth;
                             imageWidth = temp;
                         }
                             */
                        let height = Math.floor(width / imageWidth * imageHeight) + 50;
                        let img = $("<img>").attr("src", $(e.target).attr("src")).width(width).height(height);
                        function getModal() {
                            return $(`
                        <div id="myModal" class="modal fade" tabindex="-1">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title">Confirmation</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                    </div>
                                    <div class="modal-body" style="justify-content: center;display:flex;">
                                        <p>Do you want to save changes to this document before closing?</p>
                                        <p class="text-secondary"><small>If you don't save, your changes will be lost.</small></p>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                        <button type="button" class="btn btn-primary">Save changes</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                `);
                        }
                        let modal = getModal(); //$("#myModal");
                        $("#myModal").remove();
                        modal.insertAfter("body");
                        modal.find('div.modal-body').empty().append(img);
                        console.log(`width:${width}; height:${height}`);
                        modal.find('div.modal-content')
                            .resizable({
                                handles: 'n, e, s, w, ne, sw, se, nw',
                            })
                            .draggable({
                                handle: '.modal-header'
                            }).on("resize", (e, ui) => {
                                modal.find("div.modal-body").css("width", "").css("height", "");
                                // $("#myModal div.modal-content").css("width", "").css("height", "");
                                let header = modal.find('div.modal-header');
                                let headerheight = header.outerHeight();
                                let footer = modal.find('div.modal-footer');
                                let footerheight = footer.outerHeight();
                                let body = modal.find("div.modal-body");
                                let width = body.width();
                                let height = body.height();
                                let contentwidth = modal.find("div.modal-content").width();
                                let contentheight = modal.find("div.modal-content").height();
                                console.log(`${width} ${height} ${contentwidth} ${contentheight}`);
                                if (width > contentwidth || height > contentheight) {
                                    height = contentheight - headerheight - footerheight - 100;
                                    console.log("Oops!");
                                }
                                height = contentheight - headerheight - footerheight - 50;
                                if (width * imageHeight / imageWidth > height) {
                                    width = Math.floor(height * imageWidth / imageHeight);
                                }
                                else {
                                    height = Math.floor(width / imageWidth * imageHeight);
                                }
                                console.log(`width:${width}; height:${height}; ${width / height}; ${imageWidth / imageHeight}`);
                                modal.find("div.modal-body img").width(width).height(height);
                                return;
                            });
                        // $("#myModal div.modal-content").width(width + 100);
                        modal.find("div.modal-content div.modal-body").width(width).height(height);
                        modal.find('div.modal-footer').empty().css({ "justify-content": "flex-start" }).append($("<div>").text(tags["DateTimeOriginal"]));
                        modal.find('div.modal-footer').append($("<div>").text(`width: ${imageWidth}; height:${imageHeight};`));
                        modal.find('div.modal-footer').append($("<div>").text(`make: ${tags["Make"]}; model:${tags["Model"]};`));
                        // modal.find(' h5.modal-title').text(decodeURIComponent($(e.currentTarget).attr("src")));
                        modal.modal('show');
                        // window.open(e.target.src)
                    });
                    download.on("click", async function (e) {
                        console.log(`download ${filename}`);
                        // anchor.trigger('click');
                        $.get(name).then(async function (d) {
                            let url = await this.getbinarydata(name);
                            this.saveurl(filename, url);
                            return;
                        }.bind(this));
                    }.bind(this));
                    trash.on("click", async function (e) {
                        console.log(`trash ${filename}`);
                        $.get(`/cgi-bin/commands.py?command=pwd`).then(function (d) {
                            return;
                        });
                        $.get(`/cgi-bin/commands.py?command=delete&filename=${name}`).then(async function (d) {
                            console.log(d);
                            $('div.pictures').empty();
                            Overlay.text('Loading pictures ....');
                            await FileTree.loadpictures(this.d);
                            return;
                        });
                        $.get(`/cgi-bin/commands.py?command=list&filename=${name}`).then(function (d) {
                            return;
                        });
                    }
                    );
                    rotate.on("click", async function (e) {
                        console.log(`rotate ${filename}`);
                        let img = $(e.currentTarget).prop('image');
                        let angle = ($(e.currentTarget).prop('angle') + 90) % 360;
                        $(e.currentTarget).prop('angle', angle);
                        img.css('transform', `rotate(${angle}deg)`);
                        console.log(angle);
                    }
                    );
                    select.on('change', e => {
                        console.log($(e.currentTarget).is(":checked"));
                        return;
                    });
                }
                tr.append(td);
            }
            return table;
        }.bind(this);
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
        static gettree = async function (hrefparent, depth) {
            // console.log(hrefparent)
            // console.log(depth)
            return new Promise(resolve => {
                let children = [];
                let href;
                let text;
                $.get(hrefparent).then(async function (d) {
                    $.each($.parseHTML(d), async function (i, el) {
                        // console.log(el)
                        if (el.tagName == 'TABLE') {
                            let trs = $('tr', el);
                            $.each(trs, async function (i, tr) {
                                if ($('th', tr).length == 0 && $('img[alt="[PARENTDIR]"]', tr).length == 0) {
                                    let directory = false;
                                    $('td', tr).each(function (i, td) {
                                        if (i == 0) {
                                            if ($('img[alt="[DIR]"]', td).length == 1) {
                                                directory = true;
                                            }
                                            if ($('img[alt="[FILE]"]', td).length == 1) {
                                                //file
                                            }
                                        }
                                        else if (i == 1) {
                                            href = $('a', td).attr('href');
                                            text = $('a', td).text();
                                        }
                                    });
                                    let name = FileTree.canonicalize(hrefparent + href);
                                    children.push({ parent: hrefparent, self: FileTree.canonicalize(href), name: name, directory: directory, depth: depth });
                                }
                            });
                        }
                    });
                    resolve(children);
                });
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
        static loadpictures = async function () {
            Overlay.text('Loading pictures ....');
            Overlay.show();
            let filetree = new FileTree(await FileTree.callit('Pictures/'));
            let parentdiv = $("div.pictures");
            parentdiv.append(filetree.render('Pictures/', filetree.dd, parentdiv));
            Overlay.hide();
            return;
        };

        static gettags = function (selector) {
            return new Promise(resolve => {
                let img = $(selector)[0];
                EXIF.getData(img, function () {
                    resolve(EXIF.getAllTags(this));
                });
            });
        };
    }


    return { FileTree: FileTree };
});
