try {

var Gantt = function () {
    var gantt = {};

    // チャートフィールドを作成
    gantt.fieldset = function (config) {
        var _gantt = document.getElementById(config.selector);

        // CONST NUMBERS
        gantt.WIDTH_HEADER = config.width.header;
        gantt.WIDTH_CELL = config.width.cell;
        gantt.WIDTH_CELL_WITH_BORDER = config.width.cell + config.width.border;
        gantt.WIDTH_RESIZE = config.width.resize;
        gantt.WIDTH_RESIZES = config.width.resize * 2;
        gantt.HEIGHT_CELL = config.height.cell;
        gantt.HEIGHT_CELL_HALF = Math.round(config.height.cell / 2);
        gantt.HEIGHT_CELL_WITH_BORDER = config.height.cell + config.width.border;
        gantt.OFFSET_CELL = -6;
        gantt.OFFSET_CELL_RESIZE = (config.width.border * -2) -6;
        gantt.FIELD_MAX_ROW = config.row.count;
        gantt.FIELD_MAX_COL = config.col + 1;
        gantt.BASE_ZINDEX = config.zindex.base;
        gantt.EVENT_RESIZABLE = config.resizable;
        gantt.EVENT_MOVABLE = config.movable;
        
        // field
        var field = document.createElement('table');
        {
            field.id = 'field';
            document.getElementById(config.selector).appendChild(field);
            field.setAttribute('cellSpacing', '0');
            field.setAttribute('cellPadding', '0');
            field.style.height = config.height.all + 'px';
            field.style.width = config.width.all + 'px';
        }

        // line
        for (i = 0; i < config.row.count; i++) {
            var tr = document.createElement('tr');
            tr.id = 'tr' + (i + 1);
            tr.style.height = gantt.HEIGHT_CELL + 'px';
            tr.setAttribute('line', (i + 1));
            field.appendChild(tr);
        }

        // header
        for (i = 0; i < config.row.count; i++) {
            var header = document.createElement('td');
            header.id = 'field-header' + (i + 1);
            header.classList.add('field-header');
            header.style.width = gantt.WIDTH_HEADER + 'px';
            header.innerText = config.row.list[i];
            document.getElementById('tr' + (i + 1)).appendChild(header);
        }

        // cells
        for (i = 0; i < config.row.count; i++) {
            var tr = document.getElementById('tr' + (i + 1));
            for (j = 0; j < config.col; j++) {
                var td = document.createElement('td');
                td.style.width = gantt.WIDTH_CELL + 'px';
                td.id = tr.id + '_td' + (j + 1);
                td.setAttribute('line', (i + 1));
                td.setAttribute('col', (j + 1));
                tr.appendChild(td);
            }
        }

        // border
        {
            field.style.border = [
                config.border.out.width + 'px',
                config.border.out.style,
                config.border.out.color].join(' ');
            var _q = config.time.start.quarter % 4;
            var trs = field.getElementsByTagName('tr');
            for (r = 0; r < trs.length; r++) {
                var tds = trs[r].getElementsByTagName('td');
                for (d = 0; d < tds.length; d++) {
                    tds[d].style.border = [
                        config.border.in.width + 'px',
                        config.border.in.style,
                        config.border.in.color].join(' ');
                    if ((_q + d) % 4 == 0) {
                        tds[d].style.borderRight = [
                            config.border.in.width + 'px',
                            config.border.in.style,
                            config.border.highlight.color].join(' ');
                    }
                }
            }
        }

        // event
        {
            if (gantt.EVENT_RESIZABLE) {
                field.addEventListener('mousemove', RightResizing, false);
                field.addEventListener('mouseup', RightResizeEnd, false);
            }
            if (gantt.EVENT_MOVABLE) {
                field.addEventListener('mousemove', Moving, false);
                field.addEventListener('mouseup', MoveEnd, false);
            }
            if (gantt.EVENT_RESIZABLE || gantt.EVENT_MOVABLE) {
                field.addEventListener('mouseup', Fixit, false);
            }
        }
    };

    // ボックスデータを読み込む
    gantt.set = function (data) {
        for (i = 0; i < data.count; i++) {
            var box = new BoxElem(data.list[i]);
            var _selectid = 'tr' + data.list[i].row + '_td' + data.list[i].colstart;
            var _start = document.getElementById(_selectid);
            _start.appendChild(box);
        }
    };

    // 外部定義関数を読み込む
    gantt.regist = function (events) {
        gantt.user_fixit = function () {};
        gantt.user_click = function () {};
        gantt.user_dblclick = function () {};
        gantt.user_mouseenter = function () {};
        if (events.fixit) {
            gantt.user_fixit = events.fixit;
        }
        if (events.click) {
            gantt.user_click = events.click;
        }
        if (events.dblclick) {
            gantt.user_dblclick = events.dblclick;
        }
        if (events.mouseenter) {
            gantt.user_mouseenter = events.mouseenter;
        }
    };

    // ボックスの作成関数
    var BoxElem = function (_data) {
        _data.__basewidth = BaseWidth(_data);
        var box = new BoxElemBase(_data);
        box.appendChild(new BoxElemLeft(_data));
        box.appendChild(new BoxElemMiddle(_data));
        box.appendChild(new BoxElemRight(_data));
        return box;
    };
    var BoxElemBase = function (_data) {
        var base = document.createElement('div');
        base.id = 'box' + _data.id;
        base.classList.add('box');
        base.classList.add('box-color');
        base.setAttribute('boxid', _data.id);
        base.setAttribute('num', _data.num);
        base.setAttribute('row', _data.row);
        base.setAttribute('label', _data.label);
        base.setAttribute('colstart', _data.colstart);
        base.setAttribute('colend', _data.colend);
        base.setAttribute('starttime', _data.time.start.join(':'));
        base.setAttribute('endtime', _data.time.end.join(':'));
        base.style.width = BaseWidth(_data, gantt.OFFSET_CELL);
        base.style.height = (gantt.HEIGHT_CELL - 4) + 'px';
        base.style.top = '0px';
        base.style.left = '0px';
        base.style.zIndex = gantt.BASE_ZINDEX + 5;
        base.addEventListener('mouseenter', ExternalDefineMouseEnter, false);
        return base;
    };
    var BoxElemLeft = function (_data) {
        var left = document.createElement('div');
        left.id = 'left' + _data.id;
        left.style.width = gantt.WIDTH_RESIZE + 'px';
        left.classList.add('resize');
        left.classList.add('resize-left');
        //if (gantt.EVENT_RESIZABLE) {
        //    left.addEventListener('mousedown', LeftResizeStart, false);
        //}
        return left;
    };
    var BoxElemRight = function (_data) {
        var right = document.createElement('div');
        right.id = 'right' + _data.id;
        right.style.width = gantt.WIDTH_RESIZE + 'px';
        right.classList.add('resize');
        right.classList.add('resize-right');
        if (gantt.EVENT_RESIZABLE) {
            right.addEventListener('mousedown', RightResizeStart, false);
        }
        return right;
    };
    var BoxElemMiddle = function (_data) {
        var middle = document.createElement('div');
        middle.id = 'middle' + _data.id;
        middle.classList.add('box-label');
        middle.classList.add('outer-invisible');
        middle.innerText = _data.label;
        middle.style.width = BaseWidth(_data, gantt.OFFSET_CELL_RESIZE);
        if (gantt.EVENT_MOVABLE) {
            middle.addEventListener('mousedown', MoveStart, false);
        }
        middle.addEventListener('click', ExternalDefineClick, false);
        middle.addEventListener('dblclick', ExternalDefineDblClick, false);
        return middle;
    };

    // 左側のリサイズ (制限中 動作が右側とずれるため)
    var LeftResizeStart = function (_event) { /* 制限中 */ };
    var LeftResizing    = function (_event) { /* 制限中 */ };
    var LeftResizeEnd   = function (_event) { /* 制限中 */ };

    // 右側のリサイズ
    var RightResizeStart = function (_event) {
        this.classList.add('resize-ing');
        var _box = this.parentNode;
        _box.setAttribute('point-x', _event.pageX);
        _box.setAttribute('basis-left', _box.offsetLeft);
        _box.setAttribute('basis-width', _box.style.width);
        _box.style.zIndex = gantt.BASE_ZINDEX + 10;
    };
    var RightResizing = function (_event) {
        var _resize = this.getElementsByClassName('resize-ing')[0];
        if (_resize) {
            var _box = _resize.parentNode;
            var _pointdiff = _event.pageX - _box.getAttribute('point-x');
            _box.style.width = parseInt(_box.getAttribute('basis-width'), 10) + _pointdiff + 'px';
        }
    };
    var RightResizeEnd = function (_event) {
        var _resize = this.getElementsByClassName('resize-ing')[0];
        if (_resize) {
            _resize.classList.remove('resize-ing');
            _resize.classList.add('pre-fix');
            _resize.parentNode.style.zIndex = gantt.BASE_ZINDEX + 0;
        }
    };

    // ボックスの移動
    var MoveStart = function (_event) {
        this.classList.add('move-ing');
        var _box = this.parentNode;
        _box.setAttribute('point-x', _event.pageX);
        _box.setAttribute('point-y', _event.pageY);
        _box.setAttribute('basis-x', this.offsetLeft);
        _box.setAttribute('basis-y', this.offsetTop);
        _box.setAttribute('basis-width', _box.style.width);
        _box.style.zIndex = gantt.BASE_ZINDEX + 10;
    };
    var Moving = function (_event) {
        var _move = this.getElementsByClassName('move-ing')[0];
        if (_move) {
            var _box = _move.parentNode;
            var _x = _event.pageX - _box.getAttribute('point-x');
            var _y = _event.pageY - _box.getAttribute('point-y');
            _box.style.left = _x + 'px';
            _box.style.top = _y + 'px';
        }
    };
    var MoveEnd = function (_event) {
        var _move = this.getElementsByClassName('move-ing')[0];
        if (_move) {
            _move.classList.remove('move-ing');
            _move.classList.add('pre-fix');
            var _box = _move.parentNode;
            _box.style.zIndex = gantt.BASE_ZINDEX + 0;
        }
    };

    // ボックスの更新 (表示固定)
    var Fixit = function (_event) {
        var _fix = this.getElementsByClassName('pre-fix')[0];
        if (_fix) {
            _fix.classList.remove('pre-fix');
            var _box = _fix.parentNode;

            // Boxの元々の設定値
            var _id = parseInt(_box.getAttribute('boxid'), 10);
            var _width = parseInt(_box.getAttribute('basis-width'), 10);
            var _inner = _box.children[1].innerHTML;
            var _row = parseInt(_box.getAttribute('row'), 10);
            var _label = _box.getAttribute('label');
            var _colstart = parseInt(_box.getAttribute('colstart'), 10);
            var _colend = parseInt(_box.getAttribute('colend'), 10);
            var _num = parseInt(_box.getAttribute('num'), 10);
            var _time = {
                start: _box.getAttribute('starttime').split(':').map(function (elem) { return parseInt(elem, 10); }),
                end: _box.getAttribute('endtime').split(':').map(function (elem) { return parseInt(elem, 10); }),
            };
            var _base = {
                id: _id,
                row: _row,
                colstart: _colstart,
                colend: _colend,
                label: _label,
                num: _num,
                time: { start: _time.start, end: _time.end },
            };

            // Boxの新しい設定値
            var __top = Math.round(parseInt(_box.style.top, 10) / gantt.HEIGHT_CELL_WITH_BORDER);
            var __left = Math.round(parseInt(_box.style.left, 10) / gantt.WIDTH_CELL_WITH_BORDER);
            var __resize = Math.round((parseInt(_box.style.width, 10) - _width) / gantt.WIDTH_CELL_WITH_BORDER);
            var __ts;
            var __te;
            {
                var __s = (_time.start[0] * 60 + _time.start[1]) + __left * 15;
                var __e = (_time.end[0] * 60 + _time.end[1]) + (__left + __resize) * 15;
                __ts = [Math.floor(__s / 60), Math.round((__s % 60) / 15) * 15];
                __te = [Math.floor(__e / 60), Math.round((__e % 60) / 15) * 15];
            }
            var _colony = {
                id: _id,
                row: _row + __top,
                colstart: _colstart + __left,
                colend: _colend + __left + __resize,
                label: _label,
                num: _num,
                time: { start: __ts, end: __te },
            };

            // 値調整
            if (_colony.colend < _colony.colstart) {
                _colony.colend = _colony.colstart;
            }

            if (CheckChange(_base, _colony) // 要素に変化があるか
                && CheckInner(_colony)// 要素が範囲内か
                && CheckOverlap(_colony)// 要素が他と重複していないか
            ) {
                _box.parentNode.removeChild(_box);
                var _newcell = document.getElementById('tr' + _colony.row + '_td' + _colony.colstart);
                var _newbox = BoxElem(_colony);
                _newbox.children[1].innerHTML = _inner;
                _newcell.appendChild(_newbox);
                ExternalDefineFixit(_colony);
            } else {
                // 変更をキャンセルする
                _box.style.top = '0px';
                _box.style.left = '0px';
                _box.style.width = _width + 'px';
            }
        }
    };

    // ボックスの更新Check
    var CheckChange = function (_base, _colony) {
        if (_base.row != _colony.row) return true;
        if (_base.colstart != _colony.colstart) return true;
        if (_base.colend != _colony.colend) return true;
        return false;
    };
    var CheckInner = function (_colony) {
        if (_colony.row < 1) return false;
        if (_colony.colstart < 1) return false;
        if (_colony.row > gantt.FIELD_MAX_ROW) return false;
        if (_colony.colend > gantt.FIELD_MAX_COL) return false;
        return true;
    };
    var CheckOverlap = function (_colony) {
        var _list = [];
        var _row = document.getElementById('tr' + _colony.row);
        var _cols = _row.children.length;
        // 更新対象以外
        for (var _idx = 1; _idx < _cols; _idx++) {
            var _col = _row.children[_idx];
            if (_col.hasChildNodes()) {
                var _box = _col.children[0];
                if (_box.getAttribute('boxid') == _colony.id) continue;
                var _s = parseInt(_box.getAttribute('colstart'), 10);
                var _e = parseInt(_box.getAttribute('colend'), 10);
                for (; _s < _e; _s++) {
                    _list.push(_s);
                }
            }
        }
        // 更新対象
        for (var _cs = _colony.colstart; _cs < _colony.colend; _cs++) {
            // 重複のCheck
            if (Includes(_list, _cs)) {
                return false;
            }
        }
        return true;
    };

    // 外部定義関数群
    var ExternalDefineDblClick = function (_event) {
        gantt.user_dblclick(this.parentNode);
    };
    var ExternalDefineMouseEnter = function (_event) {
        gantt.user_mouseenter(this);
    };
    var ExternalDefineFixit = function (_colony) {
        gantt.user_fixit(_colony);
    };
    var ExternalDefineClick = function (_event) {
        gantt.user_click(_event);
    };

    // 便利関数群
    // ボックスの幅情報を保持する
    var BaseWidth = function (opt, offset) {
        var _offset = offset | 0;
        var _bwidth = (opt.colend - opt.colstart) * gantt.WIDTH_CELL_WITH_BORDER;
        _bwidth += _offset;
        return _bwidth + 'px';
    };
    // Include判定 (prototypeを使わない)
    var Includes = function (list, item) {
        if (!list) { return false; }
        if (!item) { return false; }
        if (!Array.isArray(list)) { return false; }
        var from = 0;
        var len = list.length;
        if (len === 0) { return false; }
        while (from < len) {
            if (list[from++] === item) {
                return true;
            }
        }
        return false;
    };

    return gantt;
};

} catch (e) {
    console.log('error:');
    console.log(e);
}
