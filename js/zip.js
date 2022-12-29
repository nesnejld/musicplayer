class Zip {
    queue = [];
    results = [];
    processing = false;
    constructor(listener) {
        this.listener = listener;
    }
    async zip(filelist) {
        let filelist64 = { filelist: btoa(JSON.stringify(filelist)) };
        return $.get("/cgi-bin/scripts/zip.sh", filelist64).then(function (html) {
            console.log(html);
            return html;
        });
    }
    add(filelist) {
        this.queue.push(filelist);
        if (!this.processing) {
            this.process();
        }
    }
    async process() {
        if (!this.processing) {
            this.processing = true;
            while (this.queue.length > 0) {
                let next = this.queue.shift();
                this.results.push({ name: next, html: await this.zip(next) });
            }
            this.processing = false;
            this.listener.trigger('zip.done');
        }
    }
}