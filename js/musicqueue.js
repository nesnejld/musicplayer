class MusicQueue {
    queue = [];
    playing = false;
    audio = null;
    status = null;
    statustop = null;
    musicdirectory = null;
    constructor(div, status, statustop) {
        this.status = status;
        this.statustop = statustop;
        this.div = div;
        this.newaudio();
        // this.audio = new Audio();
        // this.audio.controls = true;
        // div.empty().append(this.audio);
        // let span = $(`<span style="color:white"><a class="btn btn-lg stop" href="#"> <i class="fa fa-stop-circle" style="color:white" aria-hidden="true"></i>Stop</a></span>`);
        // div.append(span);
        this.musicdirectory = div.attr('musicdirectory');
    }
    moveup(event) {
        let queue = this.queue;
        let q = $(event.target).closest('[data-uri]').attr('data-uri');
        let i = queue.indexOf(q);
        if (i > 0) {
            let qq = queue.splice(i, 1)[0];
            queue.splice(i - 1, 0, qq);
            this.updateq();
        }
        event.stopPropagation();
    }
    movetotop(event) {
        let queue = this.queue;
        let q = $(event.target).closest('[data-uri]').attr('data-uri');
        let i = queue.indexOf(q);
        let qq = queue.splice(i, 1)[0];
        queue.splice(0, 0, qq);
        this.updateq();
        event.stopPropagation();
    }
    movedown(event) {
        let queue = this.queue;
        let q = $(event.target).closest('[data-uri]').attr('data-uri');
        let i = queue.indexOf(q);
        if (i != queue.length - 1) {
            let qq = queue.splice(i, 1)[0];
            queue.splice(i + 1, 0, qq);
            this.updateq();
        }
        event.stopPropagation();
    }
    remove(event) {
        let queue = this.queue;
        let q = $(event.target).closest('[data-uri]').attr('data-uri');
        let i = queue.indexOf(q);
        queue.splice(i, 1);
        this.updateq();
        this.statustop(`${this.queue.length} queued.`);
        event.stopPropagation();
    }
    stop(audio) {
        audio.currentTime = audio.duration;
    }
    async playall() {
        this.playing = true;
        let queue = this.queue;
        while (queue.length > 0) {
            let url = queue.shift();
            // this.statustop(`Playing ${decodeURIComponent(url)}`);
            this.updateq();
            this.statustop(`${this.queue.length} queued.`);
            await this.play(url);
        }
        this.playing = false;
    }
    newaudio(url) {
        this.audio = url ? new Audio(url) : new Audio();
        this.audio.controls = true;
        let audio = this.audio;
        this.div.empty().append(this.audio);
        let span = $(`<span style="color:white"><a class="btn btn-lg stop" href="#"> <i class="fa fa-stop-circle" style="color:white" aria-hidden="true"></i>Stop</a></span>`);
        this.div.append(span);
        span.on("click", () => { this.stop(audio); });
        return audio;
    }
    updateq() {
        let queue = this.queue;
        $("ul.dropdown-menu.music").empty();
        queue.forEach(function (q) {
            let li, button, span;
            li = $("<li>").attr("href", "#").addClass("dropdown-item music").attr("data-uri", q);// .text(decodeURIComponent(q))
            ///
            button = $("<a>").addClass("btn btn-sm btn-default");
            button.on("click", this.movetotop.bind(this));
            span = $("<span>").addClass("fa fa-play");
            li.append(button.append(span));
            ///
            button = $("<a>").addClass("btn btn-sm btn-default");
            button.on("click", this.moveup.bind(this));
            span = $("<span>").addClass("fa fa-long-arrow-up");
            li.append(button.append(span));
            //
            button = $("<a>").addClass("btn btn-sm btn-default");
            button.on("click", this.movedown.bind(this));
            span = $("<span>").addClass("fa fa-long-arrow-down");
            li.append(button.append(span));
            //
            button = $("<a>").addClass("btn btn-sm btn-default");
            button.on("click", this.remove.bind(this));
            span = $("<span>").addClass("fa fa-remove");
            li.append(button.append(span));
            li.append($("<span>").text(decodeURIComponent(q).replace(/\/$/, '')));
            $("ul.dropdown-menu.music").append(li);
        }.bind(this));
        $("div.musicqueue").empty();
        let table = $("<table>").addClass("musicqueue table text-nowrap table-primary");
        $("div.musicqueue").append(table);
        let thead = $("<thead>");
        table.append(thead);
        let tr = $("<tr>");
        thead.append(tr);
        tr.append($("<th>").text("#"));
        tr.append($("<th>").text("controls"));
        tr.append($("<th>").text("Artist"));
        tr.append($("<th>").text("Album"));
        tr.append($("<th>").text("Song"));
        let tbody = $("<tbody>");
        table.append(tbody);
        let n = 0;
        queue.forEach(function (q) {
            let button, span, td;
            let tr = $("<tr>");
            tbody.append(tr);
            ++n;
            tr.append($("<td>").text(`${n}`));
            //
            td = $("<td>").attr("data-uri", q);
            //
            button = $("<a>").addClass("btn btn-sm btn-default");
            button.on("click", this.movetotop.bind(this));
            span = $("<span>").addClass("fa fa-play");
            button.attr({
                'data-bs-toggle': 'tooltip',
                'data-bs-placement': 'top', 'title': 'Play next'
            });
            td.append(button.append(span));
            ///
            button = $("<a>").addClass("btn btn-sm btn-default");
            button.on("click", this.moveup.bind(this));
            span = $("<span>").addClass("fa fa-long-arrow-up");
            button.attr({
                'data-bs-toggle': 'tooltip',
                'data-bs-placement': 'top', 'title': 'Move up'
            });
            td.append(button.append(span));
            //
            button = $("<a>").addClass("btn btn-sm btn-default");
            button.on("click", this.movedown.bind(this));
            span = $("<span>").addClass("fa fa-long-arrow-down");
            button.attr({
                'data-bs-toggle': 'tooltip',
                'data-bs-placement': 'top', 'title': 'Move down'
            });
            td.append(button.append(span));
            //
            button = $("<a>").addClass("btn btn-sm btn-default");
            button.on("click", this.remove.bind(this));
            span = $("<span>").addClass("fa fa-remove");
            button.attr({
                'data-bs-toggle': 'tooltip',
                'data-bs-placement': 'top', 'title': 'Remove'
            });
            td.append(button.append(span));
            tr.append(td);
            let parts = decodeURIComponent(q).replace(/\/$/, '').split('/');
            parts.shift();
            for (let p of parts) {
                tr.append($("<td>").append("<span>").text(p));
            }
        }.bind(this));
    }
    playallchildren(event) {
        let el = $(event.target).parent();
        let list = $("li[data-leaf='true']", el);
        for (let e of list) {
            this.queue.push($(e).attr('data-uri'));
        }
        this.updateq();
        if (!this.playing) {
            this.playall();
        }
        this.statustop(`Added ${list.length} songs to the queue. ${this.queue.length} queued.`);
        event.stopPropagation();
    }
    play(url) {
        this.status(`Playing ${decodeURIComponent(url)}`);
        let audio = this.newaudio(url);
        audio.play();
        // this.audio = new Audio(url);
        // this.audio.controls = true;
        // let audio = this.audio;
        // this.div.empty().append(this.audio);
        // let span = $(`<span style="color:white"><a class="btn btn-lg stop" href="#"> <i class="fa fa-stop-circle" style="color:white" aria-hidden="true"></i>Stop</a></span>`);
        // this.div.append(span);
        // span.on("click", () => { this.stop(audio); });
        // audio.play();
        return new Promise(resolve => {
            audio.addEventListener('ended', d => {
                resolve();
            });
        });
    }
    add(event) {
        this.queue.push($(event.target).parent().attr('data-uri'));
        this.updateq();
        if (!this.playing) {
            this.playall();
        }
        this.statustop(`Added 1 song to the queue. ${this.queue.length} queued.`);
    }
}