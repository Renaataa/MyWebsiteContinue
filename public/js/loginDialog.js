var app = angular.module('paionline')

app.controller('LoginDialog', [ '$http', '$uibModalInstance', 'common', 'options', function($http, $uibModalInstance, common, options) {
    console.log('Kontroler LoginCtrl startuje')
    var ctrl = this

    ctrl.sessionData = common.sessionData
    ctrl.credentials = { login: '', password: '' }
    ctrl.error = ''

    if(options.defaultCredentials.login) {
        ctrl.credentials.login = options.defaultCredentials.login
        ctrl.credentials.password = options.defaultCredentials.password
    }

    ctrl.ok = function() {
        $http.post('/login', ctrl.credentials).then(
            function(res) {
                options.defaultCredentials.login = ctrl.credentials.login
                options.defaultCredentials.password = ctrl.credentials.password
                $uibModalInstance.close()
            },
            function(err) {
                ctrl.error = 'Logowanie nieudane'
            }
        )
    }

    ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel')
    }
}])