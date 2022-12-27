$(function () {
    let folderopen = 'fa fa-folder-open'
    let folderclosed = 'fa fa-folder'
    let gettree = async function (hrefparent, depth) {
        // console.log(hrefparent)
        // console.log(depth)
        return new Promise(resolve => {
            let children = []
            $.get(hrefparent).then(async function (d) {
                $.each($.parseHTML(d), async function (i, el) {
                    // console.log(el)
                    if (el.tagName == 'TABLE') {
                        let trs = $('tr', el)
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
                                        href = $('a', td).attr('href')
                                        text = $('a', td).text()
                                    }
                                })
                                children.push({ parent: hrefparent, self: href, name: hrefparent + href, directory: directory, depth: depth })
                            }
                        })
                    }
                })
                resolve(children)
            })
        })
    }
    function getdate(img, td) {
        gettags(img).then(function (tags) {
            $(td).append($("<div>").text(tags["DateTimeOriginal"]))
        })

    }
    async function callit(directory) {
        return new Promise(async function (resolve) {
            let allchildren = await gettree(directory, 0)
            children = allchildren
            while (true) {
                if (!children || children.length == 0) {
                    break;
                }
                let nextchildren = []
                for (c of children) {
                    if (c.directory) {
                        cc = await gettree(c.name, c.depth + 1)
                        c.children = cc
                        // console.log(cc)
                        nextchildren = nextchildren.concat(cc)
                    }
                }
                allchildren = allchildren.concat(nextchildren)
                children = nextchildren.filter(c => c.directory)
            }
            resolve(allchildren)
        })
    }
    let audio;
    function play(url) {
        return new Promise(resolve => {
            audio = new Audio(url)
            audio.controls = true
            $("div.audio").empty().append(audio)
            let span = $(`<span style="color:white"><a class="btn btn-lg stop" href="#"> <i class="fa fa-stop-circle" style="color:white" aria-hidden="true"></i>Stop</a></span>`)
            $("div.audio").append(span)
            span.on("click", stop)
            audio.play()
            audio.addEventListener('ended', d => {
                resolve();
            });

        })

    }
    queue = []
    playing = false
    function moveup(event) {
        let q = $(event.target).closest('[data-uri]').attr('data-uri')
        let i = queue.indexOf(q)
        if (i > 0) {
            let qq = queue.splice(i, 1)[0]
            queue.splice(i - 1, 0, qq)
            updateq();
        }
        event.stopPropagation()
    }
    function movetotop(event) {
        let q = $(event.target).closest('[data-uri]').attr('data-uri')
        let i = queue.indexOf(q)
        let qq = queue.splice(i, 1)[0]
        queue.splice(0, 0, qq)
        updateq();
        event.stopPropagation()
    }
    function movedown(event) {
        let q = $(event.target).closest('[data-uri]').attr('data-uri')
        let i = queue.indexOf(q)
        if (i != queue.length - 1) {
            let qq = queue.splice(i, 1)[0]
            queue.splice(i + 1, 0, qq)
            updateq();
        }
        event.stopPropagation()
    }
    function remove(event) {
        let q = $(event.target).closest('[data-uri]').attr('data-uri')
        let i = queue.indexOf(q)
        queue.splice(i, 1)
        updateq();
        event.stopPropagation()
    }
    function stop() {
        audio.currentTime = audio.duration
    }
    $("a.btn.btn-sm.stop").on("click", stop)
    function updateq() {
        $("ul.dropdown-menu.music").empty();
        queue.forEach(q => {
            let li, button, span
            li = $("<li>").attr("href", "#").addClass("dropdown-item music").attr("data-uri", q)// .text(decodeURIComponent(q))
            ///
            button = $("<a>").addClass("btn btn-sm btn-default")
            button.on("click", movetotop)
            span = $("<span>").addClass("fa fa-play")
            li.append(button.append(span))
            ///
            button = $("<a>").addClass("btn btn-sm btn-default")
            button.on("click", moveup)
            span = $("<span>").addClass("fa fa-long-arrow-up")
            li.append(button.append(span))
            //
            button = $("<a>").addClass("btn btn-sm btn-default")
            button.on("click", movedown)
            span = $("<span>").addClass("fa fa-long-arrow-down")
            li.append(button.append(span))
            //
            button = $("<a>").addClass("btn btn-sm btn-default")
            button.on("click", remove)
            span = $("<span>").addClass("fa fa-remove")
            li.append(button.append(span))
            li.append($("<span>").text(decodeURIComponent(q).replace(/\/$/, '')))
            $("ul.dropdown-menu.music").append(li)
        });
        $("div.musicqueue").empty();
        let table = $("<table>").addClass("musicqueue table table-striped text-nowrap table-primary")
        $("div.musicqueue").append(table)
        let thead = $("<thead>")
        table.append(thead)
        let tbody = $("<tbody>")
        table.append(tbody)
        queue.forEach(q => {
            let tr = $("<tr>")
            tbody.append(tr)
            let td = $("<td>").attr("data-uri", q)// .text(decodeURIComponent(q))
            ///
            button = $("<a>").addClass("btn btn-sm btn-default")
            button.on("click", movetotop)
            span = $("<span>").addClass("fa fa-play")
            td.append(button.append(span))
            ///
            button = $("<a>").addClass("btn btn-sm btn-default")
            button.on("click", moveup)
            span = $("<span>").addClass("fa fa-long-arrow-up")
            td.append(button.append(span))
            //
            button = $("<a>").addClass("btn btn-sm btn-default")
            button.on("click", movedown)
            span = $("<span>").addClass("fa fa-long-arrow-down")
            td.append(button.append(span))
            //
            button = $("<a>").addClass("btn btn-sm btn-default")
            button.on("click", remove)
            span = $("<span>").addClass("fa fa-remove")
            td.append(button.append(span))
            tr.append(td)
            td = $("<td>")
            td.append($("<span>").text(decodeURIComponent(q).replace(/\/$/, '')))
            tr.append(td)
        });
    }
    async function playall() {
        playing = true
        while (queue.length > 0) {
            let url = queue.shift()
            status(`Playing ${decodeURIComponent(url)}`)
            updateq();
            await play(url)
        }
        playing = false
    }
    function getJSON(el) {
        let json = { self: el.self, uri: el.name }
        if (el.children) {
            json.children = []
            for (let c of el.children) {
                json.children.push(getJSON(c))
            }
        }
        return json
    }
    let listtype = "ul"
    function renderJSON(json) {
        let list = $(`<${listtype}>`)
        list.addClass("json hide")
        function playallchildren(event) {
            let el = $(event.target).parent()
            $("li[data-leaf='true']", el).each((i, e) => {
                queue.push($(e).attr('data-uri'))
            }
            )
            updateq()
            if (!playing) {
                playall()
            }
            event.stopPropagation()
        }
        for (let j of json) {
            let li = $("<li>")
            if (j.children || j.self.toUpperCase().match('\.MP3$') || j.self.toUpperCase().match('\.M4A$') || j.self.toUpperCase().match('\.OGG$')) {
                let span = $("<span>")
                span.text(decodeURIComponent(j.self).replace(/\/$/, '').replace(/\..[A-z]*$/, ''))
                li.append(span)
                list.append(li)
                li.attr('data-uri', j.uri)
                li.attr('data-leaf', false)
                if (j.children) {
                    // li=$("<li>")
                    // list.append(li)
                    li.prepend($("<i>").addClass(folderclosed).attr("href", '#').css("margin-right", "20px"))
                    let a = $('<a href="#" class="fa fa-play-circle-o singleplay" style="text-decoration:none;color:blue;"></a>')
                    li.prepend(a)
                    li.
                        append(renderJSON(j.children))
                    a.on("click", playallchildren)
                }
                else {
                    let a = $('<a href="#" class="fa fa-play-circle-o singleplay" style="text-decoration:none;color:blue;"></a>')
                    li.prepend(a)
                    a.on('click', function (event) {
                        queue.push($(event.target).parent().attr('data-uri'))
                        updateq()
                        if (!playing) {
                            playall()
                        }

                    });
                    li.attr('data-leaf', true)
                }
            }
        }
        return list
    }
    async function process(directory) {
        let d = await callit(directory)
        let json = []
        for (let el of d) {
            if (el.depth == 0) {
                json.push(getJSON(el))
            }
        }
        // $('#json-renderer').jsonViewer(json);
        let ol = renderJSON(json)
        ol.removeClass("hide")
        let selector = "div.music"
        $(selector).empty().append(ol)
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
            event.stopPropagation()
            let eparent = $(event.target).parent()
            if ($(">" + listtype, eparent).length > 0) {
                $(">" + listtype, eparent).each((i, e) => {
                    if ($(e).hasClass('hide')) {
                        $(e).removeClass('hide').addClass('show')
                        $(">i", eparent).removeClass(folderclosed).addClass(folderopen)
                    } else {
                        $(e).removeClass('show').addClass('hide')
                        $(">i", eparent).removeClass(folderopen).addClass(folderclosed)

                    }
                })
            }
            else {
                // queue.push($(event.target).attr('data-uri'))
                // updateq()
                // if (!playing) {
                //     playall()
                // }
            }
            return
        })
        // console.log(d)
        let table = $("<table>").addClass("table").addClass('table-striped')
        let tbody = $("<tbody>")
        table.append(tbody)
        for (let el of d) {
            if (!el.directory) {
                let tr = $("<tr>")
                tbody.append(tr)
                let td = $("<td>")
                tr.append(td)
                td.addClass("music")
                // let a = $("<a>")
                // td.append(a)
                // a.attr("href", el.name)
                a = td
                a.text(decodeURIComponent(el.name))
                a.attr("data-url", el.name)
                // td.on("click", async function (e) {
                //     td.trigger('add', [{ url: $(e.target).attr("data-url") }])
                // })
                td.on('add', async (e, p) => {
                    queue.push(p.url)
                    updateq()
                    if (!playing) {
                        playall()
                    }
                    return
                })
            }
        }
        // $("div.music").append(table)

        // getExif()
        // console.log(d)
    }
    async function loadpictures() {
        let d, table, tbody
        d = await callit('Pictures/')
        table = $("<table>").addClass("table").addClass('table-striped')
        tbody = $("<tbody>")
        table.append(tbody)
        let i = 0
        let tr
        for (let el of d) {
            if (!el.directory && ["PNG", "JPEG", "JPG"].indexOf(el.name.toUpperCase().split(".").reverse()[0]) != -1) {
                if (i % 5 == 0) {
                    tr = $("<tr>")
                    tbody.append(tr)
                }
                ++i
                let td = $("<td>")
                tr.append(td)
                let img = $("<img>")
                td.append(img)
                img.attr("src", el.name)
                img.attr("class", "thumbnail")
                // getdate(img,td)
                td.on("click", async function (e) {
                    let tags = await gettags(e.target)
                    let img = $("<img>").attr("src", $(e.target).attr("src")).attr("width", "500px")
                    $('#myModal div.modal-body').empty().append(img)
                    $('#myModal div.modal-content').css("width", "600px")
                    $('#myModal div.modal-body').append($("<div>").text(tags["DateTimeOriginal"]))
                    $('#myModal div.modal-body').append($("<div>").text(`width: ${tags["ImageWidth"]}; height:${tags["ImageHeight"]};`))
                    $('#myModal div.modal-body').append($("<div>").text(`make: ${tags["Make"]}; model:${tags["Model"]};`))
                    $('#myModal h5.modal-title').text(decodeURIComponent($("img", e.currentTarget).attr("src")))
                    $('#myModal').modal('show')
                    // window.open(e.target.src)
                })
            }
        }
        $("div.pictures").append(table)
    }
    async function load() {
        await process('Music/')
        // await loadpictures()
    }
    load()
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
            let img = $(selector)[0]
            EXIF.getData(img, function () {
                resolve(EXIF.getAllTags(this))
            });
        })
    }
    function getExif() {
        let img1 = document.getElementById("img1");
        let img = $("img[src='Pictures/MorePhotos/20151018_230904.jpg']")[0]
        gettags("img[src='Pictures/MorePhotos/20151018_230904.jpg']").then(function (tags) {
            console.log(tags)
        })
        gettags("#img1").then(function (tags) {
            console.log(tags)
        })
        gettags("#img4").then(function (tags) {
            console.log(tags)
        })
        EXIF.getData(img, function () {
            let tags = EXIF.getAllTags(this)
            console.log(tags)
        });
        if (false) {

            EXIF.getData(img1, function () {
                let tags = EXIF.getAllTags(this)
                console.log(tags)

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
        $("div.music").css("display") == 'none' ? $("div.music").show() : $("div.music").hide()
    })
    $("a.dropdown-item.music").on("click", function (e) {
        $("div.music").css("display") == 'none' ? $("div.music").show() : $("div.music").hide()

    })
    $("a.dropdown-item.pictures").on("click", function (e) {
        $("div.pictures").css("display") == 'none' ? $("div.pictures").show() : $("div.pictures").hide()

    })
    $("button.pictures").on("click", function (e) {
        $("div.pictures").css("display") == 'none' ? $("div.pictures").show() : $("div.pictures").hide()

    })
    function status(message) {
        $("#status").text(message)
    }
    function resize() {
        let height = $("body").height() - $(".navbartop").height() - $(".navbarbottom").height() - 50
        $("div.container-main").css('max-height', height)
        $("div.container-main").css('height', height)
        $("div.musicqueue").css('max-height', height)
        $("div.music").css('max-height', height)
        $("div.musiccontainer").css('max-height', height)
    }
    resize()
    $(window).on('resize', resize)
})