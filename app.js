let vm = Vue.createApp({
    data() {
        return {
            input: '',
            msg: '',
            showMsg: false,
        }
    },
    computed: {
        compiledMarkdown: function() {
            return marked(this.input, { sanitize: true })
        }
    },
    methods: {
        update: _.debounce(function(e) {
            this.input = e.target.value;
        }, 300),

        // save our input to a file and download it using js. No backend required!
        download: function() {
            let fileName = prompt('Save file name as:', "Document")
            if (fileName == null || fileName.trim() == '') {
                console.log('Save cancelled')
            } else {
                let text = this.input.replace(/\n/g, '\r\n') // retain line breaks
                const blob = new Blob([text], { type: 'text/plain' })
                const anchor = document.createElement('a')
                anchor.download = fileName + '.md'
                anchor.href = window.URL.createObjectURL(blob)
                anchor.target = '_blank'
                anchor.style.display = 'none' // safety!
                document.body.appendChild(anchor)
                anchor.click()
                document.body.removeChild(anchor)    
            }
        },

        showMessage: function(message) {
            this.msg = message
            this.showMsg = true
            setTimeout(() => {
                this.showMsg = false
            }, 2000)
        },

        copy: function() {
            const el = document.createElement('textarea')

            el.setAttribute('readonly', '')
            el.style.position = 'absolute'
            el.style.left = '-9999px'
            el.value = this.input

            document.body.appendChild(el)
            el.select()
            document.execCommand('copy')
            document.body.removeChild(el)

            this.showMessage('Copied to Clipboard!')
        },

        clear: function() {
            if (confirm("Clear the document?")) {
                this.input = ''
                document.getElementById('text').focus()

                this.showMessage('Cleared the document!')
            }
        },

        addStyle: function(style) {
            let txtarea = document.getElementById('text')
            let pos = txtarea.selectionStart
            let end = txtarea.selectionEnd
            // round up for single characters such as blockquote '>' so the focus doesn't position backwards
            let mid = Math.ceil(style.length / 2)

            // insert the markdown style where the cursor is set and focus so we can resume typing
            this.input = this.input.slice(0, pos) + style + this.input.slice(pos);
            txtarea.focus()
            
            // without setTimeout the selectionEnd triggers on the callstack before the render
            setTimeout(function() {
                txtarea.selectionEnd = end + mid
            }, 0)
        },
    },
    mounted() {
        // highlights our code block markdown on render
        // these options are documented in the markedjs docs
        marked.setOptions({
            renderer: new marked.Renderer(),
            highlight: function(code) {
                return hljs.highlightAuto(code).value
            },
            pedantic: false,
            gfm: true,
            tables: true,
            breaks: false,
            sanitize: true,
            smartLists: true,
            smartypants: false,
            xhtml: false
        })
        this.code = marked(this.input)
        this.input = '# Hello!\n```javascript\nfunction(){\n\tconsole.log(123)\n}\n```'
    },
}).mount('#app');