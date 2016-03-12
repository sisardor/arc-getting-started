var singleton = function singleton(){
    //defining a var instead of this (works for variable & function) will create a private definition
    var socketList = {};
    var id = Math.random();



    this.init = function() {
    	console.log('init singleton');
    };

    this.getId = function() {
    	return id;
    };

    this.add = function(userId, socket){
        if(!socketList[userId]){
            socketList[userId] = socket;
        }
    };

    this.remove = function(userId){
        if(socketList[userId]){
            delete socketList[userId];
        }
    };

    this.getSocketList = function(){
        return socketList;
    };

    this.toString = function() {
    	console.log(socketList);
    };

    if(singleton.caller != singleton.getInstance){
        throw new Error("This object cannot be instanciated");
    }
};

/* ************************************************************************
SINGLETON CLASS DEFINITION
************************************************************************ */
singleton.instance = null;

/**
 * Singleton getInstance definition
 * @return singleton class
 */
singleton.getInstance = function(){
    if(this.instance === null){
    	var a = new singleton();
    	a.init();
        this.instance = a;
    }
    return this.instance;
};

module.exports = singleton.getInstance();
