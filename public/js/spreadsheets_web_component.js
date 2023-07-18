let template_t = document.createElement("template")

template_t.innerHTML = `
    <style>
        * {
            z-index: 9000;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-size: 16px;
        }
        
          table {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        
          table, td, th, tr {
            border: 1px solid rgba(197, 197, 197, 0.486) !important;
            font-size: 16px;
            height: 18px;
            border-spacing: 0px;
        }
        
          th {
            font-weight: 600;
        }
        
          thead {
            /* background-color: rgb(160, 180, 206); */
            background-color: #f1f1f1;
            /* color: #fff; */
        }
        
          td {
            min-width: 120px;
            /* padding: 0.2rem 0.5rem; */
        }
        
          th {
            padding: 0.2rem 0.4rem;
        }
        
          th>.dropdown {
            float: right;
        }
        
          tbody th {
            min-width: 5rem;
            background: #fafafa;
        }
        
        
          .dropbtn {
            background-color: #e2e2e2d0;
            color: rgba(0, 0, 0, 0.5);
            padding: 0rem 0.3rem;
            /* /* font-size: 1.2rem; */
            border: none !important;
            border-radius: 4px;
            cursor: pointer;
            transition: ease 0.4s;
        }
        
          .column-header .dropbtn {
            margin-left: -30px;
        }
        
          .row-header .dropbtn {
            margin-left: -25px;
        }
        
          .dropbtn:hover, .dropbtn:focus {
            background-color: #d0d0d0;
            /* visibility: visible; */
        }
        
          .dropbtn img {
            height: 2rem;
        }
        
          .dropdown {
            position: relative;
            display: inline-block;
        }
        
          .dropdown-content {
            display: none;
            position: absolute;
            background-color: white;
            min-width: 16rem;
            box-shadow: 0 0.5rem 0.8rem 0 rgba(0, 0, 0, 0.1);
            z-index: 1;
        }
        
          .column-header .dropdown-content {
            margin-left: -20px;
        }
        
          .row-header .dropdown-content {
            margin-left: -15px;
        }
        
          .dropdown-content p {
            color: #858484;
            padding: 0.4rem;
            font-weight: 400;
            text-decoration: none;
            display: block;
        }
        
          .dropdown-content p:hover {
            background-color: rgb(214, 214, 214);
            color: #5e5e5e;
        }
        
          .hide {
            display: none;
        }
        
          .show {
            display: block;
        }
        
          .column-header {
            cursor: pointer;
            min-width: 120px;
            background-color: #f8f9fa;
            border: 1px solid #d3d3d3 !important;
        }
        
          .row-header {
            cursor: pointer;
            min-width: 80px;
            background-color: #f8f9fa;
            border: 1px solid #d3d3d3 !important;
        }
        
          .spreadsheet-controls {
            margin-left: 0.5rem;
        }
        
          .column-header-span {
            /* display: inline-block; */
            text-align: center;
            min-width: 20px !important;
        }
        
        .drag-active-block {
            /* border: 2px solid rgb(0, 128, 202) !important;
            background: #d0e7f5 !important; */
        }

        .active-block {
            border: 2px solid rgb(0, 128, 202) !important;
            background: #d0e7f5 !important;
        }
        
          .active-block-hover {
            border: 2px solid rgb(0, 128, 202) !important;
        }
        
          .active-base {
            background: #d0e7f5 !important;
        }
        
          .active-l {
            border-left: 2px solid rgb(0, 128, 202) !important;
            padding-left: 3px;
        }
        
          .active-r {
            border-right: 2px solid rgb(0, 128, 202) !important;
            padding-right: 3px;
        }
        
          .active-t {
            border-top: 2px solid rgb(0, 128, 202) !important;
            padding-top: 3px;
        }
        
          .active-b {
            border-bottom: 2px solid rgb(0, 128, 202) !important;
            padding-bottom: 3px;
        }
        
          .editable-block {
            padding: 4px;
        }
        
          .editable-block.active-block {
            padding: 3px;
        }
        
          .editable-block.active-block-hover {
            padding: 3px;
        }
    </style>`;


class Spreadsheet extends HTMLElement {
    constructor(row = 10, col = 10) {
        super();

        // this.html = this

        console.log({ shadow: document })
        this.shadow = this.attachShadow({
            mode: 'open'
        });

        this.document = this;
        let styles = template_t.content.cloneNode(true);
        this.shadow.appendChild(styles)

        // this.html = this
        this.html = document.createElement(`s-component`)

        if (this.html == null) {
            throw "Invalid Element"
        }

        this.row_count = row;
        this.col_count = col;

        this.data = []
        console.log("Initialised Spreadsheet")
        this.eventListeners = []

        this.dragmode = false;
        this.dragActive = null;
        // this.this_shadowRoot = document.querySelector('s-component').shadowRoot;
        this.this_shadowRoot = this.shadowRoot;

        this.createSpreadsheet()
        this.shadow.appendChild(this.html)
        // this.appendChild(this.styles)
        // this.appendChild(this.html)

        // this.element.append(this.html)
    }

    initialise() {
        for (let i = 0; i <= this.row_count; i++) {
            const child = [];
            for (let j = 0; j <= this.col_count; j++) {
                child.push("");
            }
            this.data.push(child);
        }
    }

    setData(data) {
        console.log(data)

        if (data.length > this.row_count) {
            this.row_count = data.length;
        }

        for (let i = 0; i < data.length; i++) {
            let cols = data[i]
            // jagged data
            if (cols.length > this.col_count) {
                this.col_count = cols.length
            }
        }
        this.data = []
        let child = [];
        for (let i = 0; i < this.row_count; i++) {

            child = []
            let cols;
            if (i < data.length) {
                cols = data[i];

                for (let j = 0; j < this.col_count; j++) {
                    if (j < cols.length) {
                        child.push(cols[j])
                    } else {
                        child.push("")
                    }
                }

            } else {
                for (let j = 0; j < this.col_count; j++) {
                    child.push("")
                }
            }

            this.data.push(child)
        }

        console.log({
            rows: this.row_count,
            cols: this.col_count,
            data: this.data
        })
        this.createSpreadsheet(false)
    }

    setDataFromCSV(csv) {
        csv = csv.trim().split("\n")
        let data = []

        if (csv.length > this.row_count) {
            this.row_count = csv.length
        }

        for (let i = 0; i < csv.length; i++) {
            let cols = csv[i].split(",")
            // jagged csv
            if (cols.length > this.col_count) {
                this.col_count = cols.length
            }
        }
        // let data = [];
        let child = [];
        for (let i = 0; i < this.row_count; i++) {

            child = []
            let cols;
            if (i < csv.length) {
                cols = csv[i].split(",");

                for (let j = 0; j < this.col_count; j++) {
                    if (j < cols.length) {
                        child.push(cols[j])
                    } else {
                        child.push("")
                    }
                }

            } else {
                for (let j = 0; j < this.col_count; j++) {
                    child.push("")
                }
            }

            data.push(child)
        }

        this.data = data;
        console.log({
            rows: this.row_count,
            cols: this.col_count,
            data: this.data
        })
        this.createSpreadsheet(false)
    }

    saveState() {
        let data = []
        let child = []

        for (let i = 1; i <= this.row_count; i++) {
            child = []
            for (let j = 1; j <= this.col_count; j++) {
                let id = `r-${i}-${j}`
                let e = this.this_shadowRoot.getElementById(id);
                // child.push(e.innerText.trim().replace(/\n/g, ""))
                child.push(e.innerHTML.trim().replace(/\<br\>/g, ""))
            }
            data.push(child)
        }
        console.log({ data })

        this.data = data
    }

    getData() {
        this.saveState();

        return this.data;
    }

    downloadDataAsCsv(name = "file") {
        this.saveState()

        let csv = "";

        for (let i = 0; i < this.data.length; i++) {
            let row = this.data[i];
            for (let j = 0; j < row.length; j++) {
                csv += `${row[j]}`
                if (j < row.length - 1) {
                    csv += ","
                }
            }
            csv += "\n";
        }

        let hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = `${name}.csv`;
        hiddenElement.click();
    }

    getCsvData() { }

    createSpreadsheet(create_as_empty_mode = true) {
        let this_bind = this;
        this.cleanRemove()
        this.table = document.createElement("table");

        const abc = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");

        for (let i = 0; i <= this.row_count; i++) {

            let tr = document.createElement("tr")
            tr.setAttribute("id", `r-${i}`);
            tr.setAttribute("class", "table-r")

            for (let j = 0; j <= this.col_count; j++) {
                if (i == 0) {
                    // header
                    let th = document.createElement("th")
                    // h-row-col
                    th.setAttribute("id", `h-${i}-${j}`)
                    th.setAttribute("class", `${j === 0 ? "uniblock" : "column-header"} row-${i} col-${j}`);

                    const span = document.createElement("span");


                    const dropDownDiv = this.createDropdown("col", j)

                    span.setAttribute("class", "column-sp column-header-span");

                    if (j > 0) {
                        if (j <= abc.length) {
                            span.innerHTML = `${abc[j - 1]}`;
                        } else {
                            span.innerHTML = `${abc[(j - 1) % 26]}${Math.floor((j - 1) / 26)}`
                        }
                        th.appendChild(dropDownDiv);
                        th.appendChild(span)

                    }


                    if (j > 0) {

                        th.addEventListener("dblclick", function (e) {

                            this_bind.focusColumn(e, `.col-${j}`)

                        })
                    }

                    th.addEventListener("mouseover", function (e) {
                        this_bind.removeHoverFocus();

                    })

                    th.addEventListener("mouseenter", function (e) {
                        this_bind.closeAllDropdowns()
                        dropDownDiv.children[0].classList.add("show")
                        dropDownDiv.children[0].classList.remove("hide")

                    })

                    th.addEventListener("mouseleave", function (e) {
                        this_bind.closeAllDropdowns()
                        dropDownDiv.children[0].classList.add("hide")
                        dropDownDiv.children[0].classList.remove("show")

                    })

                    tr.appendChild(th)

                } else {

                    const cell = document.createElement(`${j === 0 ? "th" : "td"}`);
                    cell.setAttribute("id", `r-${i}-${j}`);
                    if (j == 0) {
                        //create row header block
                        cell.contentEditable = false;
                        cell.setAttribute("class", `row-header row-${i} col-${j}`)

                        const span = document.createElement("span");
                        span.setAttribute("class", `row-sp row-header-span`);

                        const dropDownDiv = this.createDropdown("row", i);
                        span.innerHTML += `${i}`;

                        cell.appendChild(span);
                        cell.appendChild(dropDownDiv);

                        cell.addEventListener("mouseover", function (e) {
                            this_bind.removeHoverFocus();

                        })

                        cell.addEventListener("mouseenter", function (e) {
                            this_bind.closeAllDropdowns()
                            dropDownDiv.children[0].classList.add("show")
                            dropDownDiv.children[0].classList.remove("hide")

                        })

                        cell.addEventListener("mouseleave", function (e) {
                            this_bind.closeAllDropdowns()
                            dropDownDiv.children[0].classList.add("hide")
                            dropDownDiv.children[0].classList.remove("show")

                        })

                        cell.addEventListener("dblclick", function (e) {

                            this_bind.focusRow(e, `.row-${i}`)

                        })


                    } else {
                        //create data blocks
                        cell.contentEditable = true;
                        if (!create_as_empty_mode)
                            cell.innerText = this.data[i - 1][j - 1];
                        cell.setAttribute("class", `editable-block row-${i} col-${j}`)

                        cell.addEventListener("click", function (e) {
                            this_bind.focusBlock({ target: e.target })
                        })

                        cell.addEventListener("mouseover", function (e) {
                            this_bind.focusHoverBlock(e)
                        })

                        cell.addEventListener("dblclick", function (e) {
                            console.log("double click", e)
                        })
                    }

                    tr.appendChild(cell)
                }
            }
            this.table.appendChild(tr)

        }

        this.html.appendChild(this.table)

        this.addEventActionListener()
    }

    addRow = (currentRow, direction) => {
        this.saveState();
        let data = this.data;

        const newRow = new Array(this.col_count).fill("");
        if (direction === "top") {
            data.splice(currentRow - 1, 0, newRow);
        } else if (direction === "bottom") {
            data.splice(currentRow, 0, newRow);
        }
        this.row_count++;
        this.data = data;
        this.createSpreadsheet(false);
    };

    deleteRow(currentRow) {
        this.saveState()
        let data = this.data;
        data.splice(currentRow - 1, 1);
        this.row_count--;
        this.data = data;
        this.createSpreadsheet(false);
    }

    addCol(currentCol, direction) {
        this.saveState()
        let data = this.data;
        for (let i = 0; i < this.row_count; i++) {
            if (direction === "left") {
                data[i].splice(currentCol - 1, 0, "");
            } else if (direction === "right") {
                data[i].splice(currentCol, 0, "");
            }
        }
        this.col_count++;
        this.data = data;
        this.createSpreadsheet(false);
    };

    deleteCol(currentCol) {
        this.saveState();
        let data = this.data;
        for (let i = 0; i < this.row_count; i++) {
            data[i].splice(currentCol - 1, 1);
        }
        this.col_count--;
        this.data = data;
        this.createSpreadsheet(false);
    }

    focusBlock(ele) {

        console.log({ ele })

        let q = "." + ele.target.classList[1] + "." + ele.target.classList[2];
        let b = this.this_shadowRoot.querySelector(q).focus();
        // b;

        this.removeFocus()
        ele.target.classList.toggle("active-block")
        console.log({ focus: ele })
        this.focused = true;
        this.focusedBlock = ele;
    }

    focusHoverBlock(ele) {


        this.removeHoverFocus()
        ele.target.classList.toggle("active-block-hover")

        this.hoverFocused = true;
        this.hoverBlock = ele;
    }

    focusColumn(ele, col) {
        this.removeFocus();
        this.focused = true;
        this.focusedCol = col;
        let c = this.this_shadowRoot.querySelectorAll(col);

        for (let i = 0; i < c.length; i++) {
            if (i == 0) {
                c[i].classList.add("active-base", "active-l", "active-r", "active-t")
            } else if (c.length - 1 == i) {
                c[i].classList.add("active-base", "active-l", "active-r", "active-b")
            } else {
                c[i].classList.add("active-base", "active-l", "active-r")
            }
        }
    }

    focusRow(ele, row) {
        this.removeFocus();
        this.focused = true;
        this.focusedRow = row;
        let c = this.this_shadowRoot.querySelectorAll(row);
        for (let i = 0; i < c.length; i++) {
            if (i == 0) {
                c[i].classList.add("active-base", "active-t", "active-b", "active-l")
            } else if (c.length - 1 == i) {
                c[i].classList.add("active-base", "active-t", "active-b", "active-r")
            } else {
                c[i].classList.add("active-base", "active-t", "active-b")
            }
        }
    }

    getFocusedRowDataAsNum() {
        if (this.focused) {
            let data = [];
            if (this.focusedRow != null) {
                let q = this.this_shadowRoot.querySelectorAll(this.focusedRow);

                q.forEach((e) => {

                    console.log(e);
                    if (e.classList.contains("editable-block")) {

                        let dt = e.innerText.trim().replace(/\n/g, "")
                        if (!isNaN(dt)) {
                            data.push(parseInt(dt))
                        } else {
                            data.push("")
                        }
                    }
                })
            }
            return data
        }

        return false
    }

    getFocusedColDataAsNum() {
        if (this.focused) {
            let data = [];
            if (this.focusedCol != null) {
                let q = this.this_shadowRoot.querySelectorAll(this.focusedCol)

                q.forEach((e) => {
                    console.log(e);
                    if (e.classList.contains("editable-block")) {
                        let dt = e.innerText.trim().replace(/\n/g, "")
                        if (!isNaN(dt)) {
                            data.push(parseInt(dt))
                        } else {
                            data.push("")
                        }
                    }
                })
            }
            return data
        }

        return false
    }

    removeFocus() {
        this.focused = false;
        this.focusedRow = null;
        this.focusedCol = null;
        this.focusedBlock = null;
        let active_block = this.this_shadowRoot.querySelectorAll(".active-block")

        if (active_block.length > 0) {
            for (let i = 0; i < active_block.length; i++) {
                active_block[i].classList.remove("active-block")
            }
        }

        let active_base = this.this_shadowRoot.querySelectorAll(".active-base")

        if (active_base.length > 0) {
            for (let i = 0; i < active_base.length; i++) {
                active_base[i].classList.remove("active-base")
                active_base[i].classList.remove("active-l")
                active_base[i].classList.remove("active-r")
                active_base[i].classList.remove("active-t")
                active_base[i].classList.remove("active-b")
            }
        }
    }

    removeHoverFocus() {
        this.hoverFocused = false
        let active_block = this.this_shadowRoot.querySelectorAll(".active-block-hover")

        if (active_block.length > 0) {
            for (let i = 0; i < active_block.length; i++) {
                active_block[i].classList.remove("active-block-hover")
            }
        }
    }

    removeDragFocus() {
        this.dragActive = null
        this.dragmode = false
        let active_block = this.this_shadowRoot.querySelectorAll(".drag-active-block")

        if (active_block.length > 0) {
            for (let i = 0; i < active_block.length; i++) {
                active_block[i].classList.remove("active-block-hover")
            }
        }
    }

    setDragFocus(start, end) {

        this.removeDragFocus()

        let active_block = this.this_shadowRoot.querySelectorAll(".active-block-hover")

        if (active_block.length > 0) {
            for (let i = 0; i < active_block.length; i++) {
                active_block[i].classList.remove("active-block-hover")
            }
        }
    }

    closeAllDropdowns() {
        let a = this.this_shadowRoot.querySelectorAll(".dropdown-content.show")

        if (a.length > 0) {
            for (let i = 0; i < a.length; i++) {
                a[i].classList.remove("show")
                a[i].classList.add("hide")
            }
        }
    }


    createDropdown(type = "col", index = 0) {
        let this_bind = this
        let div = document.createElement("div")
        div.classList.add("dropdown")

        let toggler = document.createElement("button")

        let div_content = document.createElement("div")
        div_content.setAttribute("class", "dropdown-content")
        let p1 = document.createElement("p");
        let p2 = document.createElement("p");
        let p3 = document.createElement("p");

        if (type == "col") {
            toggler.classList.add("col-drop", "dropbtn", "hide")
            toggler.innerHTML = "▼";
            p1.innerHTML = "Insert 1 column left"
            p1.setAttribute("class", "col-insert-left")

            p2.innerHTML = "Insert 1 column right"
            p2.setAttribute("class", "col-insert-right")

            p3.innerHTML = "Delete column"
            p2.setAttribute("class", "col-delete")

        } else if (type == "row") {
            toggler.classList.add("row-drop", "dropbtn", "hide")
            toggler.innerHTML = "▶";

            p1.innerHTML = "Insert 1 row above"
            p1.setAttribute("class", "row-insert-top")

            p2.innerHTML = "Insert 1 row below"
            p2.setAttribute("class", "row-insert-bottom")

            p3.innerHTML = "Delete row"
            p2.setAttribute("class", "row-delete")
        }
        p1.addEventListener("click", function (e) {
            // console.log(e)
            if (type == "row") {
                this_bind.addRow(index, "top")
            } else {
                this_bind.addCol(index, "left")
            }
        })

        p2.addEventListener("click", function (e) {
            // console.log(e)
            if (type == "row") {
                this_bind.addRow(index, "bottom")
            } else {
                this_bind.addCol(index, "right")
            }
        })

        p3.addEventListener("click", function (e) {
            // console.log(e)
            if (type == "row") {
                this_bind.deleteRow(index)
            } else {
                this_bind.deleteCol(index)
            }
        })

        div_content.appendChild(p1)
        div_content.appendChild(p2)
        div_content.appendChild(p3)

        div.appendChild(toggler)
        div.appendChild(div_content)

        toggler.addEventListener("click", function (e) {
            // console.log("clicked");
            this_bind.closeAllDropdowns();
            div_content.classList.add("show");

        });
        return div
    }


    addEventActionListener() {
        let this_bind = this;
        this.table.addEventListener("keydown", function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                return false
            } else if (event.keyCode === 38) {
                window.getSelection().removeAllRanges();
                event.preventDefault();

                if (this_bind.focused && this_bind.focusedBlock) {

                    let target = (this_bind.focusedBlock.target != null) ? this_bind.focusedBlock.target : this_bind.focusedBlock.originalTarget;
                    console.log({ class_list_842: target.classList })
                    let row = target.classList[1];
                    let col = target.classList[2];

                    let r = parseInt(row.split("-")[1])

                    console.log(r)
                    if (r > 1 && r <= this_bind.row_count) {
                        r--;
                    }
                    let q = { target: this_bind.this_shadowRoot.querySelector(`.row-${r}.${col}`) }
                    this_bind.focusBlock(q)

                }
                return false
            } else if (event.keyCode === 40) {
                window.getSelection().removeAllRanges();
                event.preventDefault();

                if (this_bind.focused && this_bind.focusedBlock) {

                    let target = (this_bind.focusedBlock.target != null) ? this_bind.focusedBlock.target : this_bind.focusedBlock.originalTarget;
                    console.log({ class_list_862: target.classList })
                    let row = target.classList[1];
                    let col = target.classList[2];

                    let r = parseInt(row.split("-")[1])

                    console.log(r)

                    if (r > 0 && r < this_bind.row_count) {
                        r++;
                    }
                    let q = { target: this_bind.this_shadowRoot.querySelector(`.row-${r}.${col}`) }
                    this_bind.focusBlock(q)

                }
                return false
            } else if (event.keyCode === 37) {
                if (this_bind.focused && this_bind.focusedBlock != null) {
                    let target = (this_bind.focusedBlock.target != null) ? this_bind.focusedBlock.target : this_bind.focusedBlock.originalTarget;
                    console.log({ class_list_883: target.classList })
                    let row = target.classList[1];
                    let col = target.classList[2];

                    let c = parseInt(col.split("-")[1])

                    if (c > 1 && c <= this_bind.col_count) {
                        c--;
                    }

                    // if (!document.activeElement.hasFocus()) {
                    window.getSelection().removeAllRanges();
                    let q = { target: this_bind.this_shadowRoot.querySelector(`.${row}.col-${c}`) }
                    this_bind.focusBlock(q)
                }
            } else if (event.keyCode === 39) {

                if (this_bind.focused && this_bind.focusedBlock != null) {
                    console.log({ element_focus_39: this_bind.focusedBlock })

                    let target = (this_bind.focusedBlock.target != null) ? this_bind.focusedBlock.target : this_bind.focusedBlock.originalTarget;
                    console.log({ class_list_896: target.classList })
                    let row = target.classList[1];
                    let col = target.classList[2];

                    let c = parseInt(col.split("-")[1])

                    console.log(c)
                    if (c > 0 && c < this_bind.col_count) {
                        c++;
                    }
                    // if (document.activeElement.classList.contains("active-block")) {
                    window.getSelection().removeAllRanges();
                    let q = { target: this_bind.this_shadowRoot.querySelector(`.${row}.col-${c}`) }
                    console.log({ q })
                    this_bind.focusBlock(q)
                }
            } else if (event.keyCode === 46) {

                if (this_bind.focused) {

                    console.log(this_bind.focusedCol, this_bind.focusedCol)


                    if (this_bind.focusedBlock != null) {
                        this_bind.focusedBlock.target.innerText = ""
                        // this_bind.focusedBlock.focus();
                    }

                    if (this_bind.focusedRow != null) {
                        console.log(this.this_shadowRoot.querySelectorAll(this_bind.focusedRow))
                        this.this_shadowRoot.querySelectorAll(this_bind.focusedRow).forEach(function (e) {
                            if (e.classList.contains("editable-block")) {
                                e.innerText = ""
                            }
                        })
                    }

                    if (this_bind.focusedCol != null) {
                        this.this_shadowRoot.querySelectorAll(this_bind.focusedCol).forEach(function (e) {
                            if (e.classList.contains("editable-block")) {
                                e.innerText = ""
                            }
                        })
                    }
                }

            } else if (event.keyCode == 66 &&
                (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) {

                event.preventDefault();
                document.execCommand("bold")
            } else if (event.keyCode == 73 &&
                (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) {

                event.preventDefault();
                document.execCommand("italic")
            } else if (event.keyCode == 85 &&
                (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) {

                event.preventDefault();
                document.execCommand("underline")
            } else if ((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 48 && event.keyCode <= 57)) {
                if (this_bind.focused && this_bind.focusedBlock != null) {
                    console.log(event.keyCode);


                    this_bind.focusedBlock.target.innerText += String.fromCharCode(event.keyCode)

                    event.preventDefault();
                }
            }
            else {
                console.log(event.keyCode);
                // event.preventDefault()
                if (this_bind.focused && this_bind.focusedBlock != null) {
                    console.log(this_bind.focusedBlock)
                }
            }
        });


        this.html.addEventListener("contextmenu", function (event) {
            window.getSelection().removeAllRanges();
            // event.preventDefault()
            return false;
        });

    }

    cleanRemove() {
        this.html.innerHTML += ""
        this.html.innerHTML = "";
    }

}


export default Spreadsheet;