(function() {
    'use strict';

    var syncano = SyncanoConnector.getInstance();
    var authData = {
        // Enter your own auth information!
    };

    syncano.connect(authData, function(auth) {
        console.log("Connected");
    });

    var projectId = 6588;
    var collectionId = 19160;

    var params = {
        include_children: true,
    };

    function predictionCounter(folder, div) {
        var optional_params = {
            folders: folder
        };
        syncano.Data.count(projectId, collectionId, optional_params, function(data) {
            $('#' + div).text(data);
        });
    }

    function predictionGetter(folder, div) {
        syncano.Data.get(projectId, collectionId, params, function(data) {
            data.forEach(function(d) {
                if (d.folder === folder) {
                    var date = new Date(d.additional.prediction_date).toDateString();
                    $('#' + div).text(d.additional.prediction);
                    $('#' + div + '-date').text(date);
                }
            });
        });
    }


    // Pull latest predictions and prediction counts from Syncano backend
    predictionGetter('USD/EUR', 'euro-latest-bet');
    predictionGetter('USD/JPY', 'jpy-latest-bet');
    predictionGetter('USD/GBP', 'gbp-latest-bet');

    predictionCounter('USD/EUR', 'euro-num-bets');
    predictionCounter('USD/JPY', 'jpy-num-bets');
    predictionCounter('USD/GBP', 'gbp-num-bets');


    syncano.on('syncano:authorized', function() {
        syncano.Subscription.subscribeProject(projectId, function(result) {});
        console.log('Subscribed');
    });

    // Listen for changes and update as needed
    syncano.on('syncano:newdata:project-' + projectId, function(data) {
        console.log("Received Data:");
        var dataPoint = data[0];
        var dataFolder = dataPoint.folder;
        var prediction = dataPoint.additional.prediction;
        var predictionDate = new Date(dataPoint.additional.prediction_date).toDateString();
        if (predictionDate !== ';drop table;') {
            console.log(data[0]);
            if (dataFolder === 'USD/EUR') {
                $("#euro-latest-bet").text(prediction);
                $("#euro-latest-bet-date").text(predictionDate);
                predictionCounter('USD/EUR', 'euro-num-bets');
            } else if (dataFolder === 'USD/JPY') {
                $("#jpy-latest-bet").text(prediction);
                $("#jpy-latest-bet-date").text(predictionDate);
                predictionCounter('USD/JPY', 'jpy-num-bets');
            } else if (dataFolder === 'USD/GBP') {
                $("#gbp-latest-bet").text(prediction);
                $("#gbp-latest-bet-date").text(predictionDate);
                predictionCounter('USD/GBP', 'gbp-num-bets');
            }
        }

    });

})();