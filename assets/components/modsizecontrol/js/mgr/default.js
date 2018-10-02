document.addEventListener('DOMContentLoaded', function () {
    var mSCElements = {
        button: document.getElementById('modsizecontrol-send'),
        size: document.getElementById('modsizecontrol-size'),
        limit: document.getElementById('modsizecontrol-limit'),
        percent: document.getElementById('modsizecontrol-percent'),
        error: document.getElementsByClassName('modsizecontrol-error'),
        chart: document.getElementById("modsizecontrol-circlechart")
    };
    var queryUpdate = encodeURI('action=size/update');
    var modSizeControl = {
        link: modSizeControlConfig.web_connector + '?' + queryUpdate,
        ajax: function () {
            mSCElements.button.classList.add('x-item-disabled');
            mSCElements.chart.classList.add('loading');
            mSCElements.chart.innerHTML = modSizeControl.makesvg(100);
            mSCElements.percent.innerHTML = 'Загрузка'; // TODO: Текст нужно забирать из лексикона
            var mSCRequest = new XMLHttpRequest();
            mSCRequest.open('GET', modSizeControl.link);

            mSCRequest.onreadystatechange = function () {
                if (mSCRequest.readyState === 4) {
                    if (mSCRequest.status === 200) {
                        var data = JSON.parse(this.responseText);
                        if (!data.success) {
                            MODx.msg.alert('Ошибка', data.message, function () {}, MODx);
                            mSCElements.percent.innerHTML = 'Ошибка'; // TODO: Текст нужно забирать из лексикона
                            mSCElements.button.classList.remove('x-item-disabled');
                            return;
                        }
                        mSCElements.size.innerHTML = data.object.size;
                        mSCElements.limit.innerHTML = data.object.limit;
                        mSCElements.percent.innerHTML = data.object.percent + '%';

                        if (data.percent > 100) {
                            MODx.msg.alert(data.object.errorHeader, data.object.errorText, function () {}, MODx);
                        }

                        mSCElements.chart.classList.remove('loading');
                        mSCElements.chart.innerHTML = modSizeControl.makesvg(data.object.percent);
                        mSCElements.button.classList.remove('x-item-disabled');
                    } else {
                        MODx.msg.alert('Ошибка', 'Произошла ошибка при запросе: ' + mSCRequest.status + ' ' + mSCRequest.statusText, function () {}, MODx);
                        MODx.msg.alert('Ошибка', data.message, function () {}, MODx);
                        mSCElements.percent.innerHTML = 'Ошибка'; // TODO: Текст нужно забирать из лексикона
                    }
                }
            };

            mSCRequest.send(null);
        },
        makesvg: function (percentage) {
            var abs_percentage = Math.abs(percentage).toString();
            var classes = '';

            if (percentage >= 50 && percentage <= 75) {
                classes = 'modsizecontrol-warning-stroke';
            } else if (percentage > 75) {
                classes = 'modsizecontrol-danger-stroke';
            } else {
                classes = 'modsizecontrol-success-stroke';
            }

            var svg = '<svg class="modsizecontrol-circle-chart" viewbox="0 0 33.83098862 33.83098862" xmlns="http://www.w3.org/2000/svg">' +
                '<circle class="modsizecontrol-circle-chart-background" cx="16.9" cy="16.9" r="15.9" />' +
                '<circle class="modsizecontrol-circle-chart-circle ' + classes + '"' +
                'stroke-dasharray="' + abs_percentage + ',100"    cx="16.9" cy="16.9" r="15.9" />';

            svg += ' </g></svg>';

            return svg;
        }
    };

    if (mSCElements.button) mSCElements.button.onclick = modSizeControl.ajax;

    if (mSCElements.chart) mSCElements.chart.innerHTML = modSizeControl.makesvg(mSCElements.chart.dataset.percentage);
});