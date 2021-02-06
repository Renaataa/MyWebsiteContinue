var app = angular.module('paionline')

app.controller('PersonsCtrl', [ '$http', 'routes', 'common', function($http, routes, common) {
    console.log('Kontroler PersonCtrl startuje')
    var ctrl = this

    ctrl.visible = function() {
        var route = routes.find(function(el) { return el.route == '/persons' })
        return route && route.roles.includes(common.sessionData.role)
    }
    if(!ctrl.visible()) return 

    ctrl.selected = -1
    ctrl.visiblePass = true
    ctrl.clicked = null

    ctrl.persons = []
    ctrl.history = []

    ctrl.newPerson = {
        role: 2,
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        year: 1970
    }

    ctrl.options = [1, 2, 3]

    var refreshPersons = function() {
        $http.get('/person').then(
            function(res) {
                ctrl.persons = res.data
            },
            function(err) {}
        ) 
    }

    var refreshPerson = function() {
        $http.get('/person?_id=' + ctrl.persons[ctrl.selected]._id).then(
            function(res) {
                ctrl.person = res.data
                if(!ctrl.person.password) ctrl.visiblePass = false
                else ctrl.visiblePass = true
                document.getElementById('outChange').innerHTML = '<p>'+ctrl.person.password+'</p>'
            },
            function(err) {}
        )
    }

    refreshPersons();

    ctrl.insertNewData = function() { 
        ctrl.newPerson.password = document.getElementById('outAdd').innerText
        $http.post('/person', ctrl.newPerson).then(
            function(res) {
                refreshPersons()
            },
            function(err) {
                alert(err.data.error)
            }
        )
    }
    
    ctrl.select = function(index) { 
        ctrl.selected = index
        refreshPerson()
    }

    ctrl.updateData = function() {
        if(ctrl.visiblePass) ctrl.person.password = document.getElementById('outChange').innerText
        $http.put('/person?_id=' + ctrl.persons[ctrl.selected]._id, ctrl.person).then(
            function(res) {
                refreshPersons();
            },
            function(err) {
                alert(err.data.error)
            }
        )
    }

    ctrl.deleteData = function() { 
        $http.delete('/person?_id=' + ctrl.persons[ctrl.selected]._id).then(
            function(res) {
                refreshPersons();
            },
            function(err) {}
        )
    }

    ctrl.generatePassword = function(){ 
        var arr2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        var arr3 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
        var arr4 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
        var arr5 = ['!', '@', '$', '%', '^', '&', '*', '(', ')', '-', '=', '+', '<', '>' ]
        
        var result = []
            
        result = result.concat(arr2)
        result = result.concat(arr3)
        result = result.concat(arr4)
        result = result.concat(arr5)
        
        result.sort(compareRandom)

        var pass = ''
        var passLength = 10
        for(var i=0; i<passLength; i++) {
            pass += result[randomInteger(0, result.length-1)]
        }
        if(ctrl.clicked) document.getElementById('outChange').innerHTML = '<p>'+pass+'</p>'
        else if (ctrl.clicked!=null) document.getElementById('outAdd').innerHTML = '<p>'+pass+'</p>'
            
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