window.onload = function () {

    var _selector = 'gantt';

    var _start_h = 7;
    var _start_m = 0;
    var _start_q = (_start_h * 60 + _start_m) / 15;
    var _end_h = 19;
    var _end_m = 0;
    var _end_q = (_end_h * 60 + _end_m) / 15;

    var _col = _end_q - _start_q;

    var _width_all = 800;// border等の増加分を考慮しない値
    var _width_header = 80;
    var _width_cell = Math.floor((_width_all - _width_header) / _col);
    var _width_table = _width_cell * _col;

    var _headers = [
        { num: 1, id: 1, name: 'Alfred' },
        { num: 2, id: 2, name: 'James' },
        { num: 3, id: 3, name: 'David' },
        { num: 4, id: 4, name: 'Paul' },
        { num: 5, id: 5, name: 'Brian' },
        { num: 6, id: 6, name: 'William' },
        { num: 7, id: 7, name: 'Rozeroze' },
    ];

    var _list = [];
    {
        var _data = [
            // Alfred
            { row: 1, num: 101, time: { start: [ 9,  0], end: [10,  0] }, label: 'breakfast' },
            { row: 1, num: 102, time: { start: [15,  0], end: [16,  0] }, label: 'lunch' },
            { row: 1, num: 103, time: { start: [22,  0], end: [22, 30] }, label: 'dinner' },
            // James
            { row: 2, num: 201, time: { start: [ 9, 30], end: [11,  0] }, label: 'walking load' },
                { row: 2, num: 202, time: { start: [13,  0], end: [14, 30] }, label: 'tennis with Avery' },
            // David
            { row: 3, num: 301, time: { start: [10,  0], end: [12, 30] }, label: 'pray' },
            { row: 3, num: 302, time: { start: [21,  0], end: [23, 30] }, label: 'pray' },
            // Paul
            { row: 4, num: 401, time: { start: [ 7, 30], end: [10,  0] }, label: 'study of ethic' },
            { row: 4, num: 402, time: { start: [11, 00], end: [12,  0] }, label: 'read some reports' },
            { row: 4, num: 403, time: { start: [14, 30], end: [16,  0] }, label: 'meeting with Carn' },
            // Brian
            { row: 5, num: 501, time: { start: [ 7, 30], end: [11,  0] }, label: 'read & send mail to Terry' },
            // William
            { row: 6, num: 601, time: { start: [ 8, 30], end: [10, 30] }, label: 'play game' },
            // Rozeroze
            { row: 7, num: 701, time: { start: [12, 30], end: [14,  0] }, label: 'do something' },
        ];
        for (var i = 0; i < _data.length; i++) {
            if ((_start_h * 60 + _start_m) > (_data[i].time.end[0] * 60 + _data[i].time.end[1])) { continue; }
            if ((_end_h * 60 + _end_m) < (_data[i].time.start[0] * 60 + _data[i].time.start[1])) { continue; }
            var _cs = getColnum(_start_h, _start_m, _data[i].time.start[0], _data[i].time.start[1]);
            var _ce = getColnum(_start_h, _start_m, _data[i].time.end[0], _data[i].time.end[1]);
            _cs = _cs < 1 ? 1 : _cs;
            _ce = _ce > _col + 1 ? _col + 1 : _ce;
            var _item = {
                id: (i + 1),
                row: _data[i].row,
                colstart: _cs,
                colend: _ce,
                label: _data[i].label,
                num: _data[i].num,
                time: _data[i].time
            };
            _list.push(_item);
        }
    }

    var _resizable = 1;
    var _movable = 1;

    var _info = {
        config: {
            selector: _selector,
            height: {
                all: 25 * _headers.length,
                cell: 25,
            },
            width: {
                all: _width_all,
                border: 1,
                resize: 5,
                cell: _width_cell,
                header: _width_header,
                table: _width_table
            },
            header: _headers,
            row: {
                count: _headers.length,
                list: _headers.map(function (h) { return h.name })
            },
            border: {
                out: {
                    width: 2,
                    style: 'solid',
                    color: 'gray'
                },
                in: {
                    width: 1,
                    style: 'solid',
                    color: 'gray'
                },
                highlight: {
                    color: 'aqua'
                }
            },
            col: _col,
            zindex: {
                base: 10
            },
            time: {
                start: {
                    hour: _start_h,
                    minute: _start_m,
                    quarter: _start_q
                },
                end: {
                    hour: _end_h,
                    minute: _end_m,
                    quarter: _end_q
                }
            },
            resizable: _resizable,
            movable: _movable
        },
        data: {
            count: _list.length,
            list: _list
        },
        events: {
            dblclick: _dblclick,
            click: _click,
            fixit: _fixit,
            mouseenter: _mouseenter
        }
    };

    setDetails('detail');
    setTimeHeader(_info);

    var gantt = new Gantt();
    gantt.fieldset(_info.config);
    gantt.set(_info.data);
    gantt.regist(_info.events);

    setPointerCss(_movable, _resizable);

}

// 関数群
function setDetails(selector) {
    var _detail = document.createElement('div');
    _detail.classList.add('detail-window');
    _detail.setAttribute('id', 'detail-window');
    _detail.setAttribute('show-boxid', '');
    var _header = document.createElement('div');
    _header.classList.add('detail-window-title');
    _header.innerHTML = '<span>詳細</span>';
    var _part = document.createElement('div');
    _part.classList.add('detail-window-part');
    _part.innerHTML = '<input type="text" id="detail-text" />';

    _detail.appendChild(_header);
    _detail.appendChild(_part);
    document.getElementById(selector).appendChild(_detail);

}
function setTimeHeader(_info) {
    var _cellwidth = _info.config.width.cell + _info.config.width.border;

    var timeheader = document.createElement('div');
    timeheader.classList.add('timeheader');
    var table = document.createElement('table');
    table.classList.add('timetable');
    table.style.width = _info.config.width.all + 'px';
    table.style.left = -0.5 * _cellwidth + 'px';
    var tr = document.createElement('tr');
    var header = document.createElement('td');
    header.classList.add('timeheader-header')
    header.style.width = _info.config.width.header + 'px';
    tr.appendChild(header);

    var _qrt = _info.config.time.start.quarter % 4;
    for (var i = 0; i <= _info.config.col; i++) {
        var td = document.createElement('td');
        td.style.width = _cellwidth + 'px';
        var _now = _qrt + i;
        if (_now % 4 == 0) {
            var _text = (_now / 4) + _info.config.time.start.hour;
            td.innerHTML = '<span>' + _text + '</span>'
        }
        tr.appendChild(td);
    }

    table.appendChild(tr);
    timeheader.appendChild(table);
    document.getElementById(_info.config.selector).appendChild(timeheader);
}
function setPointerCss(_movable, _resizable) {
    var _m = _movable ? 'pointer' : 'auto';
    var _l = _resizable ? 'pointer' : 'auto';
    var _r = _resizable ? 'ew-resize' : 'auto';
    var _middle = document.getElementsByClassName('box-label');
    var _left = document.getElementsByClassName('resize-left');
    var _right = document.getElementsByClassName('resize-right');
    var _len = _middle.length;
    for (var i = 0; i < _len; i++) {
        _middle[i].style.cursor = _m;
        _left[i].style.cursor = _l;
        _right[i].style.cursor = _r;
    }
}
function getColnum(s_hour, s_minute, hour, minute) {
    var _s = Math.round((s_hour * 60 + s_minute) / 15);
    var _r = Math.round((hour * 60 + minute) / 15);
    return _r - _s + 1;
}
function updateDetails(boxid, text) {
    var _detail = document.getElementById('detail-window');
    _detail.setAttribute('show-boxid', boxid);
    var _text = document.getElementById('detail-text');
    _text.value = text;
}
function _dblclick(box) {
    // 要素の更新画面を開くとか
    console.log('user defined dblclick() called');
    var prm = window.prompt('enter new value.', '');
    if (prm === null) {
        // canceled, escape etc...
    } else {
        box.children[1].innerHTML = prm;
        box.setAttribute('label', prm);
    }
}
function _click(box) {
    // なんかやるとか
    console.log('user defined click() called');
}
function _fixit(box) {
    // サーバ通信してDBの更新を行なうとか
    console.log('user defined fixit() called');
}
function _mouseenter(box) {
    // 詳細をどこかに表示するとか
    console.log('user defined mouseenter() called');
    var _detail = document.getElementById('detail-window');
    var _boxid = box.getAttribute('boxid');
    var _label = box.getAttribute('label');
    if (_detail.getAttribute('show-boxid') == _boxid) return;
    var _selected = document.getElementsByClassName('detail-select')[0];
    if (_selected) {
        _selected.classList.remove('detail-select');
    }
    updateDetails(_boxid, _label);
    box.classList.add('detail-select');
}
