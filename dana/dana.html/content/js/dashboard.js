/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.02102973168962, "KoPercent": 0.9789702683103698};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3236040609137056, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.03488372093023256, 500, 1500, "digital-lending-1"], "isController": false}, {"data": [0.9638242894056848, 500, 1500, "digital-lending-0"], "isController": false}, {"data": [0.1425, 500, 1500, "payLater"], "isController": false}, {"data": [0.0, 500, 1500, "Dana Home"], "isController": false}, {"data": [0.15051020408163265, 500, 1500, "payLater-1"], "isController": false}, {"data": [0.9668367346938775, 500, 1500, "payLater-0"], "isController": false}, {"data": [0.0275, 500, 1500, "digital-lending"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2758, 27, 0.9789702683103698, 7212.724437998542, 0, 77248, 3854.5, 23320.899999999994, 38350.49999999994, 50621.69, 35.058282169596666, 753.719264517313, 5.840729830047414], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["digital-lending-1", 387, 0, 0.0, 4905.2093023255875, 50, 37732, 4293.0, 6498.199999999998, 12992.799999999997, 31192.000000000004, 5.621731551423592, 142.6679080340282, 0.7631061383280069], "isController": false}, {"data": ["digital-lending-0", 387, 0, 0.0, 157.16795865633063, 4, 4420, 55.0, 133.2, 549.5999999999998, 3773.920000000001, 5.626472042104038, 3.335336756891338, 0.7692442245064116], "isController": false}, {"data": ["payLater", 400, 10, 2.5, 4420.269999999998, 0, 29340, 4402.5, 6110.8, 9826.5, 21274.420000000016, 5.952292376601538, 220.5497110580572, 1.5171079578428894], "isController": false}, {"data": ["Dana Home", 400, 2, 0.5, 31095.49249999999, 9513, 77248, 30959.0, 49994.8, 51443.65, 66587.05, 5.097099750242112, 121.57242441160355, 0.5695660536342322], "isController": false}, {"data": ["payLater-1", 392, 2, 0.5102040816326531, 4254.645408163262, 0, 23886, 4255.5, 6001.5, 9128.999999999995, 19281.14, 5.836546908267945, 217.04053943391452, 0.7541994383068059], "isController": false}, {"data": ["payLater-0", 392, 0, 0.0, 255.72448979591834, 4, 26251, 50.0, 111.0, 216.79999999999973, 5016.03, 5.839155110005511, 3.3934066749959038, 0.7641081882233776], "isController": false}, {"data": ["digital-lending", 400, 13, 3.25, 4897.959999999996, 0, 37792, 4383.5, 6912.900000000007, 13061.949999999999, 31118.120000000017, 5.8090563188010105, 146.34594189763715, 1.5313018503659706], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: dana.money:443 failed to respond", 27, 100.0, 0.9789702683103698], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2758, 27, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: dana.money:443 failed to respond", 27, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["payLater", 400, 10, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: dana.money:443 failed to respond", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Dana Home", 400, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: dana.money:443 failed to respond", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["payLater-1", 392, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: dana.money:443 failed to respond", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["digital-lending", 400, 13, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: dana.money:443 failed to respond", 13, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
