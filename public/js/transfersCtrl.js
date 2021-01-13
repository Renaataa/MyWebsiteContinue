var app = angular.module('paionline')

app.controller('TransfersCtrl', [ '$http', 'common', function($http, common) {
    console.log('Kontroler TransfersCtrl startuje')
    var ctrl = this

    ctrl.formatDateTime = common.formatDateTime

    ctrl.history = []

    ctrl.recipients = []
    ctrl.recipient = null

    ctrl.transfer = {
        delta: 1.00
    }

    ctrl.amount = 0
    
    var refreshHistory = function() {
        $http.get('/transfer').then(
            function(res) {
                ctrl.history = res.data
                $http.delete('/transfer').then(
                    function(res) { ctrl.amount = res.data.amount },
                    function(err) {}
                )
            },
            function(err) {}    
        )
    }

    refreshHistory()

    ctrl.doTransfer = function() {
        $http.post('/transfer?recipient=' + ctrl.recipient._id, ctrl.transfer).then(
            function(res) {
                refreshHistory()
            },
            function(err) {}
        )
    }

    $http.get('/personList').then(
        function(res) {
            ctrl.recipients = res.data
            ctrl.recipient = ctrl.recipients[0]
        }, 
        function(err) {
            ctrl.recipients = []
            ctrl.recipient = null
        }
    )
}])