const jspaths = {
    flatten: 'js/flatten',
    overlay: 'js/overlay',
    musicqueue: 'js/musicqueue'
};

require.config({
    paths: jspaths,
    waitSeconds: 200,
});
require(["flatten", "overlay", "musicqueue"], function (result, Overlay, MusicQueue) {
    let FileTree = result.FileTree;
    $(function () {
        // function canonicalize(name) {
        //     if (name.indexOf("/../") != -1) {
        //         let i = name.indexOf("/../");
        //         let path = name.substr(0, i);
        //         path = path.substr(0, path.lastIndexOf('/'));
        //         return path + name.substr(i + 3);
        //     }
        //     else if (name.indexOf("/./") != -1) {
        //         return name.substr(0, name.indexOf("/./")) + name.substr(name.indexOf("/./") + 2);
        //     }
        //     if (name.startsWith("../")) {
        //         throw new Exception();
        //     }
        //     else if (name.startsWith("./")) {
        //         return name.substr(2);
        //     } else {
        //         return name;
        //     }
        // }
        let folderopen = 'fa fa-folder-open';
        let folderclosed = 'fa fa-folder';
        let musicdirectory = 'Music/';
        $("div.audio").attr('data-musicdirectory', musicdirectory);
        let audio = new MusicQueue($("div.audio"), status, statustop);
        let gettree = async function (hrefparent, depth) {
            // console.log(hrefparent)
            // console.log(depth)
            return new Promise(resolve => {
                let children = [];
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
                                    let name = canonicalize(hrefparent + href);
                                    children.push({ parent: hrefparent, self: canonicalize(href), name: name, directory: directory, depth: depth });
                                }
                            });
                        }
                    });
                    resolve(children);
                });
            });
        };
        function getdate(img, td) {
            gettags(img).then(function (tags) {
                $(td).append($("<div>").text(tags["DateTimeOriginal"]));
            });

        }
        // async function callit(directory) {
        //     return new Promise(async function (resolve) {
        //         let allchildren = await gettree(directory, 0);
        //         children = allchildren;
        //         while (true) {
        //             if (!children || children.length == 0) {
        //                 break;
        //             }
        //             let nextchildren = [];
        //             for (c of children) {
        //                 if (c.directory) {
        //                     cc = await gettree(c.name, c.depth + 1);
        //                     c.children = cc;
        //                     // console.log(cc)
        //                     nextchildren = nextchildren.concat(cc);
        //                 }
        //             }
        //             allchildren = allchildren.concat(nextchildren);
        //             children = nextchildren.filter(c => c.directory);
        //         }
        //         resolve(allchildren);
        //     });
        // }
        function status(message) {
            $("#status").text(message);
        }
        function statustop(message) {
            $("#statustop").text(message);
        }
        $("a.btn.btn-sm.stop").on("click", audio.stop);
        function getJSON(el) {
            let json = { self: el.self, uri: el.name };
            if (el.children) {
                json.children = [];
                for (let c of el.children) {
                    json.children.push(getJSON(c));
                }
            }
            return json;
        }
        let listtype = "ul";
        function renderJSON(json) {
            let list = $(`<${listtype}>`);
            list.addClass("json hide");
            for (let j of json) {
                let li = $("<li>");
                li.addClass("node");
                if (j.children || j.self.toUpperCase().match('\.MP3$')
                    || j.self.toUpperCase().match('\.M4A$')
                    || j.self.toUpperCase().match('\.OGG$')
                    || j.self.toUpperCase().match('\.AIFF$')
                    || j.self.toUpperCase().match('\.WAV$')
                ) {
                    let span = $("<span>");
                    span.text(decodeURIComponent(j.self).replace(/\/$/, '').replace(/\..[A-z]*$/, ''));
                    li.append(span);
                    list.append(li);
                    // Overlay.text(decodeURI(j.uri));
                    $("#status").text(decodeURI(j.uri));
                    console.log(j.uri);
                    li.attr('data-uri', j.uri);
                    li.attr('data-leaf', false);
                    if (j.children) {
                        // li=$("<li>")
                        // list.append(li)
                        li.addClass("dir");
                        li.prepend($("<i>").addClass(folderclosed).attr("href", '#').css("margin-right", "20px"));
                        let a = $('<a href="#" class="fa fa-play-circle-o singleplay" style="text-decoration:none;"></a>');
                        li.prepend(a);
                        li.
                            append(renderJSON(j.children));
                        a.on("click", audio.playallchildren.bind(audio));
                    }
                    else {
                        li.addClass("leaf");
                        let a = $('<a href="#" class="fa fa-play-circle-o singleplay" style="text-decoration:none;"></a>');
                        li.prepend(a);
                        a.on('click', function (event) {
                            // queue.push($(event.target).parent().attr('data-uri'));
                            // updateq();
                            // if (!playing) {
                            //     playall();
                            // }
                            audio.add(event);
                        });
                        li.attr('data-leaf', true);
                    }
                }
            }
            return list;
        }
        async function process(directory) {
            let d = await FileTree.callit(directory);
            let json = [];
            for (let el of d) {
                if (el.depth == 0) {
                    json.push(getJSON(el));
                }
            }
            // $('#json-renderer').jsonViewer(json);
            let ol = renderJSON(json);
            ol.removeClass("hide");
            let selector = "div.music";
            $(selector).empty().append(ol);
            /*
            $.contextMenu({
                // define which elements trigger this menu
                selector: "div.music li[data-leaf='false']",
                // define the elements of the menu
                items: {
                    playall: {
                        name: function (a) {
                            return "Play all"
                        }, callback: function (key, opt) {
                            $("li[data-leaf='true']", this).each((i, e) => {
                                queue.push($(e).attr('data-uri'))
                            }
                            )
                            updateq()
                            if (!playing) {
                                playall()
                            }
                        }
                    },
                }
            });
            */
            /*
            $.contextMenu({
                // define which elements trigger this menu
                selector: "div.music li[data-leaf='true']",
                // define the elements of the menu
                items: {
                    playall: {
                        name: function (a) {
                            return "Play"
                        }, callback: function (key, opt) {
                            queue.push(this.attr('data-uri'))
                            updateq()
                            if (!playing) {
                                playall()
                            }
                        }
                    },
                }
            });
            */
            /*
             $.contextMenu({
                 // define which elements trigger this menu
                 selector: "ul.dropdown-menu.music li",
                 // define the elements of the menu
                 items: {
                     remove: {
                         name: "Remove from queue", callback: function (key, opt) {
                             remove({ target: this })
                             return;
                         }
                     },
                     up: {
                         name: "Move up", callback: function (key, opt) {
                             moveup({ target: this })
                             return;
                         }
                     },
                     down: {
                         name: "Move down", callback: function (key, opt) {
                             movedown({ target: this })
                             return;
                         }
                     },
     
                 }
                 // there's more, have a look at the demos and docs...
             });
             */
            $('li', $(selector)).on("click", function (event) {
                event.stopPropagation();
                let eparent = $(event.target).parent();
                if ($(">" + listtype, eparent).length > 0) {
                    $(">" + listtype, eparent).each((i, e) => {
                        if ($(e).hasClass('hide')) {
                            $(e).removeClass('hide').addClass('show');
                            $(">i", eparent).removeClass(folderclosed).addClass(folderopen);
                        } else {
                            $(e).removeClass('show').addClass('hide');
                            $(">i", eparent).removeClass(folderopen).addClass(folderclosed);

                        }
                    });
                }
                else {
                    // queue.push($(event.target).attr('data-uri'))
                    // updateq()
                    // if (!playing) {
                    //     playall()
                    // }
                }
                return;
            });
            // console.log(d)
            let table = $("<table>").addClass("table"); //.addClass('table-striped');
            let tbody = $("<tbody>");
            table.append(tbody);
            for (let el of d) {
                if (!el.directory) {
                    let tr = $("<tr>");
                    tbody.append(tr);
                    let td = $("<td>");
                    tr.append(td);
                    td.addClass("music");
                    // let a = $("<a>")
                    // td.append(a)
                    // a.attr("href", el.name)
                    a = td;
                    a.text(decodeURIComponent(el.name));
                    a.attr("data-url", el.name);
                    // td.on("click", async function (e) {
                    //     td.trigger('add', [{ url: $(e.target).attr("data-url") }])
                    // })
                    td.on('add', async (e, p) => {
                        queue.push(p.url);
                        updateq();
                        if (!playing) {
                            playall();
                        }
                        return;
                    });
                }
            }
            // $("div.music").append(table)

            // getExif()
            // console.log(d)
        }
        function savefile(filename, data, mimetype) {
            let blob = new Blob([data], { type: mimetype });
            let link = document.createElement("a");
            link.download = filename;
            //link.innerHTML = "Download File";
            link.href = window.URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.onclick = () => {
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(link.href);
                }, 100);
            };
            link.click();
        }
        async function load() {
            Overlay.text('Loading music ....');
            Overlay.show();
            $("div.music").removeClass("show").addClass("hide");
            $("div.musicqueue").removeClass("show").addClass("hide");
            $("div.pictures").removeClass("show").addClass("hide");
            await process(musicdirectory);
            $("div.music").removeClass("hide").addClass("show");
            Overlay.hide();
        }
        load();
        if (false) {
            function resolveAfter2Seconds() {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve('resolved');
                    }, 2000);
                });
            }

            async function asyncCall() {
                console.log('calling');
                const result = await resolveAfter2Seconds();
                console.log(result);
                // expected output: "resolved"
            }

            asyncCall();
        }
        function gettags(selector) {
            return new Promise(resolve => {
                let img = $(selector)[0];
                EXIF.getData(img, function () {
                    resolve(EXIF.getAllTags(this));
                });
            });
        }
        function getExif() {
            let img1 = document.getElementById("img1");
            let img = $("img[src='Pictures/MorePhotos/20151018_230904.jpg']")[0];
            gettags("img[src='Pictures/MorePhotos/20151018_230904.jpg']").then(function (tags) {
                console.log(tags);
            });
            gettags("#img1").then(function (tags) {
                console.log(tags);
            });
            gettags("#img4").then(function (tags) {
                console.log(tags);
            });
            EXIF.getData(img, function () {
                let tags = EXIF.getAllTags(this);
                console.log(tags);
            });
            if (false) {

                EXIF.getData(img1, function () {
                    let tags = EXIF.getAllTags(this);
                    console.log(tags);

                });

                EXIF.getData(img1, function () {
                    var make = EXIF.getTag(this, "Make");
                    var model = EXIF.getTag(this, "Model");
                    var makeAndModel = document.getElementById("makeAndModel");
                    makeAndModel.innerHTML = `${make} ${model}`;
                });

                var img2 = document.getElementById("img2");
                EXIF.getData(img2, function () {
                    var allMetaData = EXIF.getAllTags(this);
                    var allMetaDataSpan = document.getElementById("allMetaDataSpan");
                    allMetaDataSpan.innerHTML = JSON.stringify(allMetaData, null, "\t");
                });

                var img3 = document.getElementById("img3");
                EXIF.enableXmp();
                EXIF.getData(img3, function () {
                    var allMetaData = EXIF.getAllTags(this);
                    var img3WithXmpMetaData = document.getElementById("img3WithXmpMetaData");
                    img3WithXmpMetaData.innerHTML = JSON.stringify(allMetaData, null, "\t");
                });
            }
        }
        $("button.music").on("click", function (e) {
            $("div.music").css("display") == 'none' ? $("div.music").show() : $("div.music").hide();
        });
        $("a.dropdown-item.music").on("click", function (e) {
            $("div.music").css("display") == 'none' ? $("div.music").show() : $("div.music").hide();

        });
        $("a.dropdown-item.pictures").on("click", function (e) {
            $("div.pictures").css("display") == 'none' ? $("div.pictures").show() : $("div.pictures").hide();
            $.get("Pictures").then(function (d) {
                return;
            });

        });
        $("button.pictures").on("click", function (e) {
            $("div.pictures").css("display") == 'none' ? $("div.pictures").show() : $("div.pictures").hide();

        });
        function resize() {
            let height = $("body").height() - $(".navbartop").height() - $(".navbarbottom").height() - 50;
            $("div.container-main").css('max-height', height);
            $("div.container-main").css('height', height);
            $("div.musicqueue").css('max-height', height);
            $("div.pictures").css('max-height', height);
            $("div.music").css('max-height', height);
            $("div.musiccontainer").css('max-height', height);
        }
        resize();
        $(window).on('resize', resize);
        $("div.container-main>ul a.music").on("click", function () {
            $("div.music").removeClass("hide").addClass("show");
            $("div.musicqueue").removeClass("show").addClass("hide");
            $("div.pictures").removeClass("show").addClass("hide");
        });
        $("div.container-main>ul a.pictures").on("click", function () {
            $("div.music").removeClass("show").addClass("hide");
            $("div.musicqueue").removeClass("show").addClass("hide");
            $("div.pictures").removeClass("hide").addClass("hide");
        });
        // $("div.container-main>ul a.musicqueue").on("click", function () {
        //     $("div.music").removeClass("show").addClass("hide");
        //     $("div.musicqueue").removeClass("hide").addClass("show");
        // });
        function backup() {
            let zip = new Zip($('body'));
            zip.add(['../Music/Bob Dylan/Another Self Portrait (1969-1971) The Bootleg Series, Vol 10/01-41- It Aint Me, Babe (Live with The Band, Isle Of Wight - Remix.mp3',
                '../Music/Crosby, Stills & Nash/Crosby, Stills & Nash/01 - Suite: Judy Blue Eyes.mp3']);
            zip.add(['../Music/Aretha Franklin/']);
            zip.add(['../Music/Johnny Cash']);
            zip.add(['../Music/Leon Russell']);
            zip.add(["../Music/David Bowie/Hunky Dory/01 Changes.mp3"]);
            zip.add(['../Music/Eric Clapton']);
        }
        $('body').on('zip.done', function () {
            alert('zip done');
            return;
        });
        $("body").tooltip({ selector: '[data-bs-toggle=tooltip]' });
        $('[data-bs-toggle="tab"]').on('show.bs.tab', async function (event) {
            let t = event.target;
            let divtab = $($(t).attr("data-bs-target"));
            if (divtab.attr("id") == 'pictures') {
                $('#pictures').empty();
                await FileTree.loadpictures();
            }
            return;
        });
        // backup();
    });
});