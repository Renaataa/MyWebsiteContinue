var app = angular.module('paionline')

app.controller('ChangePasswordCtrl', ['$http',  function($http) {
    console.log('Kontroler ChangePasswordCtrl startuje')
    var ctrl = this 
 
    var pass = null
    ctrl.password = null
    ctrl.choice = null
    ctrl.confirmed = false
    var ifGenerated = false
    
    ctrl.confirmPassword = function(){
        $http.get('/changePassword?password=' + ctrl.password).then(
            function(res) {ctrl.confirmed=true},
            function(err) {
                ctrl.confirmed=false
                alert(err.data.error)
            }
        )
    }
 
    ctrl.changePassword = function(){
        if(pass) {
            ctrl.password = pass
            ifGenerated = true
        }else ifGenerated = false
        $http.post('/changePassword?password=' + ctrl.password, ifGenerated).then(
            function(res) {},
            function(err) {}
        )
    }
    
    ctrl.write = function(){
        ctrl.choice = 0
        pass = null
    }

    ctrl.generate = function(){
        ctrl.choice = 1
    }

    ctrl.generatePassword = function(){
        var arr2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        var arr3 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
        var arr4 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
        var arr5 = ['!', '@', '$', '%', '^', '&', '*', '(', ')', '-', '=', '+', '<', '>' ]
        
        var result = []
        if(document.getElementById('param-2').checked){
            result = result.concat(arr2)
        }
        if(document.getElementById('param-3').checked){
            result = result.concat(arr3)
        }
        if(document.getElementById('param-4').checked){
            result = result.concat(arr4)
        }
        if(document.getElementById('param-5').checked){
            result = result.concat(arr5)
        }
        result.sort(compareRandom)

        pass = ''
        var passLength = parseInt(document.getElementById('param-1').value)
        for(var i=0; i<passLength; i++) {
            pass += result[randomInteger(0, result.length-1)]
        }
        document.getElementById('out').innerHTML = '<p>'+pass+'</p>'
            
        function compareRandom(a, b){
            return Math.random() - 0.5
        }

        function randomInteger(min, max){
            var rand = min - 0.5 + Math.random() * (max - min + 1)
            rand = Math.round(rand)
            return rand
        }
    }
}]) 