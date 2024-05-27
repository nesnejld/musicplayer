define(function () {
    var parent = {};
    var lookup = {};
    var root = 'Pictures/';
    let folderopen = 'fa fa-folder-open';
    let folderclosed = 'fa fa-folder fa-4x';
    function gettags(selector) {
        return new Promise(resolve => {
            let img = $(selector)[0];
            EXIF.getData(img, function () {
                resolve(EXIF.getAllTags(this));
            });
        });
    }
    function tabulate(prefix, d) {
        let table = $("<table>").addClass("table");
        let i = 0;
        let tr = null;
        for (let n in d) {
            if (i % 5 == 0) {
                tr = $("<tr>");
                table.append(tr);
            }
            ++i;
            let td = $("<td>");
            let e = d[n];
            td.prop("data", e);
            td.prop("path", prefix + n);
            if (e) {
                //directory
                let directorydiv = $("<div>").css("display", "flex").css("flex-direction", "column");
                td.append(directorydiv);
                let span = $("<span>").addClass(folderclosed).css("color", "var(--bs-link-color)");
                directorydiv.append(span);
                span.on("mouseenter", function () {
                    $(this).css("color", "yellow");
                }
                ).on("mouseleave", function () {
                    $(this).css("color", "var(--bs-link-color)");
                });
                directorydiv.append($("<span>").text(`directory: ${n}`));
                span.prop("folder", e);
                span.prop("name", n);
                span.on('click', e => {
                    console.log($(e.currentTarget));
                    let folder = $(e.currentTarget).prop('folder');
                    let n = $(e.currentTarget).prop('name');
                    $("div.pictures").empty();
                    $("div.pictures").append(tabulate(prefix, folder));
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
                let name = decodeURI(n);
                topdiv.text(name);
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
                let buttonbar = $("<div>");
                topdiv.append(buttonbar);
                buttonbar.append(download);
                buttonbar.append(trash);
                buttonbar.append(rotate);
                // div3.append('<button class="btn"><i class="fa fa-close"></i></button>');
                // div3.append('<button class="btn"><i class="fa fa-folder"></i></button>');
                let img = $("<img>");
                imgdiv.append(img);
                img.attr("src", prefix + n);
                img.attr("class", "thumbnail");
                img.attr("width", "250px");
                img.css("transform", "rotate(0deg)");
                // td.append($("<a>").attr("href", prefix + n).text(n));
                td.append(div);
                download.prop('image', img);
                trash.prop('image', img);
                rotate.prop('image', img);
                rotate.prop('angle', 0);
                img.on("click", async function (e) {
                    let tags = await gettags(e.target);
                    let img = $("<img>").attr("src", $(e.target).attr("src")).attr("width", "500px");
                    let imageWidth = "ImageWidth" in tags ? tags["ImageWidth"] : tags["PixelXDimension"];
                    let imageHeight = "ImageHeight" in tags ? tags["ImageHeight"] : tags["PixelYDimension"];
                    $('#myModal div.modal-body').empty().append(img);
                    $('#myModal div.modal-content').css("width", "600px");
                    $('#myModal div.modal-body').append($("<div>").text(tags["DateTimeOriginal"]));
                    $('#myModal div.modal-body').append($("<div>").text(`width: ${imageWidth}; height:${imageHeight};`));
                    $('#myModal div.modal-body').append($("<div>").text(`make: ${tags["Make"]}; model:${tags["Model"]};`));
                    $('#myModal h5.modal-title').text(decodeURIComponent($(e.currentTarget).attr("src")));
                    $('#myModal').modal('show');
                    // window.open(e.target.src)
                });
                download.on("click", async function (e) {
                    console.log(`download ${filename}`);
                    // anchor.trigger('click');
                    $.get(name).then(async function (d) {
                        let url = await getbinarydata(name);
                        saveurl(filename, url);
                        return;
                    });
                });
                trash.on("click", async function (e) {
                    console.log(`trash ${filename}`);
                    $.get(`/cgi-bin/commands.py?command=pwd`).then(function (d) {
                        return;
                    });
                    $.get(`/cgi-bin/commands.py?command=delete&filename=${name}`).then(async function (d) {
                        console.log(d);
                        $('#pictures').empty();
                        await loadpictures();
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
            }
            tr.append(td);
        }
        return table;
    }
    function addpath(prefix, dd, path) {
        let pp = prefix;
        let ddd = dd;
        for (p of path) {
            pp = pp + p;
            if (!(pp in ddd)) {
                ddd[pp] = {};
            }
            ddd = ddd[pp];
            pp += "/";
        }
        return { path: pp, leaf: ddd };
    }
    function add(dd, e) {
        let path1 = decodeURI(e.name).substring(root.length);
        if (e.directory) {
            let path = path1.split("/").filter(a => a.length > 0);
            let prefix = "";
            let pp;
            let result = addpath(prefix, dd, path);
            ddd = dd;
            pp = prefix;
            for (p of path) {
                pp = pp + p;
                ddd = ddd[pp];
                pp += "/";
                if (e.children) {
                    for (c of e.children) {
                        add(dd, c);
                    }
                }
            }
        }
        else {
            let path = path1.split("/").filter(a => a.length > 0);
            path.pop();
            let result = addpath("", dd, path);
            // ddd = dd;
            // let pp = "";
            // for (p of path) {
            //     pp = pp + p;
            //     if (!(pp in ddd)) {
            //         ddd[pp] = {};
            //     }
            //     ddd = ddd[pp];
            //     pp += "/";
            // }
            result.leaf[path1] = null;
        }
        return;
    }
    function setparent(prefix, p) {
        if (p) {
            for (let c in p) {
                let cc = prefix + c;
                parent[cc] = p;
                lookup[cc] = p[c];
                setparent(cc + "/", p[c]);
            }
        }
    }
    function flatten(d) {
        let dd = {};
        for (e of d) {
            add(dd, e, decodeURI(e.parent).substring(root.length));
        }
        setparent('', dd);
        return (dd);
    }
    return { flatten: flatten, tabulate: tabulate };
});
