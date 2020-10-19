"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var net;
(function (net) {
    var user1;
    (function (user1) {
        var events;
        (function (events) {
            var Event = (function () {
                function Event(type) {
                    if (type) {
                        this.type = type;
                    }
                    else {
                        throw new Error("Event creation failed. No type specified. Event: " + this);
                    }
                }
                Event.prototype.toString = function () {
                    return '[object Event]';
                };
                return Event;
            }());
            events.Event = Event;
        })(events = user1.events || (user1.events = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var AccountEvent = (function (_super) {
                __extends(AccountEvent, _super);
                function AccountEvent(type, status, userID, clientID, role) {
                    if (status === void 0) { status = null; }
                    if (userID === void 0) { userID = null; }
                    if (clientID === void 0) { clientID = null; }
                    if (role === void 0) { role = null; }
                    var _this = _super.call(this, type) || this;
                    _this.status = status;
                    _this.userID = userID;
                    _this.clientID = clientID;
                    _this.role = role;
                    _this.account = null;
                    return _this;
                }
                AccountEvent.prototype.getAccount = function () {
                    if (this.target instanceof orbiter.AccountManager) {
                        return this.account;
                    }
                    else if (this.target instanceof orbiter.UserAccount) {
                        return this.target;
                    }
                    else {
                        throw new Error("[AccountEvent] Unexpected target type: " + this.target);
                    }
                };
                AccountEvent.prototype.getClientID = function () {
                    return this.clientID;
                };
                AccountEvent.prototype.getRole = function () {
                    return this.role;
                };
                AccountEvent.prototype.getStatus = function () {
                    return this.status;
                };
                AccountEvent.prototype.getUserID = function () {
                    return this.userID;
                };
                AccountEvent.prototype.setAccount = function (value) {
                    if (value === void 0) { value = null; }
                    this.account = value;
                };
                AccountEvent.prototype.toString = function () {
                    return '[object AccountEvent]';
                };
                AccountEvent.ADD_ROLE_RESULT = 'ADD_ROLE_RESULT';
                AccountEvent.CHANGE_PASSWORD = 'CHANGE_PASSWORD';
                AccountEvent.CHANGE_PASSWORD_RESULT = 'CHANGE_PASSWORD_RESULT';
                AccountEvent.LOGIN = 'LOGIN';
                AccountEvent.LOGIN_RESULT = 'LOGIN_RESULT';
                AccountEvent.LOGOFF = 'LOGOFF';
                AccountEvent.LOGOFF_RESULT = 'LOGOFF_RESULT';
                AccountEvent.OBSERVE = 'OBSERVE';
                AccountEvent.OBSERVE_RESULT = 'OBSERVE_RESULT';
                AccountEvent.REMOVE_ROLE_RESULT = 'REMOVE_ROLE_RESULT';
                AccountEvent.STOP_OBSERVING = 'STOP_OBSERVING';
                AccountEvent.STOP_OBSERVING_RESULT = 'STOP_OBSERVING_RESULT';
                AccountEvent.SYNCHRONIZE = 'SYNCHRONIZE';
                return AccountEvent;
            }(net.user1.events.Event));
            orbiter.AccountEvent = AccountEvent;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var events;
        (function (events) {
            var EventDispatcher = (function () {
                function EventDispatcher(target) {
                    this.listeners = {};
                    this.target = target !== null && target !== void 0 ? target : this;
                }
                EventDispatcher.prototype.addEventListener = function (type, listener, thisArg, priority) {
                    if (priority === void 0) { priority = 0; }
                    if (typeof this.listeners[type] === 'undefined')
                        this.listeners[type] = [];
                    var listenerArray = this.listeners[type];
                    if (this.hasListener(type, listener, thisArg))
                        return false;
                    var newListener = new events.EventListener(listener, thisArg, priority);
                    var added = false;
                    for (var i = listenerArray.length; --i >= 0;) {
                        var thisListener = listenerArray[i];
                        if (priority <= thisListener.getPriority()) {
                            listenerArray.splice(i + 1, 0, newListener);
                            added = true;
                            break;
                        }
                    }
                    if (!added) {
                        listenerArray.unshift(newListener);
                    }
                    return true;
                };
                EventDispatcher.prototype.dispatchEvent = function (event) {
                    var listenerArray = this.listeners[event.type];
                    if (typeof listenerArray === 'undefined') {
                        return;
                    }
                    if (typeof event.type === 'undefined') {
                        throw new Error("Event dispatch failed. No event name specified by " + event);
                    }
                    event.target = this.target;
                    for (var i = 0, numListeners = listenerArray.length; i < numListeners; i++) {
                        listenerArray[i].getListenerFunction().apply(listenerArray[i].getThisArg(), [event]);
                    }
                };
                EventDispatcher.prototype.getListeners = function (type) {
                    return this.listeners[type];
                };
                EventDispatcher.prototype.hasListener = function (type, listener, thisArg) {
                    var listenerArray = this.listeners[type];
                    if (typeof listenerArray === 'undefined') {
                        return false;
                    }
                    for (var i = 0; i < listenerArray.length; i++) {
                        if (listenerArray[i].getListenerFunction() === listener &&
                            listenerArray[i].getThisArg() === thisArg) {
                            return true;
                        }
                    }
                    return false;
                };
                EventDispatcher.prototype.removeEventListener = function (type, listener, thisArg) {
                    var listenerArray = this.listeners[type];
                    if (typeof listenerArray == 'undefined') {
                        return false;
                    }
                    var foundListener = false;
                    for (var i = 0; i < listenerArray.length; i++) {
                        if (listenerArray[i].getListenerFunction() === listener &&
                            listenerArray[i].getThisArg() === thisArg) {
                            foundListener = true;
                            listenerArray.splice(i, 1);
                            break;
                        }
                    }
                    if (listenerArray.length == 0) {
                        delete this.listeners[type];
                    }
                    return foundListener;
                };
                return EventDispatcher;
            }());
            events.EventDispatcher = EventDispatcher;
        })(events = user1.events || (user1.events = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var Snapshot = (function (_super) {
                    __extends(Snapshot, _super);
                    function Snapshot() {
                        var _this = _super.call(this) || this;
                        _this.args = [];
                        return _this;
                    }
                    Snapshot.prototype.getStatus = function () {
                        return this._status;
                    };
                    Snapshot.prototype.updateInProgress = function () {
                        return this._updateInProgress;
                    };
                    Snapshot.prototype.dispatchLoaded = function () {
                        this.dispatchEvent(new snapshot.SnapshotEvent(snapshot.SnapshotEvent.LOAD, this));
                    };
                    Snapshot.prototype.dispatchStatus = function () {
                        this.dispatchEvent(new snapshot.SnapshotEvent(snapshot.SnapshotEvent.STATUS, this));
                    };
                    Snapshot.prototype.onLoad = function () {
                    };
                    Snapshot.prototype.setStatus = function (value) {
                        this._status = value;
                    };
                    Snapshot.prototype.setUpdateInProgress = function (value) {
                        this._updateInProgress = value;
                    };
                    return Snapshot;
                }(net.user1.events.EventDispatcher));
                snapshot.Snapshot = Snapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var AccountListSnapshot = (function (_super) {
                    __extends(AccountListSnapshot, _super);
                    function AccountListSnapshot() {
                        var _this = _super.call(this) || this;
                        _this.accountList = null;
                        _this.method = orbiter.UPC.GET_ACCOUNTLIST_SNAPSHOT;
                        return _this;
                    }
                    AccountListSnapshot.prototype.getAccountList = function () {
                        var _a, _b;
                        return (_b = (_a = this.accountList) === null || _a === void 0 ? void 0 : _a.slice()) !== null && _b !== void 0 ? _b : null;
                    };
                    AccountListSnapshot.prototype.setAccountList = function (value) {
                        this.accountList = value;
                    };
                    return AccountListSnapshot;
                }(snapshot.Snapshot));
                snapshot.AccountListSnapshot = AccountListSnapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var utils;
        (function (utils) {
            var LRUCache = (function () {
                function LRUCache(maxLength) {
                    this.maxLength = maxLength;
                    this.hash = {};
                    this.length = 0;
                }
                LRUCache.prototype.clear = function () {
                    this.first = undefined;
                    this.last = undefined;
                    this.length = 0;
                    this.hash = {};
                };
                LRUCache.prototype.get = function (key) {
                    var _a;
                    var node = this.hash[key];
                    if (!node)
                        return null;
                    this.moveToHead(node);
                    return (_a = node.value) !== null && _a !== void 0 ? _a : null;
                };
                LRUCache.prototype.put = function (key, value) {
                    var node = this.hash[key];
                    if (!node) {
                        if (this.length >= this.maxLength) {
                            this.removeLast();
                        }
                        else {
                            this.length++;
                        }
                        node = new utils.CacheNode();
                    }
                    node.value = value;
                    node.key = key;
                    this.moveToHead(node);
                    this.hash[key] = node;
                };
                LRUCache.prototype.remove = function (key) {
                    var node = this.hash[key];
                    if (node) {
                        if (node.prev)
                            node.prev.next = node.next;
                        if (node.next)
                            node.next.prev = node.prev;
                        if (this.last == node)
                            this.last = node.prev;
                        if (this.first == node)
                            this.first = node.next;
                    }
                    return node;
                };
                LRUCache.prototype.moveToHead = function (node) {
                    if (node == this.first)
                        return;
                    if (node.prev)
                        node.prev.next = node.next;
                    if (node.next)
                        node.next.prev = node.prev;
                    if (this.last == node)
                        this.last = node.prev;
                    if (this.first) {
                        node.next = this.first;
                        this.first.prev = node;
                    }
                    this.first = node;
                    node.prev = undefined;
                    if (!this.last)
                        this.last = this.first;
                };
                LRUCache.prototype.removeLast = function () {
                    if (!this.last)
                        return;
                    if (this.last.key)
                        delete this.hash[this.last.key];
                    if (this.last.prev)
                        this.last.prev.next = undefined;
                    else
                        this.first = undefined;
                    this.last = this.last.prev;
                };
                return LRUCache;
            }());
            utils.LRUCache = LRUCache;
        })(utils = user1.utils || (user1.utils = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var LRUCache = net.user1.utils.LRUCache;
            var AccountManager = (function (_super) {
                __extends(AccountManager, _super);
                function AccountManager(log) {
                    var _this = _super.call(this) || this;
                    _this.log = log;
                    _this._isWatchingForAccounts = false;
                    _this.accountCache = new LRUCache(10000);
                    _this.clientManager = null;
                    _this.messageManager = null;
                    _this.observedAccounts = new orbiter.AccountSet();
                    _this.roomManager = null;
                    _this.watchedAccounts = new orbiter.AccountSet();
                    return _this;
                }
                AccountManager.prototype.accountIsKnown = function (userID) {
                    for (var knownUserID in this.getAccounts()) {
                        if (knownUserID == userID)
                            return true;
                    }
                    return false;
                };
                AccountManager.prototype.addObservedAccount = function (account) {
                    this.observedAccounts.add(account);
                    this.fireObserveAccount(account.getUserID());
                };
                AccountManager.prototype.addRole = function (userID, role) {
                    if (!userID) {
                        this.log.warn('[ACCOUNT_MANAGER] Add role failed. No userID supplied.');
                    }
                    else if (!role) {
                        this.log.warn("[ACCOUNT_MANAGER] Add role failed for account [" + userID + "]. No role supplied.");
                    }
                    else {
                        this.messageManager.sendUPC(orbiter.UPC.ADD_ROLE, userID, role);
                    }
                };
                AccountManager.prototype.addWatchedAccount = function (account) {
                    this.watchedAccounts.add(account);
                    this.fireAccountAdded(account.getUserID(), account);
                };
                AccountManager.prototype.changePassword = function (userID, newPassword, oldPassword) {
                    if (!userID) {
                        this.log.warn('[ACCOUNT_MANAGER] Change password failed. No userID supplied.');
                    }
                    else if (!newPassword) {
                        this.log.warn("[ACCOUNT_MANAGER] Change password failed for account [" + userID + "]. No new password supplied.");
                    }
                    else {
                        if (!oldPassword) {
                            this.log.warn("[ACCOUNT_MANAGER] Change account password for account [" + userID + "]: no old password supplied. Operation will fail unless sender is an administrator.");
                            oldPassword = '';
                        }
                        this.messageManager.sendUPC(orbiter.UPC.CHANGE_ACCOUNT_PASSWORD, userID, oldPassword, newPassword);
                    }
                };
                AccountManager.prototype.cleanup = function () {
                    this.log.info('[ACCOUNT_MANAGER] Cleaning resources.');
                    this.removeAllObservedAccounts();
                    this.removeAllWatchedAccounts();
                    this.setIsWatchingForAccounts(false);
                };
                AccountManager.prototype.createAccount = function (userID, password) {
                    if (!userID) {
                        this.log.warn('[ACCOUNT_MANAGER] Create account failed. No userID supplied.');
                    }
                    else if (!password) {
                        this.log.warn('[ACCOUNT_MANAGER] Create account failed. No password supplied.');
                    }
                    else {
                        this.messageManager.sendUPC(orbiter.UPC.CREATE_ACCOUNT, userID, password);
                    }
                };
                AccountManager.prototype.deserializeWatchedAccounts = function (ids) {
                    var idList = ids.split(orbiter.Tokens.RS), idHash = {}, len = idList.length;
                    for (var i = len; --i >= 0;) {
                        idHash[idList[i]] = 1;
                    }
                    for (var accountID in this.watchedAccounts.getAll()) {
                        if (!idHash.hasOwnProperty(accountID)) {
                            this.removeWatchedAccount(accountID);
                        }
                    }
                    if (ids != '') {
                        for (var accountID in idHash) {
                            if (accountID != '' && idHash.hasOwnProperty(accountID)) {
                                if (!this.watchedAccounts.containsUserID(accountID)) {
                                    this.addWatchedAccount(this.requestAccount(accountID));
                                }
                            }
                            else {
                                throw new Error('[CORE_MESSAGE_LISTENER] Received empty account id in user list (u127).');
                            }
                        }
                    }
                    this.fireSynchronize();
                };
                AccountManager.prototype.fireAccountRemoved = function (userID, account) {
                    this.dispatchEvent(new orbiter.AccountManagerEvent(orbiter.AccountManagerEvent.ACCOUNT_REMOVED, userID, account));
                };
                AccountManager.prototype.fireAddRoleResult = function (userID, role, status) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.ADD_ROLE_RESULT, status, userID, undefined, role);
                    e.setAccount(this.getAccount(userID));
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireChangePassword = function (userID) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.CHANGE_PASSWORD, orbiter.Status.SUCCESS, userID);
                    e.setAccount(this.getAccount(userID));
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireChangePasswordResult = function (userID, status) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.CHANGE_PASSWORD_RESULT, status, userID);
                    e.setAccount(this.getAccount(userID));
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireCreateAccountResult = function (userID, status) {
                    var _a;
                    var e = new orbiter.AccountManagerEvent(orbiter.AccountManagerEvent.CREATE_ACCOUNT_RESULT, userID, (_a = this.getAccount(userID)) !== null && _a !== void 0 ? _a : undefined, status);
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireLogin = function (account, clientID) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.LOGIN, orbiter.Status.SUCCESS, account.getUserID(), clientID);
                    e.setAccount(account);
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireLoginResult = function (userID, status) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.LOGIN_RESULT, status, userID);
                    e.setAccount(this.getAccount(userID));
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireLogoff = function (account, clientID) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.LOGOFF, orbiter.Status.SUCCESS, account.getUserID(), clientID);
                    e.setAccount(account);
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireLogoffResult = function (userID, status) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.LOGOFF_RESULT, status, userID);
                    e.setAccount(this.getAccount(userID));
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireObserveAccount = function (userID) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.OBSERVE, undefined, userID);
                    e.setAccount(this.getAccount(userID));
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireObserveAccountResult = function (userID, status) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.OBSERVE_RESULT, status, userID);
                    e.setAccount(this.getAccount(userID));
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireRemoveAccountResult = function (userID, status) {
                    var _a;
                    var e = new orbiter.AccountManagerEvent(orbiter.AccountManagerEvent.REMOVE_ACCOUNT_RESULT, userID, (_a = this.getAccount(userID)) !== null && _a !== void 0 ? _a : undefined, status);
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireRemoveRoleResult = function (userID, role, status) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.REMOVE_ROLE_RESULT, status, userID, undefined, role);
                    e.setAccount(this.getAccount(userID));
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireStopObservingAccount = function (userID) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.STOP_OBSERVING, undefined, userID);
                    e.setAccount(this.getAccount(userID));
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireStopObservingAccountResult = function (userID, status) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.STOP_OBSERVING_RESULT, status, userID);
                    e.setAccount(this.getAccount(userID));
                    this.dispatchEvent(e);
                };
                AccountManager.prototype.fireStopWatchingForAccountsResult = function (status) {
                    this.dispatchEvent(new orbiter.AccountManagerEvent(orbiter.AccountManagerEvent.STOP_WATCHING_FOR_ACCOUNTS_RESULT, undefined, undefined, status));
                };
                AccountManager.prototype.fireSynchronize = function () {
                    this.dispatchEvent(new orbiter.AccountManagerEvent(orbiter.AccountManagerEvent.SYNCHRONIZE));
                };
                AccountManager.prototype.fireWatchForAccountsResult = function (status) {
                    this.dispatchEvent(new orbiter.AccountManagerEvent(orbiter.AccountManagerEvent.WATCH_FOR_ACCOUNTS_RESULT, undefined, undefined, status));
                };
                AccountManager.prototype.getAccount = function (userID) {
                    var _a;
                    if (userID == null)
                        return null;
                    var cached = this.accountCache.get(userID);
                    if (cached)
                        return cached;
                    var account = this.observedAccounts.getByUserID(userID);
                    if (account)
                        return account;
                    account = this.watchedAccounts.getByUserID(userID);
                    if (account)
                        return account;
                    var clients = (_a = this.clientManager) === null || _a === void 0 ? void 0 : _a.getInternalClients();
                    for (var clientID in clients) {
                        account = clients[clientID].getAccount();
                        if ((account === null || account === void 0 ? void 0 : account.getUserID()) == userID) {
                            return account;
                        }
                    }
                    return null;
                };
                AccountManager.prototype.getAccounts = function () {
                    var _a;
                    var connectedAccounts = {}, clients = (_a = this.clientManager) === null || _a === void 0 ? void 0 : _a.getInternalClients();
                    for (var clientID in clients) {
                        var client = clients[clientID], account = client.getAccount();
                        if (account) {
                            connectedAccounts[account.getUserID()] = account;
                        }
                    }
                    return __assign(__assign(__assign({}, connectedAccounts), this.observedAccounts.getAll()), this.watchedAccounts.getAll());
                };
                AccountManager.prototype.getClientsForObservedAccounts = function () {
                    var clients = {}, accounts = this.observedAccounts.getAll();
                    for (var userID in accounts) {
                        var account = accounts[userID], client = account.getInternalClient();
                        if (client) {
                            clients[client.getClientID()] = client;
                        }
                    }
                    return clients;
                };
                AccountManager.prototype.getNumAccounts = function () {
                    return net.user1.utils.ObjectUtil.len(this.getAccounts());
                };
                AccountManager.prototype.getNumAccountsOnServer = function () {
                    return this.watchedAccounts.length();
                };
                AccountManager.prototype.getNumLoggedInAccounts = function () {
                    var count = 0;
                    var accounts = this.getAccounts();
                    for (var userID in accounts) {
                        var account = accounts[userID];
                        if (account.isLoggedIn()) {
                            count++;
                        }
                    }
                    return count;
                };
                AccountManager.prototype.hasWatchedAccount = function (userID) {
                    return this.watchedAccounts.containsUserID(userID);
                };
                AccountManager.prototype.isObservingAccount = function (userID) {
                    return this.observedAccounts.containsUserID(userID);
                };
                AccountManager.prototype.isWatchingForAccounts = function () {
                    return this._isWatchingForAccounts;
                };
                AccountManager.prototype.login = function (userID, password) {
                    var _a, _b, _c;
                    if (((_b = (_a = this.clientManager) === null || _a === void 0 ? void 0 : _a.self()) === null || _b === void 0 ? void 0 : _b.getConnectionState()) == orbiter.ConnectionState.LOGGED_IN) {
                        this.log.warn("[ACCOUNT_MANAGER] User [" + userID + "]: Login attempt ignored. Already logged in. Current client must logoff before logging in again.");
                        this.fireLoginResult(userID, orbiter.Status.ERROR);
                    }
                    else if (!userID) {
                        this.log.warn('[ACCOUNT_MANAGER] Login attempt failed. No userID supplied.');
                    }
                    else if (!password) {
                        this.log.warn("[ACCOUNT_MANAGER] Login attempt failed for user [" + userID + "] failed. No password supplied.");
                    }
                    else {
                        (_c = this.messageManager) === null || _c === void 0 ? void 0 : _c.sendUPC(orbiter.UPC.LOGIN, userID, password);
                    }
                };
                AccountManager.prototype.logoff = function (userID, password) {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    if (userID == null) {
                        if (((_b = (_a = this.clientManager) === null || _a === void 0 ? void 0 : _a.self()) === null || _b === void 0 ? void 0 : _b.getConnectionState()) != orbiter.ConnectionState.LOGGED_IN) {
                            this.log.warn('[ACCOUNT_MANAGER] Logoff failed. The current user is not logged in.');
                        }
                        else {
                            (_e = (_d = (_c = this.clientManager) === null || _c === void 0 ? void 0 : _c.self()) === null || _d === void 0 ? void 0 : _d.getAccount()) === null || _e === void 0 ? void 0 : _e.logoff();
                        }
                    }
                    else if (userID == '') {
                        this.log.warn('[ACCOUNT_MANAGER] Logoff failed. Supplied userID must not be the empty string.');
                    }
                    else {
                        if (!password) {
                            if (((_g = (_f = this.clientManager) === null || _f === void 0 ? void 0 : _f.self()) === null || _g === void 0 ? void 0 : _g.getConnectionState()) != orbiter.ConnectionState.LOGGED_IN) {
                                this.log.warn("[ACCOUNT_MANAGER] Logoff: no password supplied. Operation will fail unless sender is an administrator.");
                            }
                            password = '';
                        }
                        (_h = this.messageManager) === null || _h === void 0 ? void 0 : _h.sendUPC(orbiter.UPC.LOGOFF, userID, password);
                    }
                };
                AccountManager.prototype.observeAccount = function (userID) {
                    var _a;
                    (_a = this.messageManager) === null || _a === void 0 ? void 0 : _a.sendUPC(orbiter.UPC.OBSERVE_ACCOUNT, userID);
                };
                AccountManager.prototype.removeAccount = function (userID, password) {
                    var _a;
                    if (!userID) {
                        this.log.warn('[ACCOUNT_MANAGER] Remove account failed. No userID supplied.');
                    }
                    else {
                        if (password == null) {
                            this.log.warn('[ACCOUNT_MANAGER] Remove account: no password supplied. Removal will fail unless sender is an administrator.');
                        }
                        (_a = this.messageManager) === null || _a === void 0 ? void 0 : _a.sendUPC(orbiter.UPC.REMOVE_ACCOUNT, userID, password);
                    }
                };
                AccountManager.prototype.removeAllObservedAccounts = function () {
                    this.observedAccounts.removeAll();
                };
                AccountManager.prototype.removeAllWatchedAccounts = function () {
                    this.watchedAccounts.removeAll();
                };
                AccountManager.prototype.removeObservedAccount = function (userID) {
                    var account = this.observedAccounts.removeByUserID(userID);
                    this.fireStopObservingAccount(userID);
                    return account !== null && account !== void 0 ? account : null;
                };
                AccountManager.prototype.removeRole = function (userID, role) {
                    var _a;
                    if (!userID) {
                        this.log.warn('[ACCOUNT_MANAGER] Remove role failed. No userID supplied.');
                    }
                    else if (!role) {
                        this.log.warn("[ACCOUNT_MANAGER] Remove role failed for account [" + userID + "]. No role supplied.");
                    }
                    else {
                        (_a = this.messageManager) === null || _a === void 0 ? void 0 : _a.sendUPC(orbiter.UPC.REMOVE_ROLE, userID, role);
                    }
                };
                AccountManager.prototype.removeWatchedAccount = function (userID) {
                    var _a;
                    return (_a = this.watchedAccounts.removeByUserID(userID)) !== null && _a !== void 0 ? _a : null;
                };
                AccountManager.prototype.requestAccount = function (userID) {
                    if (!userID)
                        return null;
                    var account = this.getAccount(userID);
                    if (!account) {
                        account = new orbiter.UserAccount(userID, this.log, this, this.clientManager, this.roomManager);
                        account.setAttributeManager(new orbiter.AttributeManager(account, this.messageManager, this.log));
                        this.accountCache.put(userID, account);
                    }
                    return account;
                };
                AccountManager.prototype.selfAccount = function () {
                    var _a, _b, _c;
                    return (_c = (_b = (_a = this.clientManager) === null || _a === void 0 ? void 0 : _a.self()) === null || _b === void 0 ? void 0 : _b.getAccount()) !== null && _c !== void 0 ? _c : null;
                };
                AccountManager.prototype.setClientManager = function (value) {
                    this.clientManager = value;
                };
                AccountManager.prototype.setIsWatchingForAccounts = function (value) {
                    this._isWatchingForAccounts = value;
                };
                AccountManager.prototype.setMessageManager = function (value) {
                    this.messageManager = value;
                };
                AccountManager.prototype.setRoomManager = function (value) {
                    this.roomManager = value;
                };
                AccountManager.prototype.stopObservingAccount = function (userID) {
                    var _a;
                    (_a = this.messageManager) === null || _a === void 0 ? void 0 : _a.sendUPC(orbiter.UPC.STOP_OBSERVING_ACCOUNT, userID);
                };
                AccountManager.prototype.stopWatchingForAccounts = function () {
                    var _a;
                    (_a = this.messageManager) === null || _a === void 0 ? void 0 : _a.sendUPC(orbiter.UPC.STOP_WATCHING_FOR_ACCOUNTS_RESULT);
                };
                AccountManager.prototype.watchForAccounts = function () {
                    var _a;
                    (_a = this.messageManager) === null || _a === void 0 ? void 0 : _a.sendUPC(orbiter.UPC.WATCH_FOR_ACCOUNTS);
                };
                AccountManager.prototype.fireAccountAdded = function (userID, account) {
                    this.dispatchEvent(new orbiter.AccountManagerEvent(orbiter.AccountManagerEvent.ACCOUNT_ADDED, userID, account));
                };
                return AccountManager;
            }(net.user1.events.EventDispatcher));
            orbiter.AccountManager = AccountManager;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var AccountManagerEvent = (function (_super) {
                __extends(AccountManagerEvent, _super);
                function AccountManagerEvent(type, userID, account, status) {
                    if (userID === void 0) { userID = null; }
                    if (account === void 0) { account = null; }
                    if (status === void 0) { status = null; }
                    var _this = _super.call(this, type) || this;
                    _this.userID = userID;
                    _this.account = account;
                    _this.status = status;
                    return _this;
                }
                AccountManagerEvent.prototype.getAccount = function () {
                    return this.account;
                };
                AccountManagerEvent.prototype.getStatus = function () {
                    return this.status;
                };
                AccountManagerEvent.prototype.getUserID = function () {
                    return this.userID;
                };
                AccountManagerEvent.prototype.toString = function () {
                    return '[object AccountManagerEvent]';
                };
                AccountManagerEvent.ACCOUNT_ADDED = 'ACCOUNT_ADDED';
                AccountManagerEvent.ACCOUNT_REMOVED = 'ACCOUNT_REMOVED';
                AccountManagerEvent.CREATE_ACCOUNT_RESULT = 'CREATE_ACCOUNT_RESULT';
                AccountManagerEvent.REMOVE_ACCOUNT_RESULT = 'REMOVE_ACCOUNT_RESULT';
                AccountManagerEvent.STOP_WATCHING_FOR_ACCOUNTS_RESULT = 'STOP_WATCHING_FOR_ACCOUNTS_RESULT';
                AccountManagerEvent.SYNCHRONIZE = 'SYNCHRONIZE';
                AccountManagerEvent.WATCH_FOR_ACCOUNTS_RESULT = 'WATCH_FOR_ACCOUNTS_RESULT';
                return AccountManagerEvent;
            }(net.user1.events.Event));
            orbiter.AccountManagerEvent = AccountManagerEvent;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var AccountSet = (function () {
                function AccountSet() {
                    this.accounts = {};
                }
                AccountSet.prototype.add = function (account) {
                    this.accounts[account.getUserID()] = account;
                };
                AccountSet.prototype.contains = function (account) {
                    return !!this.accounts[account.getUserID()];
                };
                AccountSet.prototype.containsUserID = function (userID) {
                    return userID ? !!this.getByUserID(userID) : false;
                };
                AccountSet.prototype.getAll = function () {
                    return this.accounts;
                };
                AccountSet.prototype.getByClient = function (client) {
                    for (var userID in this.accounts) {
                        var account = this.accounts[userID];
                        if (account.getInternalClient() == client) {
                            return account;
                        }
                    }
                    return null;
                };
                AccountSet.prototype.getByUserID = function (userID) {
                    var _a;
                    return (_a = this.accounts[userID]) !== null && _a !== void 0 ? _a : null;
                };
                AccountSet.prototype.length = function () {
                    var count = 0;
                    for (var userID in this.accounts) {
                        if (this.accounts.hasOwnProperty(userID))
                            count++;
                    }
                    return count;
                };
                AccountSet.prototype.remove = function (account) {
                    var acc = this.accounts[account.getUserID()];
                    delete this.accounts[acc.getUserID()];
                    return acc !== null && acc !== void 0 ? acc : null;
                };
                AccountSet.prototype.removeAll = function () {
                    this.accounts = {};
                };
                AccountSet.prototype.removeByUserID = function (userID) {
                    var account = this.accounts[userID];
                    delete this.accounts[userID];
                    return account !== null && account !== void 0 ? account : null;
                };
                return AccountSet;
            }());
            orbiter.AccountSet = AccountSet;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var AccountSnapshot = (function (_super) {
                    __extends(AccountSnapshot, _super);
                    function AccountSnapshot(userID) {
                        var _this = _super.call(this) || this;
                        _this.method = orbiter.UPC.GET_ACCOUNT_SNAPSHOT;
                        _this.args = [userID];
                        _this.hasStatus = true;
                        return _this;
                    }
                    AccountSnapshot.prototype.getAttribute = function (name, scope) {
                        var _a, _b;
                        return (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.persistentAttributes.getAttribute(name, scope)) !== null && _b !== void 0 ? _b : null;
                    };
                    AccountSnapshot.prototype.getAttributes = function () {
                        var _a, _b;
                        return (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.persistentAttributes.getAll()) !== null && _b !== void 0 ? _b : null;
                    };
                    AccountSnapshot.prototype.getUserID = function () {
                        var _a, _b;
                        return (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.userID) !== null && _b !== void 0 ? _b : null;
                    };
                    AccountSnapshot.prototype.setManifest = function (value) {
                        this.manifest = value;
                    };
                    return AccountSnapshot;
                }(snapshot.Snapshot));
                snapshot.AccountSnapshot = AccountSnapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var filters;
            (function (filters) {
                var BooleanGroup = (function () {
                    function BooleanGroup(type) {
                        this.type = type;
                        this.comparisons = [];
                    }
                    BooleanGroup.prototype.addComparison = function (comparison) {
                        if (!comparison)
                            return;
                        this.comparisons.push(comparison);
                    };
                    BooleanGroup.prototype.toXMLString = function () {
                        var s = this.type == filters.BooleanGroupType.AND ? '<and>\n' : '<or>\n';
                        for (var i = 0; i < this.comparisons.length; i++) {
                            var comparison = this.comparisons[i];
                            s += comparison.toXMLString() + '\n';
                        }
                        s += this.type == filters.BooleanGroupType.AND ? '</and>' : '</or>';
                        return s;
                    };
                    return BooleanGroup;
                }());
                filters.BooleanGroup = BooleanGroup;
            })(filters = orbiter.filters || (orbiter.filters = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var filters;
            (function (filters) {
                var AndGroup = (function (_super) {
                    __extends(AndGroup, _super);
                    function AndGroup() {
                        return _super.call(this, filters.BooleanGroupType.AND) || this;
                    }
                    return AndGroup;
                }(filters.BooleanGroup));
                filters.AndGroup = AndGroup;
            })(filters = orbiter.filters || (orbiter.filters = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var utils;
        (function (utils) {
            var ArrayUtil = (function () {
                function ArrayUtil() {
                }
                ArrayUtil.remove = function (array, item) {
                    if (item == undefined) {
                        return false;
                    }
                    else {
                        var itemIndex = array.indexOf(item);
                        if (itemIndex == -1) {
                            return false;
                        }
                        else {
                            array.splice(itemIndex, 1);
                            return true;
                        }
                    }
                };
                return ArrayUtil;
            }());
            utils.ArrayUtil = ArrayUtil;
        })(utils = user1.utils || (user1.utils = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var Attribute = (function () {
                function Attribute(name, value, oldValue, scope, byClient) {
                    this.byClient = byClient;
                    this.name = name;
                    this.oldValue = oldValue;
                    this.value = value;
                    this.scope = (scope == orbiter.Tokens.GLOBAL_ATTR) || (scope == null) ? undefined : scope;
                }
                Attribute.prototype.toString = function () {
                    var _a;
                    return "Attribute: " + ((_a = this.scope) !== null && _a !== void 0 ? _a : '' + '.') + this.name + " = " + this.value + ". Old value: " + this.oldValue;
                };
                return Attribute;
            }());
            orbiter.Attribute = Attribute;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var AttributeCollection = (function (_super) {
                __extends(AttributeCollection, _super);
                function AttributeCollection() {
                    var _this = _super.call(this) || this;
                    _this.attributes = {};
                    return _this;
                }
                AttributeCollection.prototype.clear = function () {
                    this.attributes = {};
                };
                AttributeCollection.prototype.contains = function (name, scope) {
                    return this.attributes.hasOwnProperty(scope) ? this.attributes[scope].hasOwnProperty(name) : false;
                };
                AttributeCollection.prototype.deleteAttribute = function (name, scope, byClient) {
                    var lastAttr = true;
                    var value;
                    if (this.attributes.hasOwnProperty(scope) &&
                        this.attributes[scope].hasOwnProperty(name)) {
                        value = this.attributes[scope][name];
                        delete this.attributes[scope][name];
                        for (var p in this.attributes[scope]) {
                            lastAttr = false;
                            break;
                        }
                        if (lastAttr)
                            delete this.attributes[scope];
                        this.fireDeleteAttribute(name, value, scope, byClient);
                        return true;
                    }
                    return false;
                };
                AttributeCollection.prototype.getAll = function () {
                    var attrs = {};
                    for (var attrScope in this.attributes) {
                        for (var attrName in this.attributes[attrScope]) {
                            var key = attrScope == orbiter.Tokens.GLOBAL_ATTR ? attrName : attrScope + "." + attrName;
                            attrs[key] = this.attributes[attrScope][attrName];
                        }
                    }
                    return attrs;
                };
                AttributeCollection.prototype.getAttribute = function (attrName, attrScope) {
                    var _a;
                    if (!attrScope)
                        attrScope = net.user1.orbiter.Tokens.GLOBAL_ATTR;
                    if (this.attributes.hasOwnProperty(attrScope) && this.attributes[attrScope].hasOwnProperty(attrName)) {
                        return (_a = this.attributes[attrScope][attrName]) !== null && _a !== void 0 ? _a : null;
                    }
                    else {
                        return null;
                    }
                };
                AttributeCollection.prototype.getAttributesNamesForScope = function (scope) {
                    var names = [];
                    for (var name_1 in this.attributes[scope]) {
                        names.push(name_1);
                    }
                    return names;
                };
                AttributeCollection.prototype.getByScope = function (scope) {
                    var obj = {};
                    if (!scope) {
                        for (var attrscope in this.attributes) {
                            obj[attrscope] = {};
                            for (var attrname in this.attributes[attrscope]) {
                                obj[attrscope][attrname] = this.attributes[attrscope][attrname];
                            }
                        }
                    }
                    else {
                        for (var name_2 in this.attributes[scope]) {
                            obj[name_2] = this.attributes[scope][name_2];
                        }
                    }
                    return obj;
                };
                AttributeCollection.prototype.getScopes = function () {
                    var scopes = [];
                    for (var scope in this.attributes) {
                        scopes.push(scope);
                    }
                    return scopes;
                };
                AttributeCollection.prototype.setAttribute = function (name, value, scope, byClient) {
                    if (scope === void 0) { scope = orbiter.Tokens.GLOBAL_ATTR; }
                    var scopeExists = this.attributes.hasOwnProperty(scope), attrExists = scopeExists ? this.attributes[scope].hasOwnProperty(name) : false;
                    var oldVal = '';
                    if (attrExists) {
                        oldVal = this.attributes[scope][name];
                        if (oldVal == value) {
                            return false;
                        }
                    }
                    if (!scopeExists)
                        this.attributes[scope] = {};
                    this.attributes[scope][name] = value;
                    this.fireUpdateAttribute(name, value, scope, oldVal, byClient);
                    return true;
                };
                AttributeCollection.prototype.synchronizeScope = function (scope, collection) {
                    var _a;
                    var names = this.getAttributesNamesForScope(scope);
                    for (var i = 0; i < names.length; i++) {
                        var name_3 = names[i];
                        if (!collection.contains(name_3, scope)) {
                            this.deleteAttribute(name_3, scope);
                        }
                    }
                    names = collection.getAttributesNamesForScope(scope);
                    for (var i = 0; i < names.length; i++) {
                        var name_4 = names[i];
                        this.setAttribute(name_4, (_a = collection.getAttribute(name_4, scope)) !== null && _a !== void 0 ? _a : undefined, scope);
                    }
                };
                AttributeCollection.prototype.add = function (collection) {
                    var _a;
                    var scopes = collection.getScopes();
                    for (var i = 0; i <= scopes.length; i++) {
                        var scope = scopes[i], names = collection.getAttributesNamesForScope(scope);
                        for (var j = 0; j < names.length; j++) {
                            var name_5 = names[j];
                            this.setAttribute(name_5, (_a = collection.getAttribute(name_5, scope)) !== null && _a !== void 0 ? _a : undefined, scope);
                        }
                    }
                };
                AttributeCollection.prototype.fireDeleteAttribute = function (attrName, attrValue, attrScope, byClient) {
                    var changedAttr = new orbiter.Attribute(attrName, undefined, attrValue, attrScope, byClient), e = new orbiter.AttributeEvent(orbiter.AttributeEvent.DELETE, changedAttr);
                    this.dispatchEvent(e);
                };
                AttributeCollection.prototype.fireUpdateAttribute = function (attrName, attrVal, attrScope, oldVal, byClient) {
                    var changedAttr = new orbiter.Attribute(attrName, attrVal, oldVal, attrScope, byClient), e = new orbiter.AttributeEvent(orbiter.AttributeEvent.UPDATE, changedAttr);
                    this.dispatchEvent(e);
                };
                return AttributeCollection;
            }(net.user1.events.EventDispatcher));
            orbiter.AttributeCollection = AttributeCollection;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var filters;
            (function (filters) {
                var AttributeComparison = (function () {
                    function AttributeComparison(name, value, compareType) {
                        this.name = name;
                        this.value = value;
                        this.compareType = compareType;
                        if (!orbiter.Validator.isValidAttributeName(name)) {
                            throw new Error("Invalid attribute name specified for AttributeComparison: " + name);
                        }
                    }
                    AttributeComparison.prototype.toXMLString = function () {
                        return "<a c=\"" + this.compareType + "\"><n><![CDATA[" + this.name + "]]></n><v><![CDATA[" + this.value.toString() + "]]></v></a>";
                    };
                    return AttributeComparison;
                }());
                filters.AttributeComparison = AttributeComparison;
            })(filters = orbiter.filters || (orbiter.filters = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var AttributeEvent = (function (_super) {
                __extends(AttributeEvent, _super);
                function AttributeEvent(type, changedAttr, status) {
                    if (status === void 0) { status = null; }
                    var _this = _super.call(this, type) || this;
                    _this.changedAttr = changedAttr;
                    _this.status = status;
                    return _this;
                }
                AttributeEvent.prototype.getChangedAttr = function () {
                    return this.changedAttr;
                };
                AttributeEvent.prototype.getStatus = function () {
                    return this.status;
                };
                AttributeEvent.prototype.toString = function () {
                    return '[object AttributeEvent]';
                };
                AttributeEvent.DELETE = 'DELETE';
                AttributeEvent.DELETE_RESULT = 'DELETE_RESULT';
                AttributeEvent.SET_RESULT = 'SET_RESULT';
                AttributeEvent.UPDATE = 'UPDATE';
                return AttributeEvent;
            }(net.user1.events.Event));
            orbiter.AttributeEvent = AttributeEvent;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var filters;
            (function (filters) {
                var Filter = (function (_super) {
                    __extends(Filter, _super);
                    function Filter(filterType) {
                        var _this = _super.call(this) || this;
                        _this.filterType = filterType;
                        return _this;
                    }
                    Filter.prototype.toXMLString = function () {
                        var s = "<f t=\"" + this.filterType + "\">\n";
                        var comparison;
                        for (var i = 0; i < this.comparisons.length; i++) {
                            comparison = this.comparisons[i];
                            s += comparison.toXMLString() + "\n";
                        }
                        s += '</f>';
                        return s;
                    };
                    return Filter;
                }(filters.AndGroup));
                filters.Filter = Filter;
            })(filters = orbiter.filters || (orbiter.filters = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var filters;
            (function (filters) {
                var AttributeFilter = (function (_super) {
                    __extends(AttributeFilter, _super);
                    function AttributeFilter() {
                        return _super.call(this, 'A') || this;
                    }
                    return AttributeFilter;
                }(filters.Filter));
                filters.AttributeFilter = AttributeFilter;
            })(filters = orbiter.filters || (orbiter.filters = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var AttributeManager = (function (_super) {
                __extends(AttributeManager, _super);
                function AttributeManager(owner, messageManager, log) {
                    if (owner === void 0) { owner = null; }
                    if (messageManager === void 0) { messageManager = null; }
                    if (log === void 0) { log = null; }
                    var _this = _super.call(this) || this;
                    _this.owner = owner;
                    _this.messageManager = messageManager;
                    _this.log = log;
                    _this.attributes = null;
                    _this.setAttributeCollection(new orbiter.AttributeCollection());
                    return _this;
                }
                AttributeManager.prototype.deleteAttribute = function (deleteRequest) {
                    var _a;
                    (_a = this.messageManager) === null || _a === void 0 ? void 0 : _a.sendUPCObject(deleteRequest);
                };
                AttributeManager.prototype.deleteAttributeListener = function (e) {
                    var _a;
                    (_a = this.owner) === null || _a === void 0 ? void 0 : _a.dispatchEvent(e);
                };
                AttributeManager.prototype.dispose = function () {
                    this.messageManager = null;
                    this.attributes = null;
                    this.owner = null;
                    this.log = null;
                };
                AttributeManager.prototype.fireDeleteAttributeResult = function (attrName, attrScope, status) {
                    var _a;
                    var attr = new orbiter.Attribute(attrName, undefined, undefined, attrScope);
                    var e = new orbiter.AttributeEvent(orbiter.AttributeEvent.DELETE_RESULT, attr, status);
                    (_a = this.owner) === null || _a === void 0 ? void 0 : _a.dispatchEvent(e);
                };
                AttributeManager.prototype.fireSetAttributeResult = function (attrName, attrScope, status) {
                    var _a;
                    var attr = new orbiter.Attribute(attrName, undefined, undefined, attrScope);
                    var e = new orbiter.AttributeEvent(orbiter.AttributeEvent.SET_RESULT, attr, status);
                    (_a = this.owner) === null || _a === void 0 ? void 0 : _a.dispatchEvent(e);
                };
                AttributeManager.prototype.getAttribute = function (attrName, attrScope) {
                    var _a, _b;
                    return (_b = (_a = this.attributes) === null || _a === void 0 ? void 0 : _a.getAttribute(attrName, attrScope)) !== null && _b !== void 0 ? _b : null;
                };
                AttributeManager.prototype.getAttributeCollection = function () {
                    return this.attributes;
                };
                AttributeManager.prototype.getAttributes = function () {
                    var _a, _b;
                    return (_b = (_a = this.attributes) === null || _a === void 0 ? void 0 : _a.getAll()) !== null && _b !== void 0 ? _b : null;
                };
                AttributeManager.prototype.getAttributesByScope = function (scope) {
                    var _a, _b;
                    return (_b = (_a = this.attributes) === null || _a === void 0 ? void 0 : _a.getByScope(scope)) !== null && _b !== void 0 ? _b : null;
                };
                AttributeManager.prototype.registerAttributeListeners = function () {
                    var _a, _b;
                    (_a = this.attributes) === null || _a === void 0 ? void 0 : _a.addEventListener(orbiter.AttributeEvent.UPDATE, this.updateAttributeListener, this, integer.MAX_VALUE);
                    (_b = this.attributes) === null || _b === void 0 ? void 0 : _b.addEventListener(orbiter.AttributeEvent.DELETE, this.deleteAttributeListener, this, integer.MAX_VALUE);
                };
                AttributeManager.prototype.removeAll = function () {
                    var _a;
                    (_a = this.attributes) === null || _a === void 0 ? void 0 : _a.clear();
                };
                AttributeManager.prototype.removeAttributeLocal = function (attrName, attrScope, byClient) {
                    var _a, _b;
                    if (!((_a = this.attributes) === null || _a === void 0 ? void 0 : _a.deleteAttribute(attrName, attrScope, byClient)))
                        (_b = this.log) === null || _b === void 0 ? void 0 : _b.info(this.owner + " Delete attribute failed for [" + attrName + "]. No such attribute.");
                };
                AttributeManager.prototype.setAttribute = function (setRequest) {
                    var _a;
                    (_a = this.messageManager) === null || _a === void 0 ? void 0 : _a.sendUPCObject(setRequest);
                };
                AttributeManager.prototype.setAttributeCollection = function (value) {
                    this.unregisterAttributeListeners();
                    this.attributes = value;
                    this.registerAttributeListeners();
                };
                AttributeManager.prototype.setAttributeLocal = function (attrName, attrVal, attrScope, byClient) {
                    var _a, _b;
                    if (!((_a = this.attributes) === null || _a === void 0 ? void 0 : _a.setAttribute(attrName, attrVal, attrScope, byClient)))
                        (_b = this.log) === null || _b === void 0 ? void 0 : _b.info(this.owner + " New attribute value for [" + attrName + "] matches old value. Not changed.");
                };
                AttributeManager.prototype.unregisterAttributeListeners = function () {
                    var _a, _b;
                    (_a = this.attributes) === null || _a === void 0 ? void 0 : _a.removeEventListener(orbiter.AttributeEvent.UPDATE, this.updateAttributeListener, this);
                    (_b = this.attributes) === null || _b === void 0 ? void 0 : _b.removeEventListener(orbiter.AttributeEvent.DELETE, this.deleteAttributeListener, this);
                };
                AttributeManager.prototype.updateAttributeListener = function (e) {
                    var _a, _b, _c;
                    var attr = e.getChangedAttr();
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this.owner + " Setting attribute [" + ((_b = attr.scope) !== null && _b !== void 0 ? _b : '' + '.') + attr.name + "]. New value: [" + attr.value + "]. Old value: [" + attr.oldValue + "].");
                    (_c = this.owner) === null || _c === void 0 ? void 0 : _c.dispatchEvent(e);
                };
                return AttributeManager;
            }(net.user1.events.EventDispatcher));
            orbiter.AttributeManager = AttributeManager;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var AttributeOptions;
            (function (AttributeOptions) {
                AttributeOptions[AttributeOptions["FLAG_SHARED"] = 4] = "FLAG_SHARED";
                AttributeOptions[AttributeOptions["FLAG_PERSISTENT"] = 8] = "FLAG_PERSISTENT";
                AttributeOptions[AttributeOptions["FLAG_IMMUTABLE"] = 32] = "FLAG_IMMUTABLE";
                AttributeOptions[AttributeOptions["FLAG_EVALUATE"] = 256] = "FLAG_EVALUATE";
            })(AttributeOptions = orbiter.AttributeOptions || (orbiter.AttributeOptions = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var BannedListSnapshot = (function (_super) {
                    __extends(BannedListSnapshot, _super);
                    function BannedListSnapshot() {
                        var _this = _super.call(this) || this;
                        _this.method = orbiter.UPC.GET_BANNED_LIST_SNAPSHOT;
                        return _this;
                    }
                    BannedListSnapshot.prototype.getBannedList = function () {
                        var _a, _b;
                        return (_b = (_a = this.bannedList) === null || _a === void 0 ? void 0 : _a.slice()) !== null && _b !== void 0 ? _b : null;
                    };
                    BannedListSnapshot.prototype.setBannedList = function (value) {
                        this.bannedList = value;
                    };
                    return BannedListSnapshot;
                }(snapshot.Snapshot));
                snapshot.BannedListSnapshot = BannedListSnapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var filters;
            (function (filters) {
                var BooleanGroupType;
                (function (BooleanGroupType) {
                    BooleanGroupType["AND"] = "AND";
                    BooleanGroupType["OR"] = "OR";
                })(BooleanGroupType = filters.BooleanGroupType || (filters.BooleanGroupType = {}));
            })(filters = orbiter.filters || (orbiter.filters = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var utils;
        (function (utils) {
            var CacheNode = (function () {
                function CacheNode() {
                }
                return CacheNode;
            }());
            utils.CacheNode = CacheNode;
        })(utils = user1.utils || (user1.utils = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var Client = (function (_super) {
                __extends(Client, _super);
                function Client(clientID, clientManager, messageManager, roomManager, connectionManager, server, log) {
                    var _this = _super.call(this) || this;
                    _this.clientManager = clientManager;
                    _this.messageManager = messageManager;
                    _this.roomManager = roomManager;
                    _this.connectionManager = connectionManager;
                    _this.server = server;
                    _this.log = log;
                    _this._isSelf = false;
                    _this.account = null;
                    _this.clientID = '';
                    _this.connectionState = orbiter.ConnectionState.UNKNOWN;
                    _this.customClients = {};
                    _this.disposed = false;
                    _this.observedRoomIDs = [];
                    _this.occupiedRoomIDs = [];
                    _this.attributeManager = new orbiter.AttributeManager(_this, _this.messageManager, _this.log);
                    _this.setClientID(clientID);
                    return _this;
                }
                Client.prototype.addObservedRoomID = function (roomID) {
                    if (!this.isObservingRoom(roomID) && roomID != null) {
                        this.log.info("Client [" + this.getClientID() + "] added observed room ID [" + roomID + "].");
                        this.observedRoomIDs.push(roomID);
                    }
                };
                Client.prototype.addOccupiedRoomID = function (roomID) {
                    if (!this.isInRoom(roomID) && roomID != null) {
                        this.log.info(this.toString() + " added occupied room ID [" + roomID + "].");
                        this.occupiedRoomIDs.push(roomID);
                    }
                };
                Client.prototype.ban = function (duration, reason) {
                    if (this.getClientID() == null) {
                        this.log.warn(this + " Ban attempt failed. Client not currently connected.");
                    }
                    this.messageManager.sendUPC(orbiter.UPC.BAN, undefined, this.getClientID(), duration.toString(), reason);
                };
                Client.prototype.createCustomClient = function (wrapperClass, scope) {
                    var customClient = new wrapperClass();
                    this.customClients[scope] = customClient;
                    if (customClient instanceof orbiter.CustomClient) {
                        customClient.setClient(this);
                        customClient.init();
                        return customClient;
                    }
                    else {
                        this.log.debug("[CLIENT_MANAGER] Custom client class [" + wrapperClass + "] does not  extend CustomClient. Assuming specified class will manually  compose its own Client instance for client ID: " + this.clientID + ". See Client.setClientClass().");
                        return customClient;
                    }
                };
                Client.prototype.deleteAttribute = function (attrName, attrScope) {
                    var deleteRequest = new orbiter.upc.RemoveClientAttr(this.getClientID(), undefined, attrName, attrScope);
                    this.attributeManager.deleteAttribute(deleteRequest);
                };
                Client.prototype.dispose = function () {
                    this.occupiedRoomIDs = undefined;
                    this.attributeManager.dispose();
                    this.attributeManager = undefined;
                    this.clientID = undefined;
                    this.log = undefined;
                    this.account = null;
                    this.customClients = undefined;
                    this.messageManager = undefined;
                    this.clientManager = undefinedl;
                    this.roomManager = undefined;
                    this.server = undefined;
                    this.disposed = true;
                };
                Client.prototype.fireJoinRoom = function (room, roomID) {
                    this.log.debug(this + " triggering ClientEvent.JOIN_ROOM event.");
                    var e = new orbiter.ClientEvent(orbiter.ClientEvent.JOIN_ROOM, undefined, room, roomID, this);
                    this.dispatchEvent(e);
                };
                Client.prototype.fireLeaveRoom = function (room, roomID) {
                    this.log.debug(this + " triggering ClientEvent.LEAVE_ROOM event.");
                    var e = new orbiter.ClientEvent(orbiter.ClientEvent.LEAVE_ROOM, undefined, room, roomID, this);
                    this.dispatchEvent(e);
                };
                Client.prototype.fireLogin = function () {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.LOGIN, orbiter.Status.SUCCESS, (_a = this.getAccount()) === null || _a === void 0 ? void 0 : _a.getUserID(), this.getClientID());
                    this.dispatchEvent(e);
                };
                Client.prototype.fireLogoff = function (userID) {
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.LOGOFF, orbiter.Status.SUCCESS, userID, this.getClientID());
                    this.dispatchEvent(e);
                };
                Client.prototype.fireObserve = function () {
                    var e = new orbiter.ClientEvent(orbiter.ClientEvent.OBSERVE, undefined, undefined, undefined, this);
                    this.dispatchEvent(e);
                };
                Client.prototype.fireObserveResult = function (status) {
                    var e = new orbiter.ClientEvent(orbiter.ClientEvent.OBSERVE_RESULT, undefined, undefined, undefined, this, status);
                    this.dispatchEvent(e);
                };
                Client.prototype.fireObserveRoom = function (room, roomID) {
                    this.log.debug(this + " triggering ClientEvent.OBSERVE_ROOM event.");
                    var e = new orbiter.ClientEvent(orbiter.ClientEvent.OBSERVE_ROOM, undefined, room, roomID, this);
                    this.dispatchEvent(e);
                };
                Client.prototype.fireStopObserving = function () {
                    var e = new orbiter.ClientEvent(orbiter.ClientEvent.STOP_OBSERVING, undefined, undefined, undefined, this);
                    this.dispatchEvent(e);
                };
                Client.prototype.fireStopObservingResult = function (status) {
                    var e = new orbiter.ClientEvent(orbiter.ClientEvent.STOP_OBSERVING_RESULT, undefined, undefined, undefined, this, status);
                    this.dispatchEvent(e);
                };
                Client.prototype.fireStopObservingRoom = function (room, roomID) {
                    this.log.debug(this + " triggering ClientEvent.STOP_OBSERVING_ROOM event.");
                    var e = new orbiter.ClientEvent(orbiter.ClientEvent.STOP_OBSERVING_ROOM, undefined, room, roomID, this);
                    this.dispatchEvent(e);
                };
                Client.prototype.fireSynchronize = function () {
                    var e = new orbiter.ClientEvent(orbiter.ClientEvent.SYNCHRONIZE, undefined, undefined, undefined, this);
                    this.dispatchEvent(e);
                };
                Client.prototype.getAccount = function () {
                    return this.account;
                };
                Client.prototype.getAttribute = function (attrName, attrScope) {
                    return this.attributeManager.getAttribute(attrName, attrScope);
                };
                Client.prototype.getAttributeManager = function () {
                    return this.attributeManager;
                };
                Client.prototype.getAttributes = function () {
                    return this.attributeManager.getAttributes();
                };
                Client.prototype.getAttributesByScope = function (scope) {
                    return this.attributeManager.getAttributesByScope(scope);
                };
                Client.prototype.getClientClass = function (scope) {
                    var clientClassNames = this.getAttribute(orbiter.Tokens.CUSTOM_CLASS_ATTR, scope);
                    var clientClassList;
                    if (clientClassNames) {
                        clientClassList = clientClassNames.split(' ');
                    }
                    if (clientClassList != null) {
                        for (var i = 0; i < clientClassList.length; i++) {
                            var className = clientClassList[i];
                            try {
                                var theClass = this.resolveMemberExpression(className);
                                if (!(theClass instanceof Function)) {
                                    this.log.debug(this.toString() + ": Definition for client class [" + className + "] is not a constructor function.");
                                    continue;
                                }
                                return theClass;
                            }
                            catch (e) {
                                this.log.debug(this.toString() + ": No definition found for client class [" + className + "]");
                            }
                        }
                    }
                    return null;
                };
                Client.prototype.getClientID = function () {
                    return this.clientID;
                };
                Client.prototype.getClientManager = function () {
                    return this.clientManager;
                };
                Client.prototype.getConnectTime = function () {
                    var ct = this.getAttribute('_CT');
                    return parseFloat(ct !== null && ct !== void 0 ? ct : '');
                };
                Client.prototype.getConnectionState = function () {
                    var _a, _b, _c, _d;
                    if (this.isSelf()) {
                        if (this.disposed || !this.clientManager.getInternalClient(this.getClientID())) {
                            return orbiter.ConnectionState.NOT_CONNECTED;
                        }
                        else {
                            return (_b = (_a = this.account) === null || _a === void 0 ? void 0 : _a.getConnectionState()) !== null && _b !== void 0 ? _b : this.connectionManager.getConnectionState();
                        }
                    }
                    else {
                        if (this.connectionState != orbiter.ConnectionState.UNKNOWN) {
                            return this.connectionState;
                        }
                        else if (this.disposed || !this.clientManager.getInternalClient(this.getClientID())) {
                            return orbiter.ConnectionState.UNKNOWN;
                        }
                        else {
                            return (_d = (_c = this.account) === null || _c === void 0 ? void 0 : _c.getConnectionState()) !== null && _d !== void 0 ? _d : orbiter.ConnectionState.READY;
                        }
                    }
                };
                Client.prototype.getCustomClient = function (scope) {
                    if (scope) {
                        var customClient = this.customClients[scope];
                        if (customClient) {
                            return customClient;
                        }
                    }
                    if (scope == null) {
                        return this.setGlobalCustomClient();
                    }
                    else {
                        return this.setCustomClientForScope(scope);
                    }
                };
                Client.prototype.getIP = function () {
                    return this.getAttribute('_IP');
                };
                Client.prototype.getObservedRoomIDs = function () {
                    if (this.clientManager.isObservingClient(this.getClientID())) {
                        return this.observedRoomIDs.slice(0);
                    }
                    else {
                        var knownRooms = this.roomManager.getRooms(), ids = [];
                        for (var i = 0, numKnownRooms = knownRooms.length; i < numKnownRooms; i++) {
                            var room = knownRooms[i];
                            if (room.clientIsObservingRoom(this.getClientID())) {
                                ids.push(room.getRoomID());
                            }
                        }
                        return ids;
                    }
                };
                Client.prototype.getOccupiedRoomIDs = function () {
                    if (this.clientManager.isObservingClient(this.getClientID())) {
                        return this.occupiedRoomIDs.slice(0);
                    }
                    else {
                        var knownRooms = this.roomManager.getRooms(), ids = [];
                        for (var i = 0, numKnownRooms = knownRooms.length; i < numKnownRooms; i++) {
                            var room = knownRooms[i];
                            if (room.clientIsInRoom(this.getClientID())) {
                                ids.push(room.getRoomID());
                            }
                        }
                        return ids;
                    }
                };
                Client.prototype.getPing = function () {
                    var ping = this.getAttribute('_PING');
                    return ping == null ? -1 : parseInt(ping);
                };
                Client.prototype.getTimeOnline = function () {
                    return !this.server ? NaN : this.server.getServerTime() - this.getConnectTime();
                };
                Client.prototype.getUpdateLevels = function (roomID) {
                    var levelsAttr = this.getAttribute('_UL', roomID);
                    if (levelsAttr != null) {
                        var levels = new orbiter.UpdateLevels();
                        levels.fromInt(parseInt(levelsAttr));
                        return levels;
                    }
                    else {
                        return null;
                    }
                };
                Client.prototype.isAdmin = function () {
                    var rolesAttr = this.getAttribute(orbiter.Tokens.ROLES_ATTR);
                    if (rolesAttr != null) {
                        return (parseInt(rolesAttr) & Client.FLAG_ADMIN) == 1;
                    }
                    else {
                        this.log.warn("[" + this.toString() + "] Could not determine admin status because the client is not synchronized.");
                        return false;
                    }
                };
                Client.prototype.isInRoom = function (roomID) {
                    return this.getOccupiedRoomIDs().indexOf(roomID) != -1;
                };
                Client.prototype.isObservingRoom = function (roomID) {
                    return this.getObservedRoomIDs().indexOf(roomID) != -1;
                };
                Client.prototype.isSelf = function () {
                    return this._isSelf;
                };
                Client.prototype.kick = function () {
                    if (this.getClientID() == null) {
                        this.log.warn(this + " Kick attempt failed. Client not currently connected.");
                    }
                    this.messageManager.sendUPC(orbiter.UPC.KICK_CLIENT, this.getClientID());
                };
                Client.prototype.observe = function () {
                    this.messageManager.sendUPC(orbiter.UPC.OBSERVE_CLIENT, this.clientID);
                };
                Client.prototype.removeObservedRoomID = function (roomID) {
                    if (this.isObservingRoom(roomID) && roomID != null) {
                        this.observedRoomIDs.splice(this.observedRoomIDs.indexOf(roomID), 1);
                        return true;
                    }
                    else {
                        return false;
                    }
                };
                Client.prototype.removeOccupiedRoomID = function (roomID) {
                    if (this.isInRoom(roomID) && roomID != null) {
                        this.occupiedRoomIDs.splice(this.occupiedRoomIDs.indexOf(roomID), 1);
                        return true;
                    }
                    else {
                        return false;
                    }
                };
                Client.prototype.resolveMemberExpression = function (value) {
                    var parts = value.split('.');
                    var reference = globalObject !== null && globalObject !== void 0 ? globalObject : {};
                    for (var i = 0; i < parts.length; i++)
                        reference = reference[parts[i]];
                    return reference;
                };
                Client.prototype.sendMessage = function (messageName) {
                    var _a;
                    var rest = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        rest[_i - 1] = arguments[_i];
                    }
                    if (!this.clientManager) {
                        return;
                    }
                    (_a = this.clientManager).sendMessage.apply(_a, __spreadArrays([messageName, [this.getClientID()], null], rest));
                };
                Client.prototype.setAccount = function (value) {
                    if (!value) {
                        this.account = null;
                    }
                    else {
                        if (this.account != value) {
                            this.account = value;
                            this.account.setClient(this);
                        }
                    }
                };
                Client.prototype.setAttribute = function (attrName, attrValue, attrScope, isShared, evaluate) {
                    if (isShared === void 0) { isShared = true; }
                    if (evaluate === void 0) { evaluate = false; }
                    var attrOptions = (isShared ? orbiter.AttributeOptions.FLAG_SHARED : 0) |
                        (evaluate ? orbiter.AttributeOptions.FLAG_EVALUATE : 0);
                    var setClientAttr = new orbiter.upc.SetClientAttr(attrName, attrValue, attrOptions, attrScope, this.getClientID());
                    if (!(!this.isSelf() || evaluate)) {
                        this.attributeManager.setAttributeLocal(attrName, attrValue, attrScope, this);
                    }
                    this.messageManager.sendUPCObject(setClientAttr);
                };
                Client.prototype.setClientClass = function (scope, clientClass) {
                    var fallbackClasses = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        fallbackClasses[_i - 2] = arguments[_i];
                    }
                    if (!this.isSelf()) {
                        throw new Error("Custom client class assignment failed for : " + clientClass + ". A custom class can be set for the current client ( i.e., ClientManager.self()) only.");
                    }
                    fallbackClasses.unshift(clientClass);
                    var classList = fallbackClasses.join(' ');
                    this.setAttribute(orbiter.Tokens.CUSTOM_CLASS_ATTR, classList, scope);
                };
                Client.prototype.setClientID = function (id) {
                    if (this.clientID != id)
                        this.clientID = id;
                };
                Client.prototype.setConnectionState = function (newState) {
                    this.connectionState = newState;
                };
                Client.prototype.setCustomClientForScope = function (scope) {
                    var clientClass = this.getClientClass(scope);
                    if (clientClass) {
                        return this.createCustomClient(clientClass, scope);
                    }
                    var theRoom = this.roomManager.getRoom(scope);
                    if (theRoom) {
                        var roomDefaultClientClass = theRoom.getDefaultClientClass();
                        if (roomDefaultClientClass) {
                            return this.createCustomClient(roomDefaultClientClass, scope);
                        }
                    }
                    var customClient = this.customClients[null];
                    if (customClient) {
                        return customClient;
                    }
                    else {
                        var globalDefaultClientClass = this.clientManager.getDefaultClientClass();
                        if (!globalDefaultClientClass) {
                            return null;
                        }
                        else {
                            return this.createCustomClient(globalDefaultClientClass, undefined);
                        }
                    }
                };
                Client.prototype.setGlobalCustomClient = function () {
                    var defaultClientClass = this.getClientClass();
                    if (defaultClientClass) {
                        return this.createCustomClient(defaultClientClass, undefined);
                    }
                    var globalDefaultClientClass = this.clientManager.getDefaultClientClass();
                    if (!globalDefaultClientClass) {
                        return null;
                    }
                    else {
                        return this.createCustomClient(globalDefaultClientClass, undefined);
                    }
                };
                Client.prototype.setIsSelf = function () {
                    this._isSelf = true;
                };
                Client.prototype.stopObserving = function () {
                    this.messageManager.sendUPC(orbiter.UPC.STOP_OBSERVING_CLIENT, this.clientID);
                };
                Client.prototype.synchronize = function (clientManifest) {
                    var _a, _b, _c;
                    this.synchronizeOccupiedRoomIDs(clientManifest.occupiedRoomIDs);
                    this.synchronizeObservedRoomIDs(clientManifest.observedRoomIDs);
                    var scopes = clientManifest.transientAttributes.getScopes();
                    for (var i = scopes.length; --i >= 0;) {
                        (_a = this.attributeManager.getAttributeCollection()) === null || _a === void 0 ? void 0 : _a.synchronizeScope(scopes[i], clientManifest.transientAttributes);
                    }
                    if (this.account) {
                        var scopes_1 = clientManifest.persistentAttributes.getScopes();
                        for (var i = scopes_1.length; --i >= 0;) {
                            (_c = (_b = this.account.getAttributeManager()) === null || _b === void 0 ? void 0 : _b.getAttributeCollection()) === null || _c === void 0 ? void 0 : _c.synchronizeScope(scopes_1[i], clientManifest.persistentAttributes);
                        }
                    }
                };
                Client.prototype.synchronizeObservedRoomIDs = function (newObservedRoomIDs) {
                    if (!newObservedRoomIDs) {
                        return;
                    }
                    for (var i = this.observedRoomIDs.length; --i >= 0;) {
                        var roomID = this.observedRoomIDs[i];
                        if (newObservedRoomIDs.indexOf(roomID) == -1) {
                            this.removeObservedRoomID(roomID);
                        }
                    }
                    for (var i = newObservedRoomIDs.length; --i >= 0;) {
                        var roomID = newObservedRoomIDs[i];
                        this.addObservedRoomID(roomID);
                    }
                };
                Client.prototype.synchronizeOccupiedRoomIDs = function (newOccupiedRoomIDs) {
                    if (!newOccupiedRoomIDs) {
                        return;
                    }
                    for (var i = this.occupiedRoomIDs.length; --i >= 0;) {
                        var roomID = this.occupiedRoomIDs[i];
                        if (newOccupiedRoomIDs.indexOf(roomID) == -1) {
                            this.removeOccupiedRoomID(roomID);
                        }
                    }
                    for (var i = newOccupiedRoomIDs.length; --i >= 0;) {
                        var roomID = newOccupiedRoomIDs[i];
                        this.addOccupiedRoomID(roomID);
                    }
                };
                Client.prototype.toString = function () {
                    var _a;
                    return "[CLIENT clientID: " + this.getClientID() + ", userID: " + ((_a = this.account) === null || _a === void 0 ? void 0 : _a.getUserID()) + "]";
                };
                Client.FLAG_ADMIN = 1 << 2;
                return Client;
            }(net.user1.events.EventDispatcher));
            orbiter.Client = Client;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var ClientCountSnapshot = (function (_super) {
                    __extends(ClientCountSnapshot, _super);
                    function ClientCountSnapshot() {
                        var _this = _super.call(this) || this;
                        _this.count = 0;
                        _this.method = orbiter.UPC.GET_CLIENTCOUNT_SNAPSHOT;
                        _this.hasStatus = true;
                        return _this;
                    }
                    ClientCountSnapshot.prototype.setCount = function (value) {
                        this.count = value;
                    };
                    ClientCountSnapshot.prototype.getCount = function () {
                        return this.count;
                    };
                    return ClientCountSnapshot;
                }(snapshot.Snapshot));
                snapshot.ClientCountSnapshot = ClientCountSnapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ClientEvent = (function (_super) {
                __extends(ClientEvent, _super);
                function ClientEvent(type, changedAttr, room, roomID, client, status, clientID) {
                    var _this = _super.call(this, type) || this;
                    _this.changedAttr = changedAttr;
                    _this.room = room;
                    _this.roomID = roomID;
                    _this.client = client;
                    _this.status = status;
                    _this.clientID = clientID;
                    return _this;
                }
                ClientEvent.prototype.getClient = function () {
                    var _a;
                    return (_a = this.client) !== null && _a !== void 0 ? _a : null;
                };
                ClientEvent.prototype.getClientID = function () {
                    var _a;
                    if (this.client) {
                        return this.client.getClientID();
                    }
                    else {
                        return (_a = this.clientID) !== null && _a !== void 0 ? _a : null;
                    }
                };
                ClientEvent.prototype.getRoom = function () {
                    var _a;
                    return (_a = this.room) !== null && _a !== void 0 ? _a : null;
                };
                ClientEvent.prototype.getRoomID = function () {
                    var _a;
                    return (_a = this.roomID) !== null && _a !== void 0 ? _a : null;
                };
                ClientEvent.prototype.getStatus = function () {
                    var _a;
                    return (_a = this.status) !== null && _a !== void 0 ? _a : null;
                };
                ClientEvent.prototype.toString = function () {
                    return '[object ClientEvent]';
                };
                ClientEvent.JOIN_ROOM = 'JOIN_ROOM';
                ClientEvent.LEAVE_ROOM = 'LEAVE_ROOM';
                ClientEvent.OBSERVE = 'OBSERVE';
                ClientEvent.OBSERVE_RESULT = 'OBSERVE_RESULT';
                ClientEvent.OBSERVE_ROOM = 'OBSERVE_ROOM';
                ClientEvent.STOP_OBSERVING = 'STOP_OBSERVING';
                ClientEvent.STOP_OBSERVING_RESULT = 'STOP_OBSERVING_RESULT';
                ClientEvent.STOP_OBSERVING_ROOM = 'STOP_OBSERVING_ROOM';
                ClientEvent.SYNCHRONIZE = 'SYNCHRONIZE';
                return ClientEvent;
            }(net.user1.events.Event));
            orbiter.ClientEvent = ClientEvent;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var ClientListSnapshot = (function (_super) {
                    __extends(ClientListSnapshot, _super);
                    function ClientListSnapshot() {
                        var _this = _super.call(this) || this;
                        _this.method = orbiter.UPC.GET_CLIENTLIST_SNAPSHOT;
                        return _this;
                    }
                    ClientListSnapshot.prototype.setClientList = function (value) {
                        this.clientList = value;
                    };
                    ClientListSnapshot.prototype.getClientList = function () {
                        var _a, _b;
                        return (_b = (_a = this.clientList) === null || _a === void 0 ? void 0 : _a.slice()) !== null && _b !== void 0 ? _b : null;
                    };
                    return ClientListSnapshot;
                }(snapshot.Snapshot));
                snapshot.ClientListSnapshot = ClientListSnapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var LRUCache = net.user1.utils.LRUCache;
            var ClientManager = (function (_super) {
                __extends(ClientManager, _super);
                function ClientManager(roomManager, accountManager, connectionManager, messageManager, server, log) {
                    var _this = _super.call(this) || this;
                    _this.roomManager = roomManager;
                    _this.accountManager = accountManager;
                    _this.connectionManager = connectionManager;
                    _this.messageManager = messageManager;
                    _this.server = server;
                    _this.log = log;
                    _this._isWatchingForBannedAddresses = false;
                    _this._isWatchingForClients = false;
                    _this._isWatchingForUsers = false;
                    _this.bannedAddresses = [];
                    _this.clientCache = new LRUCache(5000);
                    _this.defaultClientClass = null;
                    _this.lifetimeClientsRequested = 0;
                    _this.observedClients = new orbiter.ClientSet();
                    _this.selfReference = null;
                    _this.watchedClients = new orbiter.ClientSet();
                    return _this;
                }
                ClientManager.prototype.addObservedClient = function (client) {
                    var customClient = client.getCustomClient();
                    this.observedClients.add(client);
                    this.fireObserveClient(customClient !== null && customClient !== void 0 ? customClient : client);
                };
                ClientManager.prototype.addWatchedBannedAddress = function (address) {
                    this.bannedAddresses.push(address);
                    this.fireAddressBanned(address);
                };
                ClientManager.prototype.addWatchedClient = function (client) {
                    var customClient = client.getCustomClient();
                    this.watchedClients.add(client);
                    this.fireClientConnected(customClient !== null && customClient !== void 0 ? customClient : client);
                };
                ClientManager.prototype.ban = function (address, duration, reason) {
                    this.messageManager.sendUPC(net.user1.orbiter.UPC.BAN, address, undefined, duration.toString(), reason);
                };
                ClientManager.prototype.cleanup = function () {
                    this.log.info('[CLIENT_MANAGER] Cleaning resources.');
                    this.selfReference = null;
                    this.removeAllObservedClients();
                    this.removeAllWatchedClients();
                    this.setIsWatchingForClients(false);
                };
                ClientManager.prototype.clientIsKnown = function (clientID) {
                    return !!this.getInternalClients()[clientID];
                };
                ClientManager.prototype.deserializeWatchedClients = function (ids) {
                    var _a;
                    var idList = ids.split(net.user1.orbiter.Tokens.RS), idHash = {}, localClients = this.watchedClients.getAll(), len = idList.length;
                    this.setIsWatchingForClients(true);
                    for (var i = len - 2; i >= 0; i -= 2) {
                        idHash[idList[i]] = idList[i + 1];
                    }
                    for (var clientID in localClients) {
                        if (!idHash.hasOwnProperty(clientID)) {
                            delete localClients[clientID];
                        }
                    }
                    for (var clientID in idHash) {
                        if (clientID != '') {
                            if (!this.watchedClients.containsClientID(clientID)) {
                                var theClient = this.requestClient(clientID), accountID = idHash[clientID];
                                if (accountID != '') {
                                    theClient.setAccount((_a = this.accountManager.requestAccount(accountID)) !== null && _a !== void 0 ? _a : undefined);
                                }
                                this.addWatchedClient(theClient);
                            }
                        }
                        else {
                            throw new Error('[CLIENT_MANAGER] Received empty client id in client list (u101).');
                        }
                    }
                    this.fireSynchronize();
                };
                ClientManager.prototype.dispose = function () {
                    this.log.info('[CLIENT_MANAGER] Disposing resources.');
                    this.watchedClients = undefined;
                    this.observedClients = undefined;
                    this.defaultClientClass = null;
                };
                ClientManager.prototype.fireAddressBanned = function (address) {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.ADDRESS_BANNED, undefined, undefined, address));
                };
                ClientManager.prototype.fireAddressUnbanned = function (address) {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.ADDRESS_UNBANNED, undefined, undefined, address));
                };
                ClientManager.prototype.fireBanClientResult = function (address, clientID, status) {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.BAN_RESULT, clientID, undefined, address, status));
                };
                ClientManager.prototype.fireClientConnected = function (client) {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.CLIENT_CONNECTED, client.getClientID(), client));
                };
                ClientManager.prototype.fireClientDisconnected = function (client) {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.CLIENT_DISCONNECTED, client === null || client === void 0 ? void 0 : client.getClientID(), client));
                };
                ClientManager.prototype.fireKickClientResult = function (clientID, status) {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.KICK_RESULT, clientID, undefined, undefined, status));
                };
                ClientManager.prototype.fireObserveClient = function (client) {
                    var e = new net.user1.orbiter.ClientEvent(net.user1.orbiter.ClientEvent.OBSERVE, undefined, undefined, undefined, client);
                    this.dispatchEvent(e);
                };
                ClientManager.prototype.fireObserveClientResult = function (clientID, status) {
                    var _a;
                    this.dispatchEvent(new orbiter.ClientEvent(orbiter.ClientEvent.OBSERVE_RESULT, undefined, undefined, undefined, (_a = this.getClient(clientID)) !== null && _a !== void 0 ? _a : undefined, status, clientID));
                };
                ClientManager.prototype.fireStopObservingClient = function (client) {
                    var e = new orbiter.ClientEvent(orbiter.ClientEvent.STOP_OBSERVING, undefined, undefined, undefined, client);
                    this.dispatchEvent(e);
                };
                ClientManager.prototype.fireStopObservingClientResult = function (clientID, status) {
                    var _a;
                    this.dispatchEvent(new orbiter.ClientEvent(orbiter.ClientEvent.STOP_OBSERVING_RESULT, undefined, undefined, undefined, (_a = this.getClient(clientID)) !== null && _a !== void 0 ? _a : undefined, status, clientID));
                };
                ClientManager.prototype.fireStopWatchingForBannedAddressesResult = function (status) {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.STOP_WATCHING_FOR_BANNED_ADDRESSES_RESULT, undefined, undefined, undefined, status));
                };
                ClientManager.prototype.fireStopWatchingForClientsResult = function (status) {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.STOP_WATCHING_FOR_CLIENTS_RESULT, undefined, undefined, undefined, status));
                };
                ClientManager.prototype.fireSynchronize = function () {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.SYNCHRONIZE));
                };
                ClientManager.prototype.fireSynchronizeBanlist = function () {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.SYNCHRONIZE_BANLIST));
                };
                ClientManager.prototype.fireUnbanClientResult = function (address, status) {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.UNBAN_RESULT, undefined, undefined, address, status));
                };
                ClientManager.prototype.fireWatchForBannedAddressesResult = function (status) {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.WATCH_FOR_BANNED_ADDRESSES_RESULT, undefined, undefined, undefined, status));
                };
                ClientManager.prototype.fireWatchForClientsResult = function (status) {
                    this.dispatchEvent(new orbiter.ClientManagerEvent(orbiter.ClientManagerEvent.WATCH_FOR_CLIENTS_RESULT, undefined, undefined, undefined, status));
                };
                ClientManager.prototype.getAttributeForClients = function (clientIDs, attrName, attrScope) {
                    var clientAttributes = [];
                    for (var i = 0; i < clientIDs.length; i++) {
                        var thisClient = this.getInternalClient(clientIDs[i]);
                        if (thisClient) {
                            clientAttributes.push({
                                clientID: clientIDs[i],
                                value: thisClient.getAttribute(attrName, attrScope)
                            });
                        }
                        else {
                            this.log.debug("[CLIENT_MANAGER] Attribute retrieval failed during  getAttributeForClients(). Unknown client ID [" + clientIDs[i] + "]");
                        }
                    }
                    return clientAttributes;
                };
                ClientManager.prototype.getBannedAddresses = function () {
                    return this.bannedAddresses.slice(0);
                };
                ClientManager.prototype.getClient = function (clientID, scope) {
                    if (!clientID) {
                        throw new Error("ClientManager.getClient() failed. Client ID must not be null or the empty string.");
                    }
                    var theClient = this.getInternalClient(clientID);
                    if (!theClient) {
                        this.log.debug("[CLIENT_MANAGER] getClient() called for unknown client ID [" + clientID + "].");
                        return null;
                    }
                    else {
                        var theCustomClient = theClient.getCustomClient(scope);
                        return theCustomClient !== null && theCustomClient !== void 0 ? theCustomClient : theClient;
                    }
                };
                ClientManager.prototype.getClientByAttribute = function (attributeName, attributeValue, attributeScope, roomScope) {
                    if (attributeName == null || attributeName === '') {
                        return null;
                    }
                    var clients = this.getInternalClients();
                    for (var clientID in clients) {
                        var client = clients[clientID];
                        if (client.getAttribute(attributeName, attributeScope) === attributeValue) {
                            var theCustomClient = client.getCustomClient(roomScope);
                            return theCustomClient !== null && theCustomClient !== void 0 ? theCustomClient : client;
                        }
                    }
                    return null;
                };
                ClientManager.prototype.getClientByUserID = function (userID, scope) {
                    var theClient = null;
                    if (!userID) {
                        throw new Error("ClientManager.getClientByUserID() failed. User ID must not be null or the empty string.");
                    }
                    var clients = this.getInternalClients();
                    for (var clientID in clients) {
                        var client = clients[clientID], account = client.getAccount();
                        if (account != null && account.getUserID() === userID) {
                            theClient = client;
                            break;
                        }
                    }
                    if (theClient === null) {
                        this.log.debug("[CLIENT_MANAGER] getClientByUserID() called for unknown user ID [" + userID + "].");
                        return null;
                    }
                    else {
                        var theCustomClient = theClient === null || theClient === void 0 ? void 0 : theClient.getCustomClient(scope);
                        return theCustomClient !== null && theCustomClient !== void 0 ? theCustomClient : theClient;
                    }
                };
                ClientManager.prototype.getClients = function () {
                    var clients = this.getInternalClients(), clientsList = [];
                    for (var clientID in clients) {
                        var client = clients[clientID], customClient = client.getCustomClient();
                        if (customClient != null) {
                            clientsList.push(customClient);
                        }
                        else {
                            clientsList.push(client);
                        }
                    }
                    return clientsList;
                };
                ClientManager.prototype.getDefaultClientClass = function () {
                    return this.defaultClientClass;
                };
                ClientManager.prototype.getInternalClient = function (clientID) {
                    if (!clientID) {
                        throw new Error("[CLIENT_MANAGER] this.getInternalClient() failed. Client ID must not be null or the empty string.");
                    }
                    var theClient = this.clientCache.get(clientID);
                    if (!!theClient) {
                        return theClient;
                    }
                    else {
                        var clients = this.roomManager.getAllClients();
                        theClient = clients[clientID];
                        if (theClient != null) {
                            this.clientCache.put(clientID, theClient);
                            return theClient;
                        }
                        clients = this.accountManager.getClientsForObservedAccounts();
                        theClient = clients[clientID];
                        if (theClient != null) {
                            this.clientCache.put(clientID, theClient);
                            return theClient;
                        }
                        theClient = this.observedClients.getByClientID(clientID);
                        if (theClient != null) {
                            this.clientCache.put(clientID, theClient);
                            return theClient;
                        }
                        theClient = this.watchedClients.getByClientID(clientID);
                        if (theClient != null) {
                            this.clientCache.put(clientID, theClient);
                            return theClient;
                        }
                    }
                    return null;
                };
                ClientManager.prototype.getInternalClients = function () {
                    var clients = __assign(__assign(__assign(__assign({}, this.roomManager.getAllClients()), this.accountManager.getClientsForObservedAccounts()), this.observedClients.getAll()), this.watchedClients.getAll());
                    if (this.selfReference) {
                        clients[this.selfReference.getClientID()] = this.selfReference;
                    }
                    return clients;
                };
                ClientManager.prototype.getLifetimeNumClientsKnown = function () {
                    return this.lifetimeClientsRequested - this.connectionManager.getReadyCount();
                };
                ClientManager.prototype.getNumClients = function () {
                    return net.user1.utils.ObjectUtil.len(this.getInternalClients());
                };
                ClientManager.prototype.getNumClientsOnServer = function () {
                    return this.watchedClients.length();
                };
                ClientManager.prototype.hasWatchedClient = function (clientID) {
                    return this.watchedClients.containsClientID(clientID);
                };
                ClientManager.prototype.isObservingClient = function (clientID) {
                    return this.observedClients.containsClientID(clientID);
                };
                ClientManager.prototype.isWatchingForBannedAddresses = function () {
                    return this._isWatchingForBannedAddresses;
                };
                ClientManager.prototype.isWatchingForClients = function () {
                    return this._isWatchingForClients;
                };
                ClientManager.prototype.kickClient = function (clientID) {
                    if (!clientID) {
                        this.log.warn('[CLIENT_MANAGER] Kick attempt failed. No clientID supplied.');
                    }
                    this.messageManager.sendUPC(net.user1.orbiter.UPC.KICK_CLIENT, clientID);
                };
                ClientManager.prototype.observeClient = function (clientID) {
                    this.messageManager.sendUPC(net.user1.orbiter.UPC.OBSERVE_CLIENT, clientID);
                };
                ClientManager.prototype.removeAllObservedClients = function () {
                    this.observedClients.removeAll();
                };
                ClientManager.prototype.removeAllWatchedClients = function () {
                    this.watchedClients.removeAll();
                };
                ClientManager.prototype.removeObservedClient = function (clientID) {
                    var client = this.observedClients.removeByClientID(clientID);
                    if (client) {
                        var customClient = client.getCustomClient();
                        this.fireStopObservingClient(customClient !== null && customClient !== void 0 ? customClient : client);
                    }
                };
                ClientManager.prototype.removeWatchedBannedAddress = function (address) {
                    var idx = this.bannedAddresses.indexOf(address);
                    if (idx == -1) {
                        this.log.warn('[CLIENT_MANAGER] Request to remove watched banned address failed. Address not found.');
                    }
                    this.bannedAddresses.splice(idx, 1);
                    this.fireAddressUnbanned(address);
                };
                ClientManager.prototype.removeWatchedClient = function (clientID) {
                    this.watchedClients.removeByClientID(clientID);
                };
                ClientManager.prototype.requestClient = function (clientID) {
                    if (clientID == null || clientID === '') {
                        throw new Error('[CLIENT_MANAGER] requestClient() called with empty clientID.');
                    }
                    var client = this.getInternalClient(clientID);
                    if (!client) {
                        client = new net.user1.orbiter.Client(clientID, this, this.messageManager, this.roomManager, this.connectionManager, this.server, this.log);
                        this.lifetimeClientsRequested++;
                        this.clientCache.put(clientID, client);
                    }
                    return client;
                };
                ClientManager.prototype.self = function () {
                    return this.selfReference;
                };
                ClientManager.prototype.sendMessage = function (messageName, clientIDs, filters) {
                    var _a;
                    var _b;
                    var rest = [];
                    for (var _i = 3; _i < arguments.length; _i++) {
                        rest[_i - 3] = arguments[_i];
                    }
                    if (messageName == null || messageName == '') {
                        this.log.warn('[CLIENT_MANAGER] sendMessage() failed. No messageName supplied.');
                        return;
                    }
                    (_a = this.messageManager).sendUPC.apply(_a, __spreadArrays([orbiter.UPC.SEND_MESSAGE_TO_CLIENTS,
                        messageName,
                        clientIDs.join(net.user1.orbiter.Tokens.RS), (_b = filters === null || filters === void 0 ? void 0 : filters.toXMLString()) !== null && _b !== void 0 ? _b : ''], rest));
                };
                ClientManager.prototype.setDefaultClientClass = function (defaultClass) {
                    this.defaultClientClass = defaultClass;
                };
                ClientManager.prototype.setIsWatchingForBannedAddresses = function (value) {
                    this._isWatchingForBannedAddresses = value;
                };
                ClientManager.prototype.setIsWatchingForClients = function (value) {
                    this._isWatchingForClients = value;
                };
                ClientManager.prototype.setSelf = function (client) {
                    this.selfReference = client;
                    client.setIsSelf();
                };
                ClientManager.prototype.setWatchedBannedAddresses = function (bannedList) {
                    this.bannedAddresses = bannedList;
                    this.fireSynchronizeBanlist();
                };
                ClientManager.prototype.stopWatchingForBannedAddresses = function () {
                    this.messageManager.sendUPC(net.user1.orbiter.UPC.STOP_WATCHING_FOR_BANNED_ADDRESSES);
                };
                ClientManager.prototype.stopWatchingForClients = function () {
                    this.messageManager.sendUPC(net.user1.orbiter.UPC.STOP_WATCHING_FOR_CLIENTS);
                };
                ClientManager.prototype.unban = function (address) {
                    this.messageManager.sendUPC(net.user1.orbiter.UPC.UNBAN, address);
                };
                ClientManager.prototype.watchForBannedAddresses = function () {
                    this.messageManager.sendUPC(net.user1.orbiter.UPC.WATCH_FOR_BANNED_ADDRESSES);
                };
                ClientManager.prototype.watchForClients = function () {
                    this.messageManager.sendUPC(net.user1.orbiter.UPC.WATCH_FOR_CLIENTS);
                };
                return ClientManager;
            }(net.user1.events.EventDispatcher));
            orbiter.ClientManager = ClientManager;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ClientManagerEvent = (function (_super) {
                __extends(ClientManagerEvent, _super);
                function ClientManagerEvent(type, clientID, client, address, status) {
                    var _this = _super.call(this, type) || this;
                    _this.type = type;
                    _this.clientID = clientID;
                    _this.client = client;
                    _this.address = address;
                    _this.status = status;
                    return _this;
                }
                ClientManagerEvent.prototype.getAddress = function () {
                    var _a;
                    return (_a = this.address) !== null && _a !== void 0 ? _a : null;
                };
                ClientManagerEvent.prototype.getClient = function () {
                    var _a;
                    return (_a = this.client) !== null && _a !== void 0 ? _a : null;
                };
                ClientManagerEvent.prototype.getClientID = function () {
                    var _a;
                    return (_a = this.clientID) !== null && _a !== void 0 ? _a : null;
                };
                ClientManagerEvent.prototype.getStatus = function () {
                    var _a;
                    return (_a = this.status) !== null && _a !== void 0 ? _a : null;
                };
                ClientManagerEvent.prototype.toString = function () {
                    return '[object ClientManagerEvent]';
                };
                ClientManagerEvent.ADDRESS_BANNED = 'ADDRESS_BANNED';
                ClientManagerEvent.ADDRESS_UNBANNED = 'ADDRESS_UNBANNED';
                ClientManagerEvent.BAN_RESULT = 'BAN_RESULT';
                ClientManagerEvent.CLIENT_CONNECTED = 'CLIENT_CONNECTED';
                ClientManagerEvent.CLIENT_DISCONNECTED = 'CLIENT_DISCONNECTED';
                ClientManagerEvent.KICK_RESULT = 'KICK_RESULT';
                ClientManagerEvent.STOP_WATCHING_FOR_BANNED_ADDRESSES_RESULT = 'STOP_WATCHING_FOR_BANNED_ADDRESSES_RESULT';
                ClientManagerEvent.STOP_WATCHING_FOR_CLIENTS_RESULT = 'STOP_WATCHING_FOR_CLIENTS_RESULT';
                ClientManagerEvent.SYNCHRONIZE = 'SYNCHRONIZE';
                ClientManagerEvent.SYNCHRONIZE_BANLIST = 'SYNCHRONIZE_BANLIST';
                ClientManagerEvent.UNBAN_RESULT = 'UNBAN_RESULT';
                ClientManagerEvent.WATCH_FOR_BANNED_ADDRESSES_RESULT = 'WATCH_FOR_BANNED_ADDRESSES_RESULT';
                ClientManagerEvent.WATCH_FOR_CLIENTS_RESULT = 'WATCH_FOR_CLIENTS_RESULT';
                return ClientManagerEvent;
            }(net.user1.events.Event));
            orbiter.ClientManagerEvent = ClientManagerEvent;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ClientManifest = (function () {
                function ClientManifest() {
                    this.persistentAttributes = new orbiter.AttributeCollection();
                    this.transientAttributes = new orbiter.AttributeCollection();
                }
                ClientManifest.prototype.deserialize = function (clientID, userID, serializedOccupiedRoomIDs, serializedObservedRoomIDs, globalAttrs, roomAttrs) {
                    if (serializedOccupiedRoomIDs === void 0) { serializedOccupiedRoomIDs = ''; }
                    if (serializedObservedRoomIDs === void 0) { serializedObservedRoomIDs = ''; }
                    this.clientID = clientID == '' ? undefined : clientID;
                    this.userID = userID == '' ? undefined : userID;
                    this.deserializeOccupiedRoomIDs(serializedOccupiedRoomIDs);
                    this.deserializeObservedRoomIDs(serializedObservedRoomIDs);
                    this.deserializeAttributesByScope(net.user1.orbiter.Tokens.GLOBAL_ATTR, globalAttrs);
                    for (var i = 0; i < roomAttrs.length; i += 2) {
                        this.deserializeAttributesByScope(roomAttrs[i], roomAttrs[i + 1]);
                    }
                };
                ClientManifest.prototype.deserializeAttributesByScope = function (scope, serializedAttributes) {
                    if (!serializedAttributes)
                        return;
                    var attrList = serializedAttributes.split(net.user1.orbiter.Tokens.RS);
                    for (var i = attrList.length - 3; i >= 0; i -= 3) {
                        if (parseInt(attrList[i + 2]) & orbiter.AttributeOptions.FLAG_PERSISTENT) {
                            this.persistentAttributes.setAttribute(attrList[i], attrList[i + 1], scope);
                        }
                        else {
                            this.transientAttributes.setAttribute(attrList[i], attrList[i + 1], scope);
                        }
                    }
                };
                ClientManifest.prototype.deserializeObservedRoomIDs = function (roomIDs) {
                    if (!roomIDs)
                        return;
                    if (roomIDs == '') {
                        this.observedRoomIDs = [];
                        return;
                    }
                    this.observedRoomIDs = roomIDs.split(net.user1.orbiter.Tokens.RS);
                };
                ClientManifest.prototype.deserializeOccupiedRoomIDs = function (roomIDs) {
                    if (!roomIDs)
                        return;
                    if (roomIDs == '') {
                        this.occupiedRoomIDs = [];
                        return;
                    }
                    this.occupiedRoomIDs = roomIDs.split(net.user1.orbiter.Tokens.RS);
                };
                return ClientManifest;
            }());
            orbiter.ClientManifest = ClientManifest;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ClientSet = (function () {
                function ClientSet() {
                    this.clients = {};
                }
                ClientSet.prototype.add = function (client) {
                    this.clients[client.getClientID()] = client;
                };
                ClientSet.prototype.contains = function (client) {
                    return !!this.clients[client.getClientID()];
                };
                ClientSet.prototype.containsClientID = function (clientID) {
                    return clientID ? !!this.getByClientID(clientID) : false;
                };
                ClientSet.prototype.getAll = function () {
                    return this.clients;
                };
                ClientSet.prototype.getAllIDs = function () {
                    var ids = [];
                    for (var clientID in this.clients) {
                        if (this.clients.hasOwnProperty(clientID))
                            ids.push(clientID);
                    }
                    return ids;
                };
                ClientSet.prototype.getByClientID = function (clientID) {
                    return this.clients[clientID];
                };
                ClientSet.prototype.getByUserID = function (userID) {
                    for (var clientID in this.clients) {
                        if (!this.clients.hasOwnProperty(clientID))
                            continue;
                        var client = this.clients[clientID];
                        var account = client.getAccount();
                        if ((account === null || account === void 0 ? void 0 : account.getUserID()) == userID) {
                            return client;
                        }
                    }
                    return null;
                };
                ClientSet.prototype.length = function () {
                    return net.user1.utils.ObjectUtil.len(this.clients);
                };
                ClientSet.prototype.remove = function (client) {
                    var c = this.clients[client.getClientID()];
                    delete this.clients[c.getClientID()];
                    return client;
                };
                ClientSet.prototype.removeAll = function () {
                    this.clients = {};
                };
                ClientSet.prototype.removeByClientID = function (clientID) {
                    var client = this.clients[clientID];
                    delete this.clients[clientID];
                    return client;
                };
                return ClientSet;
            }());
            orbiter.ClientSet = ClientSet;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var ClientSnapshot = (function (_super) {
                    __extends(ClientSnapshot, _super);
                    function ClientSnapshot(clientID) {
                        var _this = _super.call(this) || this;
                        _this.method = net.user1.orbiter.UPC.GET_CLIENT_SNAPSHOT;
                        _this.args = [clientID];
                        _this.hasStatus = true;
                        return _this;
                    }
                    ClientSnapshot.prototype.getAttribute = function (name, scope) {
                        var _a, _b;
                        return (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.transientAttributes.getAttribute(name, scope)) !== null && _b !== void 0 ? _b : null;
                    };
                    ClientSnapshot.prototype.getAttributes = function () {
                        var _a, _b;
                        return (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.transientAttributes.getAll()) !== null && _b !== void 0 ? _b : null;
                    };
                    ClientSnapshot.prototype.getClientID = function () {
                        var _a, _b;
                        return (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.clientID) !== null && _b !== void 0 ? _b : null;
                    };
                    ClientSnapshot.prototype.getObservedRoomIDs = function () {
                        var _a, _b, _c;
                        return (_c = (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.observedRoomIDs) === null || _b === void 0 ? void 0 : _b.slice()) !== null && _c !== void 0 ? _c : null;
                    };
                    ClientSnapshot.prototype.getOccupiedRoomIDs = function () {
                        var _a, _b, _c;
                        return (_c = (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.occupiedRoomIDs) === null || _b === void 0 ? void 0 : _b.slice()) !== null && _c !== void 0 ? _c : null;
                    };
                    ClientSnapshot.prototype.getUserID = function () {
                        var _a, _b;
                        return (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.userID) !== null && _b !== void 0 ? _b : null;
                    };
                    ClientSnapshot.prototype.setManifest = function (value) {
                        this.manifest = value;
                    };
                    return ClientSnapshot;
                }(snapshot.Snapshot));
                snapshot.ClientSnapshot = ClientSnapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var CollectionEvent = (function (_super) {
                __extends(CollectionEvent, _super);
                function CollectionEvent(type, item) {
                    var _this = _super.call(this, type) || this;
                    _this.item = item;
                    return _this;
                }
                CollectionEvent.prototype.getItem = function () {
                    return this.item;
                };
                CollectionEvent.prototype.toString = function () {
                    return '[object CollectionEvent]';
                };
                CollectionEvent.ADD_ITEM = 'ADD_ITEM';
                CollectionEvent.REMOVE_ITEM = 'REMOVE_ITEM';
                return CollectionEvent;
            }(net.user1.events.Event));
            orbiter.CollectionEvent = CollectionEvent;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var filters;
            (function (filters) {
                var CompareType;
                (function (CompareType) {
                    CompareType["EQUAL"] = "eq";
                    CompareType["NOT_EQUAL"] = "ne";
                    CompareType["GREATER_THAN"] = "gt";
                    CompareType["GREATER_THAN_OR_EQUAL"] = "ge";
                    CompareType["LESS_THAN"] = "lt";
                    CompareType["LESS_THAN_OR_EQUAL"] = "le";
                })(CompareType = filters.CompareType || (filters.CompareType = {}));
            })(filters = orbiter.filters || (orbiter.filters = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter_1) {
            var Connection = (function (_super) {
                __extends(Connection, _super);
                function Connection(host, port, type) {
                    var _this = _super.call(this) || this;
                    _this.type = type;
                    _this.disposed = false;
                    _this.connectAbortCount = 0;
                    _this.connectAttemptCount = 0;
                    _this.mostRecentConnectAchievedReady = false;
                    _this.mostRecentConnectTimedOut = false;
                    _this.readyCount = 0;
                    _this.readyTimeout = 0;
                    _this.readyTimeoutID = 0;
                    _this.setServer(host, port);
                    _this.connectionState = orbiter_1.ConnectionState.NOT_CONNECTED;
                    return _this;
                }
                Connection.prototype.applyAffinity = function (data) {
                    var _a, _b, _c, _d;
                    var affinityAddress = (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getConnectionManager().getAffinity((_b = this.requestedHost) !== null && _b !== void 0 ? _b : '');
                    if (affinityAddress == this.requestedHost) {
                        (_c = this.orbiter) === null || _c === void 0 ? void 0 : _c.getLog().info(this.toString() + " No affinity address found for requested host [" + this.requestedHost + "]. Using requested host for next connection attempt.");
                    }
                    else {
                        (_d = this.orbiter) === null || _d === void 0 ? void 0 : _d.getLog().info(this.toString() + " Applying affinity address [" + affinityAddress + "] for supplied host [" + this.requestedHost + "].");
                    }
                    this.host = affinityAddress;
                };
                Connection.prototype.connect = function () {
                    var _a;
                    this.disconnect();
                    this.applyAffinity();
                    (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().info(this.toString() + " Attempting connection...");
                    this.connectAttemptCount++;
                    this.mostRecentConnectAchievedReady = false;
                    this.mostRecentConnectTimedOut = false;
                    this.connectionState = orbiter_1.ConnectionState.CONNECTION_IN_PROGRESS;
                    this.startReadyTimer();
                    this.dispatchBeginConnect();
                };
                Connection.prototype.disconnect = function () {
                    var state = this.connectionState;
                    if (state != orbiter_1.ConnectionState.NOT_CONNECTED) {
                        this.deactivateConnection();
                        if (state == orbiter_1.ConnectionState.CONNECTION_IN_PROGRESS) {
                            this.connectAbortCount++;
                            this.dispatchConnectFailure('Client closed connection before READY state was achieved.');
                        }
                        else {
                            this.dispatchClientKillConnect();
                        }
                    }
                };
                Connection.prototype.getHost = function () {
                    var _a;
                    return (_a = this.host) !== null && _a !== void 0 ? _a : this.getRequestedHost();
                };
                Connection.prototype.getPort = function () {
                    var _a;
                    return (_a = this.port) !== null && _a !== void 0 ? _a : null;
                };
                Connection.prototype.getRequestedHost = function () {
                    var _a;
                    return (_a = this.requestedHost) !== null && _a !== void 0 ? _a : null;
                };
                Connection.prototype.getType = function () {
                    var _a;
                    return (_a = this.connectionType) !== null && _a !== void 0 ? _a : null;
                };
                Connection.prototype.isReady = function () {
                    return this.connectionState == net.user1.orbiter.ConnectionState.READY;
                };
                Connection.prototype.isValid = function () {
                    var _a, _b, _c, _d;
                    if (this.mostRecentConnectAchievedReady) {
                        (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().debug(this + " Connection is valid because its last connection attempt succeeded.");
                        return true;
                    }
                    if (this.connectAttemptCount == 0) {
                        (_b = this.orbiter) === null || _b === void 0 ? void 0 : _b.getLog().debug(this + " Connection is valid because it has either never attempted to connect, or has not attempted to connect since its last successful connection.");
                        return true;
                    }
                    if ((this.connectAttemptCount > 0) &&
                        (this.connectAttemptCount == this.connectAbortCount) &&
                        !this.mostRecentConnectTimedOut) {
                        (_c = this.orbiter) === null || _c === void 0 ? void 0 : _c.getLog().debug(this + " Connection is valid because either all connection attempts ever or all connection attempts since its last successful connection were aborted before the ready timeout was reached.");
                        return true;
                    }
                    (_d = this.orbiter) === null || _d === void 0 ? void 0 : _d.getLog().debug(toString() + " Connection is not valid; its most recent connection failed to achieve a ready state.");
                    return false;
                };
                Connection.prototype.send = function (data) {
                };
                Connection.prototype.setOrbiter = function (orbiter) {
                    if (this.orbiter) {
                        this.orbiter.getMessageManager().removeMessageListener('u63', this.u63);
                        this.orbiter.getMessageManager().removeMessageListener('u66', this.u66);
                        this.orbiter.getMessageManager().removeMessageListener('u84', this.u84);
                        this.orbiter.getMessageManager().removeMessageListener('u85', this.u85);
                    }
                    this.orbiter = orbiter;
                };
                Connection.prototype.setServer = function (host, port) {
                    this.requestedHost = host;
                    if (port && (port < 1 || port > 65536)) {
                        throw new Error("Illegal port specified [" + port + "]. Must be greater than 0 and less than 65537.");
                    }
                    this.port = port;
                };
                Connection.prototype.toString = function () {
                    var _a;
                    return "[" + this.connectionType + ", requested host: " + this.requestedHost + ", host: " + ((_a = this.host) !== null && _a !== void 0 ? _a : '') + ", port: " + this.port + "]";
                };
                Connection.prototype.beginReadyHandshake = function () {
                    this.dispatchBeginHandshake();
                    if (!this.orbiter)
                        return;
                    if (!this.orbiter.getMessageManager().hasMessageListener('u63', this.u63)) {
                        this.orbiter.getMessageManager().addMessageListener('u63', this.u63, this);
                        this.orbiter.getMessageManager().addMessageListener('u66', this.u66, this);
                        this.orbiter.getMessageManager().addMessageListener('u84', this.u84, this);
                        this.orbiter.getMessageManager().addMessageListener('u85', this.u85, this);
                    }
                    this.sendHello();
                };
                Connection.prototype.deactivateConnection = function () {
                    var _a;
                    this.connectionState = orbiter_1.ConnectionState.NOT_CONNECTED;
                    this.stopReadyTimer();
                    (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.setSessionID('');
                };
                Connection.prototype.dispatchConnectFailure = function (status) {
                    this.dispatchEvent(new orbiter_1.ConnectionEvent(orbiter_1.ConnectionEvent.CONNECT_FAILURE, undefined, undefined, this, status));
                };
                Connection.prototype.dispatchReceiveData = function (data) {
                    this.dispatchEvent(new orbiter_1.ConnectionEvent(orbiter_1.ConnectionEvent.RECEIVE_DATA, undefined, data, this));
                };
                Connection.prototype.dispatchSendData = function (data) {
                    this.dispatchEvent(new orbiter_1.ConnectionEvent(orbiter_1.ConnectionEvent.SEND_DATA, undefined, data, this));
                };
                Connection.prototype.dispatchServerKillConnect = function () {
                    this.dispatchEvent(new orbiter_1.ConnectionEvent(orbiter_1.ConnectionEvent.SERVER_KILL_CONNECT, undefined, undefined, this));
                    this.dispatchEvent(new orbiter_1.ConnectionEvent(orbiter_1.ConnectionEvent.DISCONNECT, undefined, undefined, this));
                };
                Connection.prototype.dispose = function () {
                    var _a, _b, _c, _d;
                    this.disposed = true;
                    (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getMessageManager().removeMessageListener('u63', this.u63);
                    (_b = this.orbiter) === null || _b === void 0 ? void 0 : _b.getMessageManager().removeMessageListener('u66', this.u66);
                    (_c = this.orbiter) === null || _c === void 0 ? void 0 : _c.getMessageManager().removeMessageListener('u84', this.u84);
                    (_d = this.orbiter) === null || _d === void 0 ? void 0 : _d.getMessageManager().removeMessageListener('u85', this.u85);
                    this.stopReadyTimer();
                    this.readyTimeoutID = 0;
                    this.orbiter = undefined;
                };
                Connection.prototype.transmitHelloMessage = function (helloString) {
                    this.send(helloString);
                };
                Connection.prototype.u66 = function (serverVersion, sessionID, upcVersion, protocolCompatible, affinityAddress, affinityDuration) {
                    var _a;
                    if (affinityAddress === void 0) { affinityAddress = ''; }
                    if (affinityDuration === void 0) { affinityDuration = ''; }
                    (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.setSessionID(sessionID);
                };
                Connection.prototype.buildHelloMessage = function () {
                    if (!this.orbiter)
                        return '';
                    var sys = this.orbiter.getSystem();
                    return "<U><M>u65</M><L><A>" + sys.getClientType() + "</A><A>" + (typeof navigator != 'undefined' ?
                        navigator.userAgent + ';' :
                        '') + sys.getClientVersion()
                        .toStringVerbose() + "</A><A>" + sys.getUPCVersion()
                        .toString() + "</A></L></U>";
                };
                Connection.prototype.dispatchBeginConnect = function () {
                    this.dispatchEvent(new orbiter_1.ConnectionEvent(orbiter_1.ConnectionEvent.BEGIN_CONNECT, undefined, undefined, this));
                };
                Connection.prototype.dispatchBeginHandshake = function () {
                    this.dispatchEvent(new orbiter_1.ConnectionEvent(orbiter_1.ConnectionEvent.BEGIN_HANDSHAKE, undefined, undefined, this));
                };
                Connection.prototype.dispatchClientKillConnect = function () {
                    this.dispatchEvent(new orbiter_1.ConnectionEvent(orbiter_1.ConnectionEvent.CLIENT_KILL_CONNECT, undefined, undefined, this));
                    this.dispatchEvent(new orbiter_1.ConnectionEvent(orbiter_1.ConnectionEvent.DISCONNECT, undefined, undefined, this));
                };
                Connection.prototype.dispatchReady = function () {
                    this.dispatchEvent(new orbiter_1.ConnectionEvent(orbiter_1.ConnectionEvent.READY, undefined, undefined, this));
                };
                Connection.prototype.dispatchSessionNotFound = function () {
                    this.dispatchEvent(new orbiter_1.ConnectionEvent(orbiter_1.ConnectionEvent.SESSION_NOT_FOUND, undefined, undefined, this));
                };
                Connection.prototype.dispatchSessionTerminated = function () {
                    this.dispatchEvent(new orbiter_1.ConnectionEvent(orbiter_1.ConnectionEvent.SESSION_TERMINATED, undefined, undefined, this));
                };
                Connection.prototype.getReadyCount = function () {
                    return this.readyCount;
                };
                Connection.prototype.readyTimerListener = function () {
                    var _a;
                    this.stopReadyTimer();
                    if (this.connectionState == orbiter_1.ConnectionState.CONNECTION_IN_PROGRESS) {
                        (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().warn("[CONNECTION] " + this.toString() + " Failed to achieve ready state after " + this.readyTimeout + "ms. Aborting connection...");
                        this.mostRecentConnectTimedOut = true;
                        this.disconnect();
                    }
                };
                Connection.prototype.sendHello = function () {
                    var _a;
                    var helloString = this.buildHelloMessage();
                    (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().debug(this.toString() + " Sending CLIENT_HELLO: " + helloString);
                    this.transmitHelloMessage(helloString);
                };
                Connection.prototype.startReadyTimer = function () {
                    var _this = this;
                    var _a, _b;
                    this.stopReadyTimer();
                    this.readyTimeout = (_b = (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getConnectionManager().getReadyTimeout()) !== null && _b !== void 0 ? _b : 0;
                    this.readyTimeoutID = setTimeout(function () { return _this.readyTimerListener(); }, this.readyTimeout);
                };
                Connection.prototype.stopReadyTimer = function () {
                    if (this.readyTimeoutID != -1) {
                        clearTimeout(this.readyTimeoutID);
                    }
                };
                Connection.prototype.u63 = function () {
                    this.stopReadyTimer();
                    this.connectionState = orbiter_1.ConnectionState.READY;
                    this.mostRecentConnectAchievedReady = true;
                    this.readyCount++;
                    this.connectAttemptCount = 0;
                    this.connectAbortCount = 0;
                    this.dispatchReady();
                };
                Connection.prototype.u84 = function () {
                    this.dispatchSessionTerminated();
                };
                Connection.prototype.u85 = function () {
                    this.dispatchSessionNotFound();
                };
                return Connection;
            }(net.user1.events.EventDispatcher));
            orbiter_1.Connection = Connection;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ConnectionEvent = (function (_super) {
                __extends(ConnectionEvent, _super);
                function ConnectionEvent(type, upc, data, connection, status) {
                    var _this = _super.call(this, type) || this;
                    _this.type = type;
                    _this.upc = upc;
                    _this.data = data;
                    _this.connection = connection;
                    _this.status = status;
                    return _this;
                }
                ConnectionEvent.prototype.getData = function () {
                    var _a;
                    return (_a = this.data) !== null && _a !== void 0 ? _a : null;
                };
                ConnectionEvent.prototype.getStatus = function () {
                    var _a;
                    return (_a = this.status) !== null && _a !== void 0 ? _a : null;
                };
                ConnectionEvent.prototype.getUPC = function () {
                    var _a;
                    return (_a = this.upc) !== null && _a !== void 0 ? _a : null;
                };
                ConnectionEvent.prototype.toString = function () {
                    return '[object ConnectionEvent]';
                };
                ConnectionEvent.BEGIN_CONNECT = 'BEGIN_CONNECT';
                ConnectionEvent.BEGIN_HANDSHAKE = 'BEGIN_HANDSHAKE';
                ConnectionEvent.CLIENT_KILL_CONNECT = 'CLIENT_KILL_CONNECT';
                ConnectionEvent.CONNECT_FAILURE = 'CONNECT_FAILURE';
                ConnectionEvent.DISCONNECT = 'DISCONNECT';
                ConnectionEvent.READY = 'READY';
                ConnectionEvent.RECEIVE_DATA = 'RECEIVE_DATA';
                ConnectionEvent.RECEIVE_UPC = 'RECEIVE_UPC';
                ConnectionEvent.SEND_DATA = 'SEND_DATA';
                ConnectionEvent.SERVER_KILL_CONNECT = 'SERVER_KILL_CONNECT';
                ConnectionEvent.SESSION_NOT_FOUND = 'SESSION_NOT_FOUND';
                ConnectionEvent.SESSION_TERMINATED = 'SESSION_TERMINATED';
                return ConnectionEvent;
            }(net.user1.events.Event));
            orbiter.ConnectionEvent = ConnectionEvent;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter_2) {
            var ConnectionManager = (function (_super) {
                __extends(ConnectionManager, _super);
                function ConnectionManager(orbiter) {
                    var _this = _super.call(this) || this;
                    _this.orbiter = orbiter;
                    _this.connectionState = orbiter_2.ConnectionState.NOT_CONNECTED;
                    _this.connectAbortCount = 0;
                    _this.connectAttemptCount = 0;
                    _this.connectFailedCount = 0;
                    _this.connections = [];
                    _this.currentConnectionIndex = 0;
                    _this.readyCount = 0;
                    _this.readyTimeout = 0;
                    _this.setReadyTimeout(ConnectionManager.DEFAULT_READY_TIMEOUT);
                    _this.setGlobalAffinity(true);
                    return _this;
                }
                ConnectionManager.prototype.addConnection = function (connection) {
                    if (connection) {
                        this.orbiter.getLog().info("[CONNECTION_MANAGER] New connection added. " + connection.toString() + ".");
                        connection.setOrbiter(this.orbiter);
                        this.connections.push(connection);
                    }
                };
                ConnectionManager.prototype.connect = function () {
                    var _a;
                    if (this.connections.length == 0) {
                        this.orbiter.getLog().error('[CONNECTION_MANAGER] No connections defined. Connection request ignored.');
                        return;
                    }
                    this.connectAttemptCount++;
                    this.attemptedConnections = [];
                    switch (this.connectionState) {
                        case orbiter_2.ConnectionState.CONNECTION_IN_PROGRESS:
                            this.orbiter.getLog().info("[CONNECTION_MANAGER] Connection attempt already in progress. Existing attempt must be aborted before new connection attempt begins...");
                            this.disconnect();
                            break;
                        case orbiter_2.ConnectionState.READY:
                            this.orbiter.getLog().info("[CONNECTION_MANAGER] Existing connection to Union must be disconnected before new connection attempt begins.");
                            this.disconnect();
                            break;
                    }
                    this.setConnectionState(orbiter_2.ConnectionState.CONNECTION_IN_PROGRESS);
                    this.orbiter.getLog().debug('[CONNECTION_MANAGER] Searching for most recent valid connection.');
                    var originalConnectionIndex = this.currentConnectionIndex;
                    while (!((_a = this.getCurrentConnection()) === null || _a === void 0 ? void 0 : _a.isValid())) {
                        this.advance();
                        if (this.currentConnectionIndex == originalConnectionIndex) {
                            this.orbiter.getLog().debug('[CONNECTION_MANAGER] No valid connection found. Starting connection attempt with first connection.');
                            this.currentConnectionIndex = 0;
                            break;
                        }
                    }
                    this.dispatchBeginConnect();
                    this.connectCurrentConnection();
                };
                ConnectionManager.prototype.disconnect = function () {
                    var _a, _b, _c, _d;
                    if (this.connections.length == 0) {
                        this.dispatchConnectFailure('No connections defined. Disconnection attempt failed.');
                        return;
                    }
                    switch (this.connectionState) {
                        case orbiter_2.ConnectionState.READY:
                            this.orbiter.getLog().info("[CONNECTION_MANAGER] Closing existing connection: " + ((_a = this.getActiveConnection()) === null || _a === void 0 ? void 0 : _a.toString()));
                            this.setConnectionState(orbiter_2.ConnectionState.DISCONNECTION_IN_PROGRESS);
                            this.disconnectConnection((_b = this.getActiveConnection()) !== null && _b !== void 0 ? _b : undefined);
                            break;
                        case orbiter_2.ConnectionState.CONNECTION_IN_PROGRESS:
                            this.orbiter.getLog().info("[CONNECTION_MANAGER] Aborting existing connection attempt: " + ((_c = this.getInProgressConnection()) === null || _c === void 0 ? void 0 : _c.toString()));
                            this.connectAbortCount++;
                            this.setConnectionState(orbiter_2.ConnectionState.DISCONNECTION_IN_PROGRESS);
                            this.disconnectConnection((_d = this.getInProgressConnection()) !== null && _d !== void 0 ? _d : undefined);
                            this.orbiter.getLog().info('[CONNECTION_MANAGER] Connection abort complete.');
                            break;
                        case orbiter_2.ConnectionState.DISCONNECTION_IN_PROGRESS:
                            this.orbiter.getLog().info("[CONNECTION_MANAGER] Disconnection request ignored. Already disconnecting.");
                            break;
                    }
                };
                ConnectionManager.prototype.dispatchSessionTerminated = function () {
                    this.dispatchEvent(new orbiter_2.ConnectionManagerEvent(orbiter_2.ConnectionManagerEvent.SESSION_TERMINATED));
                };
                ConnectionManager.prototype.dispose = function () {
                    this.removeAllConnections();
                    this.attemptedConnections = undefined;
                    this.activeConnection = undefined;
                    this.inProgressConnection = undefined;
                    this.connections = undefined;
                };
                ConnectionManager.prototype.getActiveConnection = function () {
                    var _a;
                    return (_a = this.activeConnection) !== null && _a !== void 0 ? _a : null;
                };
                ConnectionManager.prototype.getAffinity = function (host) {
                    var _a, _b, _c;
                    var address = (_a = this.affinityData) === null || _a === void 0 ? void 0 : _a.read('affinity', host + 'address'), until = parseFloat((_c = (_b = this.affinityData) === null || _b === void 0 ? void 0 : _b.read('affinity', host + 'until')) !== null && _c !== void 0 ? _c : '');
                    if (address) {
                        var now = new Date().getTime();
                        if (now >= until) {
                            this.orbiter.getLog().warn("[CONNECTION_MANAGER] Affinity duration expired for address [" + address + "], host [" + host + "]. Removing affinity.");
                            this.clearAffinity(host);
                        }
                        else {
                            return address;
                        }
                    }
                    return host;
                };
                ConnectionManager.prototype.getConnectAbortCount = function () {
                    return this.connectAbortCount;
                };
                ConnectionManager.prototype.getConnectAttemptCount = function () {
                    return this.connectAttemptCount;
                };
                ConnectionManager.prototype.getConnectFailedCount = function () {
                    return this.connectFailedCount;
                };
                ConnectionManager.prototype.getConnectionState = function () {
                    return this.connectionState;
                };
                ConnectionManager.prototype.getConnections = function () {
                    return this.connections.slice();
                };
                ConnectionManager.prototype.getCurrentConnection = function () {
                    return this.connections[this.currentConnectionIndex];
                };
                ConnectionManager.prototype.getInProgressConnection = function () {
                    var _a;
                    return (_a = this.inProgressConnection) !== null && _a !== void 0 ? _a : null;
                };
                ConnectionManager.prototype.getReadyCount = function () {
                    return this.readyCount;
                };
                ConnectionManager.prototype.getReadyTimeout = function () {
                    return this.readyTimeout;
                };
                ConnectionManager.prototype.isReady = function () {
                    return this.connectionState == orbiter_2.ConnectionState.READY;
                };
                ConnectionManager.prototype.removeAllConnections = function () {
                    if (this.connections.length == 0) {
                        this.orbiter.getLog().info("[CONNECTION_MANAGER] removeAllConnections() ignored.  No connections to remove.");
                        return;
                    }
                    this.orbiter.getLog().info('[CONNECTION_MANAGER] Removing all connections...');
                    this.disconnect();
                    while (this.connections.length > 0) {
                        this.removeConnection(this.connections[0]);
                    }
                    this.currentConnectionIndex = 0;
                    this.orbiter.getLog().info('[CONNECTION_MANAGER] All connections removed.');
                };
                ConnectionManager.prototype.removeConnection = function (connection) {
                    if (connection) {
                        connection.disconnect();
                        this.removeConnectionListeners(connection);
                        return net.user1.utils.ArrayUtil.remove(this.connections, connection);
                    }
                    else {
                        return false;
                    }
                };
                ConnectionManager.prototype.setAffinity = function (host, address, duration) {
                    var _a, _b;
                    var until = new Date().getTime() + (duration * 60 * 1000);
                    (_a = this.affinityData) === null || _a === void 0 ? void 0 : _a.write('affinity', host + 'address', address);
                    (_b = this.affinityData) === null || _b === void 0 ? void 0 : _b.write('affinity', host + 'until', until.toString());
                    this.orbiter.getLog().info("[CONNECTION_MANAGER] Assigning affinity address [" + address + "] for supplied host [" + host + "]. Duration (minutes): " + duration);
                };
                ConnectionManager.prototype.setConnectionState = function (state) {
                    var changed = false;
                    if (state != this.connectionState) {
                        changed = true;
                    }
                    this.connectionState = state;
                    if (changed) {
                        this.dispatchConnectionStateChange();
                    }
                };
                ConnectionManager.prototype.setGlobalAffinity = function (enabled) {
                    if (enabled) {
                        this.orbiter.getLog().info("[CONNECTION_MANAGER] Global server affinity selected. Using current environment's shared server affinity.");
                        this.affinityData = new net.user1.utils.LocalData();
                    }
                    else {
                        this.orbiter.getLog().info("[CONNECTION_MANAGER] Local server affinity selected. The current client will maintain its own, individual server affinity.");
                        this.affinityData = new net.user1.utils.MemoryStore();
                    }
                };
                ConnectionManager.prototype.setReadyTimeout = function (milliseconds) {
                    if (milliseconds > 0) {
                        this.readyTimeout = milliseconds;
                        this.orbiter.getLog().info("[CONNECTION_MANAGER] Ready timeout set to " + milliseconds + " ms.");
                        if (milliseconds < 3000) {
                            this.orbiter.getLog().warn("[CONNECTION_MANAGER] Current ready timeout (" + milliseconds + ") may not allow sufficient time to connect to Union Server over a typical internet connection.");
                        }
                    }
                    else {
                        this.orbiter.getLog().warn("[CONNECTION_MANAGER] Invalid ready timeout specified: " + milliseconds + ". Duration must be greater than zero.");
                    }
                };
                ConnectionManager.prototype.addConnectionListeners = function (connection) {
                    if (connection) {
                        connection.addEventListener(orbiter_2.ConnectionEvent.READY, this.readyListener, this);
                        connection.addEventListener(orbiter_2.ConnectionEvent.CONNECT_FAILURE, this.connectFailureListener, this);
                        connection.addEventListener(orbiter_2.ConnectionEvent.DISCONNECT, this.disconnectListener, this);
                        connection.addEventListener(orbiter_2.ConnectionEvent.CLIENT_KILL_CONNECT, this.clientKillConnectListener, this);
                        connection.addEventListener(orbiter_2.ConnectionEvent.SERVER_KILL_CONNECT, this.serverKillConnectListener, this);
                    }
                };
                ConnectionManager.prototype.advance = function () {
                    this.currentConnectionIndex++;
                    if (this.currentConnectionIndex == this.connections.length) {
                        this.currentConnectionIndex = 0;
                    }
                };
                ConnectionManager.prototype.advanceAndConnect = function () {
                    if (!this.connectAttemptComplete()) {
                        this.advance();
                        this.connectCurrentConnection();
                    }
                    else {
                        this.connectFailedCount++;
                        this.setConnectionState(orbiter_2.ConnectionState.NOT_CONNECTED);
                        this.orbiter.getLog().info('[CONNECTION_MANAGER] Connection failed for all specified hosts and ports.');
                        this.dispatchConnectFailure("Connection failed for all specified hosts and ports.");
                    }
                };
                ConnectionManager.prototype.clearAffinity = function (host) {
                    var _a, _b;
                    (_a = this.affinityData) === null || _a === void 0 ? void 0 : _a.remove('affinity', host + 'address');
                    (_b = this.affinityData) === null || _b === void 0 ? void 0 : _b.remove('affinity', host + 'until');
                };
                ConnectionManager.prototype.clientKillConnectListener = function (e) {
                    this.dispatchClientKillConnect(e.target);
                };
                ConnectionManager.prototype.connectAttemptComplete = function () {
                    var _a;
                    return ((_a = this.attemptedConnections) === null || _a === void 0 ? void 0 : _a.length) == this.connections.length;
                };
                ConnectionManager.prototype.connectCurrentConnection = function () {
                    var _a, _b, _c, _d, _e, _f;
                    if (this.connections.length == 0) {
                        this.setConnectionState(orbiter_2.ConnectionState.NOT_CONNECTED);
                        this.connectFailedCount++;
                        this.dispatchConnectFailure('No connections defined. Connection attempt failed.');
                        return;
                    }
                    this.inProgressConnection = (_a = this.getCurrentConnection()) !== null && _a !== void 0 ? _a : undefined;
                    if (this.inProgressConnection && ((_b = this.attemptedConnections) === null || _b === void 0 ? void 0 : _b.indexOf(this.inProgressConnection)) != -1) {
                        this.advanceAndConnect();
                        return;
                    }
                    this.inProgressConnection && this.dispatchSelectConnection(this.inProgressConnection);
                    this.orbiter.getLog().info("[CONNECTION_MANAGER] Attempting connection via " + ((_c = this.inProgressConnection) === null || _c === void 0 ? void 0 : _c.toString()) + ". (Connection " + (((_e = (_d = this.attemptedConnections) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0) + 1) + " of " + this.connections.length + ". Attempt " + this.connectAttemptCount + " since last successful connection).");
                    this.inProgressConnection && this.addConnectionListeners(this.inProgressConnection);
                    (_f = this.inProgressConnection) === null || _f === void 0 ? void 0 : _f.connect();
                };
                ConnectionManager.prototype.connectFailureListener = function (e) {
                    var _a, _b;
                    var failedConnection = e.target;
                    this.orbiter.getLog().warn("[CONNECTION_MANAGER] Connection failed for " + (failedConnection === null || failedConnection === void 0 ? void 0 : failedConnection.toString()) + ". Status: [" + e.getStatus() + "]");
                    this.removeConnectionListeners(failedConnection);
                    this.inProgressConnection = undefined;
                    if (this.connectionState == orbiter_2.ConnectionState.DISCONNECTION_IN_PROGRESS) {
                        this.dispatchConnectFailure('Connection closed by client.');
                    }
                    else {
                        if (failedConnection.getHost() != failedConnection.getRequestedHost()) {
                            this.orbiter.getLog().info("[CONNECTION_MANAGER] Connection failed for affinity address [" + failedConnection.getHost() + "]. Removing affinity.");
                            this.clearAffinity((_a = failedConnection.getRequestedHost()) !== null && _a !== void 0 ? _a : '');
                        }
                        (_b = this.attemptedConnections) === null || _b === void 0 ? void 0 : _b.push(failedConnection);
                        this.advanceAndConnect();
                    }
                };
                ConnectionManager.prototype.disconnectConnection = function (connection) {
                    connection === null || connection === void 0 ? void 0 : connection.disconnect();
                };
                ConnectionManager.prototype.disconnectListener = function (e) {
                    this.setConnectionState(orbiter_2.ConnectionState.NOT_CONNECTED);
                    this.removeConnectionListeners(e.target);
                    this.activeConnection = undefined;
                    this.dispatchDisconnect(e.target);
                };
                ConnectionManager.prototype.dispatchBeginConnect = function () {
                    this.dispatchEvent(new orbiter_2.ConnectionManagerEvent(orbiter_2.ConnectionManagerEvent.BEGIN_CONNECT));
                };
                ConnectionManager.prototype.dispatchClientKillConnect = function (connection) {
                    this.dispatchEvent(new orbiter_2.ConnectionManagerEvent(orbiter_2.ConnectionManagerEvent.CLIENT_KILL_CONNECT, connection));
                };
                ConnectionManager.prototype.dispatchConnectFailure = function (status) {
                    this.dispatchEvent(new orbiter_2.ConnectionManagerEvent(orbiter_2.ConnectionManagerEvent.CONNECT_FAILURE, undefined, status));
                };
                ConnectionManager.prototype.dispatchConnectionStateChange = function () {
                    this.dispatchEvent(new orbiter_2.ConnectionManagerEvent(orbiter_2.ConnectionManagerEvent.CONNECTION_STATE_CHANGE));
                };
                ConnectionManager.prototype.dispatchDisconnect = function (connection) {
                    this.dispatchEvent(new orbiter_2.ConnectionManagerEvent(orbiter_2.ConnectionManagerEvent.DISCONNECT, connection));
                };
                ConnectionManager.prototype.dispatchReady = function () {
                    this.dispatchEvent(new orbiter_2.ConnectionManagerEvent(orbiter_2.ConnectionManagerEvent.READY));
                };
                ConnectionManager.prototype.dispatchSelectConnection = function (connection) {
                    this.dispatchEvent(new orbiter_2.ConnectionManagerEvent(orbiter_2.ConnectionManagerEvent.SELECT_CONNECTION, connection));
                };
                ConnectionManager.prototype.dispatchServerKillConnect = function (connection) {
                    this.dispatchEvent(new orbiter_2.ConnectionManagerEvent(orbiter_2.ConnectionManagerEvent.SERVER_KILL_CONNECT, connection));
                };
                ConnectionManager.prototype.readyListener = function (e) {
                    this.setConnectionState(orbiter_2.ConnectionState.READY);
                    this.inProgressConnection = undefined;
                    this.activeConnection = e.target;
                    this.readyCount++;
                    this.connectFailedCount = 0;
                    this.connectAttemptCount = 0;
                    this.connectAbortCount = 0;
                    this.dispatchReady();
                };
                ;
                ConnectionManager.prototype.removeConnectionListeners = function (connection) {
                    if (connection) {
                        connection.removeEventListener(orbiter_2.ConnectionEvent.READY, this.readyListener, this);
                        connection.removeEventListener(orbiter_2.ConnectionEvent.CONNECT_FAILURE, this.connectFailureListener, this);
                        connection.removeEventListener(orbiter_2.ConnectionEvent.DISCONNECT, this.disconnectListener, this);
                        connection.removeEventListener(orbiter_2.ConnectionEvent.CLIENT_KILL_CONNECT, this.clientKillConnectListener, this);
                        connection.removeEventListener(orbiter_2.ConnectionEvent.SERVER_KILL_CONNECT, this.serverKillConnectListener, this);
                    }
                };
                ConnectionManager.prototype.serverKillConnectListener = function (e) {
                    this.dispatchServerKillConnect(e.target);
                };
                ConnectionManager.DEFAULT_READY_TIMEOUT = 10000;
                return ConnectionManager;
            }(net.user1.events.EventDispatcher));
            orbiter_2.ConnectionManager = ConnectionManager;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ConnectionManagerEvent = (function (_super) {
                __extends(ConnectionManagerEvent, _super);
                function ConnectionManagerEvent(type, connection, status) {
                    var _this = _super.call(this, type) || this;
                    _this.connection = connection;
                    _this.status = status;
                    return _this;
                }
                ConnectionManagerEvent.prototype.getConnection = function () {
                    var _a;
                    return (_a = this.connection) !== null && _a !== void 0 ? _a : null;
                };
                ConnectionManagerEvent.prototype.getStatus = function () {
                    var _a;
                    return (_a = this.status) !== null && _a !== void 0 ? _a : null;
                };
                ConnectionManagerEvent.prototype.toString = function () {
                    return '[object ConnectionManagerEvent]';
                };
                ConnectionManagerEvent.BEGIN_CONNECT = 'BEGIN_CONNECT';
                ConnectionManagerEvent.CLIENT_KILL_CONNECT = 'CLIENT_KILL_CONNECT';
                ConnectionManagerEvent.CONNECTION_STATE_CHANGE = 'CONNECTION_STATE_CHANGE';
                ConnectionManagerEvent.CONNECT_FAILURE = 'CONNECT_FAILURE';
                ConnectionManagerEvent.DISCONNECT = 'DISCONNECT';
                ConnectionManagerEvent.READY = 'READY';
                ConnectionManagerEvent.SELECT_CONNECTION = 'SELECT_CONNECTION';
                ConnectionManagerEvent.SERVER_KILL_CONNECT = 'SERVER_KILL_CONNECT';
                ConnectionManagerEvent.SESSION_TERMINATED = 'SESSION_TERMINATED';
                return ConnectionManagerEvent;
            }(net.user1.events.Event));
            orbiter.ConnectionManagerEvent = ConnectionManagerEvent;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter_3) {
            var ConnectionMonitor = (function () {
                function ConnectionMonitor(orbiter) {
                    this.orbiter = orbiter;
                    this.autoReconnectAttemptLimit = -1;
                    this.autoReconnectDelayFirstAttempt = false;
                    this.autoReconnectFrequency = -1;
                    this.autoReconnectMaxMS = 0;
                    this.autoReconnectMinMS = 0;
                    this.autoReconnectTimeoutID = -1;
                    this.connectionTimeout = 0;
                    this.disposed = false;
                    this.heartBeatFrequency = -1;
                    this.heartbeatCounter = 0;
                    this.heartbeatEnabled = true;
                    this.heartbeatIntervalID = -1;
                    this.heartbeats = {};
                    this.oldestHeartbeat = 0;
                    this.sharedPing = false;
                    this.autoReconnectTimeoutID = -1;
                    this.msgManager = orbiter.getMessageManager();
                    this.log = orbiter.getLog();
                    this.orbiter.addEventListener(orbiter_3.OrbiterEvent.READY, this.connectReadyListener, this);
                    this.orbiter.addEventListener(orbiter_3.OrbiterEvent.CLOSE, this.connectCloseListener, this);
                    this.disableHeartbeatLogging();
                }
                ConnectionMonitor.prototype.disableHeartbeat = function () {
                    this.log.info('[CONNECTION_MONITOR] Heartbeat disabled.');
                    this.heartbeatEnabled = false;
                    this.stopHeartbeat();
                };
                ConnectionMonitor.prototype.disableHeartbeatLogging = function () {
                    this.log.addSuppressionTerm('<A>CLIENT_HEARTBEAT</A>');
                    this.log.addSuppressionTerm('<A>_PING</A>');
                    this.log.addSuppressionTerm('[_PING]');
                    this.log.addSuppressionTerm('<![CDATA[_PING]]>');
                };
                ConnectionMonitor.prototype.dispose = function () {
                    this.disposed = true;
                    this.stopHeartbeat();
                    this.stopReconnect();
                    this.heartbeats = null;
                    this.orbiter.removeEventListener(orbiter_3.OrbiterEvent.READY, this.connectReadyListener, this);
                    this.orbiter.removeEventListener(orbiter_3.OrbiterEvent.CLOSE, this.connectCloseListener, this);
                    this.orbiter = null;
                    this.msgManager = null;
                    this.log = null;
                };
                ConnectionMonitor.prototype.enableHeartbeat = function () {
                    this.log.info('[CONNECTION_MONITOR] Heartbeat enabled.');
                    this.heartbeatEnabled = true;
                    this.startHeartbeat();
                };
                ConnectionMonitor.prototype.enableHeartbeatLogging = function () {
                    this.log.removeSuppressionTerm('<A>CLIENT_HEARTBEAT</A>');
                    this.log.removeSuppressionTerm('<A>_PING</A>');
                    this.log.removeSuppressionTerm('[_PING]');
                    this.log.removeSuppressionTerm('<![CDATA[_PING]]>');
                };
                ConnectionMonitor.prototype.getAutoReconnectAttemptLimit = function () {
                    return this.autoReconnectAttemptLimit;
                };
                ConnectionMonitor.prototype.getAutoReconnectFrequency = function () {
                    return this.autoReconnectFrequency;
                };
                ConnectionMonitor.prototype.getConnectionTimeout = function () {
                    return this.connectionTimeout;
                };
                ConnectionMonitor.prototype.getHeartbeatFrequency = function () {
                    return this.heartBeatFrequency;
                };
                ConnectionMonitor.prototype.isPingShared = function () {
                    return this.sharedPing;
                };
                ConnectionMonitor.prototype.restoreDefaults = function () {
                    this.setAutoReconnectFrequency(ConnectionMonitor.DEFAULT_AUTORECONNECT_FREQUENCY);
                    this.setAutoReconnectAttemptLimit(ConnectionMonitor.DEFAULT_AUTORECONNECT_ATTEMPT_LIMIT);
                    this.setConnectionTimeout(ConnectionMonitor.DEFAULT_CONNECTION_TIMEOUT);
                    this.setHeartbeatFrequency(ConnectionMonitor.DEFAULT_HEARTBEAT_FREQUENCY);
                };
                ConnectionMonitor.prototype.setAutoReconnectAttemptLimit = function (attempts) {
                    if (attempts < -1 || attempts == 0) {
                        this.log.warn("[CONNECTION_MONITOR] Invalid Auto-reconnect attempt limit specified: " + attempts + ". Limit must -1 or greater than 1.");
                        return;
                    }
                    this.autoReconnectAttemptLimit = attempts;
                    if (attempts == -1) {
                        this.log.info('[CONNECTION_MONITOR] Auto-reconnect attempt limit set to none.');
                    }
                    else {
                        this.log.info("[CONNECTION_MONITOR] Auto-reconnect attempt limit set to " + attempts + " attempt(s).");
                    }
                };
                ConnectionMonitor.prototype.setAutoReconnectFrequency = function (minMS, maxMS, delayFirstAttempt) {
                    maxMS = (typeof maxMS == 'undefined') ? -1 : maxMS;
                    delayFirstAttempt = (typeof delayFirstAttempt == 'undefined') ? false : delayFirstAttempt;
                    if (minMS == 0 || minMS < -1) {
                        this.log.warn("[CONNECTION_MONITOR] Invalid auto-reconnect minMS specified: [" + minMS + "]. Value must not be zero or less than -1. Value adjusted to [-1] (no reconnect).");
                        minMS = -1;
                    }
                    if (minMS == -1) {
                        this.stopReconnect();
                    }
                    else {
                        if (maxMS == -1) {
                            maxMS = minMS;
                        }
                        if (maxMS < minMS) {
                            this.log.warn("[CONNECTION_MONITOR] Invalid auto-reconnect maxMS specified: [" + maxMS + "]. Value of maxMS must be greater than or equal to minMS. Value adjusted to [" + minMS + "].");
                            maxMS = minMS;
                        }
                    }
                    this.autoReconnectDelayFirstAttempt = delayFirstAttempt;
                    this.autoReconnectMinMS = minMS;
                    this.autoReconnectMaxMS = maxMS;
                    this.log.info("[CONNECTION_MONITOR] Assigning auto-reconnect frequency settings: [minMS: " + minMS + ", maxMS: " + maxMS + ", delayFirstAttempt: " + delayFirstAttempt.toString() + "].");
                    if (minMS > 0 && minMS < 1000) {
                        this.log.info("[CONNECTION_MONITOR] RECONNECT FREQUENCY WARNING: " + minMS + " minMS specified. Current frequency will cause " + (Math.floor((1000 / minMS) * 10) / 10).toString() + " reconnection attempts per second.");
                    }
                    this.selectReconnectFrequency();
                };
                ConnectionMonitor.prototype.setConnectionTimeout = function (milliseconds) {
                    if (milliseconds > 0) {
                        this.connectionTimeout = milliseconds;
                        this.log.info("[CONNECTION_MONITOR] Connection timeout set to " + milliseconds + " ms.");
                    }
                    else {
                        this.log.warn("[CONNECTION_MONITOR] Invalid connection timeout specified: " + milliseconds + ". Frequency must be greater than zero.");
                    }
                };
                ConnectionMonitor.prototype.setHeartbeatFrequency = function (milliseconds) {
                    if (milliseconds >= ConnectionMonitor.MIN_HEARTBEAT_FREQUENCY) {
                        this.heartBeatFrequency = milliseconds;
                        this.log.info("[CONNECTION_MONITOR] Heartbeat frequency set to " + milliseconds + " ms.");
                        if (milliseconds >= ConnectionMonitor.MIN_HEARTBEAT_FREQUENCY && milliseconds < 1000) {
                            this.log.info("[CONNECTION_MONITOR] HEARTBEAT FREQUENCY WARNING: " + milliseconds + " ms. Current frequency will generate " + Math.floor((1000 / milliseconds) * 10) / 10 + " messages per second per connected client.");
                        }
                        if (this.orbiter.isReady()) {
                            this.startHeartbeat();
                        }
                    }
                    else {
                        this.log.warn("[CONNECTION_MONITOR] Invalid heartbeat frequency specified: " + milliseconds + ". Frequency must be " + ConnectionMonitor.MIN_HEARTBEAT_FREQUENCY + " or greater.");
                    }
                };
                ConnectionMonitor.prototype.sharePing = function (share) {
                    this.sharedPing = share;
                };
                ConnectionMonitor.prototype.connectCloseListener = function (e) {
                    var _this = this;
                    this.stopHeartbeat();
                    var numAttempts = this.orbiter.getConnectionManager().getConnectAttemptCount();
                    if (numAttempts == 0) {
                        this.selectReconnectFrequency();
                    }
                    if (this.autoReconnectFrequency > -1) {
                        if (this.autoReconnectTimeoutID != -1) {
                            return;
                        }
                        else {
                            setTimeout(function () {
                                if (!_this.disposed && _this.autoReconnectFrequency != -1) {
                                    _this.log.warn('[CONNECTION_MONITOR] Disconnection detected.');
                                    if (_this.autoReconnectDelayFirstAttempt && ((numAttempts == 0) || (numAttempts == 1 && _this.orbiter.getConnectionManager().getReadyCount() == 0))) {
                                        _this.log.info("[CONNECTION_MONITOR] Delaying reconnection attempt by " + _this.autoReconnectFrequency + " ms...");
                                        _this.scheduleReconnect(_this.autoReconnectFrequency);
                                    }
                                    else {
                                        _this.doReconnect();
                                    }
                                }
                            }, 1);
                        }
                    }
                };
                ConnectionMonitor.prototype.connectReadyListener = function (e) {
                    this.msgManager.addMessageListener(orbiter_3.Messages.CLIENT_HEARTBEAT, this.heartbeatMessageListener, this);
                    this.startHeartbeat();
                    this.stopReconnect();
                };
                ConnectionMonitor.prototype.doReconnect = function () {
                    var numActualAttempts = this.orbiter.getConnectionManager().getConnectAttemptCount();
                    var numReconnectAttempts;
                    if (this.orbiter.getConnectionManager().getReadyCount() == 0) {
                        numReconnectAttempts = numActualAttempts - 1;
                    }
                    else {
                        numReconnectAttempts = numActualAttempts;
                    }
                    if (this.autoReconnectAttemptLimit != -1 && numReconnectAttempts > 0 && numReconnectAttempts % (this.autoReconnectAttemptLimit) == 0) {
                        this.log.warn("[CONNECTION_MONITOR] Automatic reconnect attempt limit reached. No further automatic connection attempts will be made until the next manual connection attempt.");
                        return;
                    }
                    this.scheduleReconnect(this.autoReconnectFrequency);
                    this.log.warn("[CONNECTION_MONITOR] Attempting automatic reconnect. (Next attempt in " + this.autoReconnectFrequency + "ms.)");
                    this.orbiter.connect();
                };
                ConnectionMonitor.prototype.heartbeatMessageListener = function (fromClientID, id) {
                    var _a;
                    var ping = new Date().getTime() - this.heartbeats[parseInt(id)];
                    (_a = this.orbiter.self()) === null || _a === void 0 ? void 0 : _a.setAttribute('_PING', ping.toString(), undefined, this.sharedPing);
                    delete this.heartbeats[parseInt(id)];
                };
                ConnectionMonitor.prototype.heartbeatTimerListener = function () {
                    if (!this.orbiter.isReady()) {
                        this.log.info('[CONNECTION_MONITOR] Orbiter is not connected. Stopping heartbeat.');
                        this.stopHeartbeat();
                        return;
                    }
                    var now = new Date().getTime();
                    this.heartbeats[this.heartbeatCounter] = now;
                    this.orbiter.getMessageManager().sendUPC('u2', orbiter_3.Messages.CLIENT_HEARTBEAT, this.orbiter.getClientID(), '', this.heartbeatCounter.toString());
                    this.heartbeatCounter++;
                    if (net.user1.utils.ObjectUtil.len(this.heartbeats) == 1) {
                        this.oldestHeartbeat = now;
                    }
                    else {
                        this.oldestHeartbeat = Number.MAX_VALUE;
                        for (var p in this.heartbeats) {
                            if (this.heartbeats.hasOwnProperty(p) && this.heartbeats[p] < this.oldestHeartbeat) {
                                this.oldestHeartbeat = this.heartbeats[p];
                            }
                        }
                    }
                    var timeSinceOldestHeartbeat = now - this.oldestHeartbeat;
                    if (timeSinceOldestHeartbeat > this.connectionTimeout) {
                        this.log.warn("[CONNECTION_MONITOR] No response from server in " + timeSinceOldestHeartbeat + "ms. Starting automatic disconnect.");
                        this.orbiter.disconnect();
                    }
                };
                ConnectionMonitor.prototype.reconnectTimerListener = function () {
                    this.stopReconnect();
                    if (this.orbiter.getConnectionManager().connectionState == orbiter_3.ConnectionState.NOT_CONNECTED) {
                        this.doReconnect();
                    }
                };
                ConnectionMonitor.prototype.scheduleReconnect = function (milliseconds) {
                    var _this = this;
                    this.stopReconnect();
                    this.autoReconnectTimeoutID = setTimeout(function () { return _this.reconnectTimerListener(); }, milliseconds);
                };
                ConnectionMonitor.prototype.selectReconnectFrequency = function () {
                    if (this.autoReconnectMinMS == -1) {
                        this.autoReconnectFrequency = -1;
                    }
                    else if (this.autoReconnectMinMS == this.autoReconnectMaxMS) {
                        this.autoReconnectFrequency = this.autoReconnectMinMS;
                    }
                    else {
                        this.autoReconnectFrequency = getRandInt(this.autoReconnectMinMS, this.autoReconnectMaxMS);
                        this.log.info("[CONNECTION_MONITOR] Random auto-reconnect frequency selected: [" + this.autoReconnectFrequency + "] ms.");
                    }
                    function getRandInt(min, max) {
                        return min + Math.floor(Math.random() * (max + 1 - min));
                    }
                };
                ConnectionMonitor.prototype.startHeartbeat = function () {
                    var _this = this;
                    if (!this.heartbeatEnabled) {
                        this.log.info('[CONNECTION_MONITOR] Heartbeat is currently disabled. Ignoring start request.');
                        return;
                    }
                    this.stopHeartbeat();
                    this.heartbeats = {};
                    this.heartbeatIntervalID = setInterval(function () { return _this.heartbeatTimerListener(); }, this.heartBeatFrequency);
                };
                ConnectionMonitor.prototype.stopHeartbeat = function () {
                    clearInterval(this.heartbeatIntervalID);
                    this.heartbeats = undefined;
                };
                ConnectionMonitor.prototype.stopReconnect = function () {
                    clearTimeout(this.autoReconnectTimeoutID);
                    this.autoReconnectTimeoutID = -1;
                };
                ConnectionMonitor.DEFAULT_AUTORECONNECT_ATTEMPT_LIMIT = -1;
                ConnectionMonitor.DEFAULT_AUTORECONNECT_FREQUENCY = -1;
                ConnectionMonitor.DEFAULT_CONNECTION_TIMEOUT = 60000;
                ConnectionMonitor.DEFAULT_HEARTBEAT_FREQUENCY = 10000;
                ConnectionMonitor.MIN_HEARTBEAT_FREQUENCY = 20;
                return ConnectionMonitor;
            }());
            orbiter_3.ConnectionMonitor = ConnectionMonitor;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ConnectionRefusal = (function () {
                function ConnectionRefusal(reason, description) {
                    this.bannedAt = NaN;
                    this.banDuration = NaN;
                    this.banReason = '';
                    this.reason = reason;
                    this.description = description;
                    switch (reason) {
                        case orbiter.ConnectionRefusalReason.BANNED:
                            var banDetails = description.split(orbiter.Tokens.RS);
                            this.bannedAt = parseFloat(banDetails[0]);
                            this.banDuration = parseFloat(banDetails[1]);
                            this.banReason = banDetails[2];
                            break;
                    }
                }
                return ConnectionRefusal;
            }());
            orbiter.ConnectionRefusal = ConnectionRefusal;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ConnectionRefusalReason;
            (function (ConnectionRefusalReason) {
                ConnectionRefusalReason["BANNED"] = "BANNED";
            })(ConnectionRefusalReason = orbiter.ConnectionRefusalReason || (orbiter.ConnectionRefusalReason = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ConnectionState;
            (function (ConnectionState) {
                ConnectionState[ConnectionState["UNKNOWN"] = -1] = "UNKNOWN";
                ConnectionState[ConnectionState["NOT_CONNECTED"] = 0] = "NOT_CONNECTED";
                ConnectionState[ConnectionState["READY"] = 1] = "READY";
                ConnectionState[ConnectionState["CONNECTION_IN_PROGRESS"] = 2] = "CONNECTION_IN_PROGRESS";
                ConnectionState[ConnectionState["DISCONNECTION_IN_PROGRESS"] = 3] = "DISCONNECTION_IN_PROGRESS";
                ConnectionState[ConnectionState["LOGGED_IN"] = 4] = "LOGGED_IN";
            })(ConnectionState = orbiter.ConnectionState || (orbiter.ConnectionState = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ConnectionType;
            (function (ConnectionType) {
                ConnectionType["HTTP"] = "HTTP";
                ConnectionType["SECURE_HTTP"] = "SECURE_HTTP";
                ConnectionType["WEBSOCKET"] = "WEBSOCKET";
                ConnectionType["SECURE_WEBSOCKET"] = "SECURE_WEBSOCKET";
            })(ConnectionType = orbiter.ConnectionType || (orbiter.ConnectionType = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var logger;
        (function (logger) {
            var ConsoleLogger = (function () {
                function ConsoleLogger(log) {
                    this.log = log;
                    this.log.addEventListener(logger.LogEvent.UPDATE, net.user1.logger.ConsoleLogger.updateListener, this);
                    var history = this.log.getHistory();
                    for (var i = 0; i < history.length; i++) {
                        net.user1.logger.ConsoleLogger.out(history[i]);
                    }
                }
                ConsoleLogger.updateListener = function (e) {
                    var timeStamp = e.getTimeStamp(), level = e.getLevel(), bufferSpace = (level == logger.Logger.INFO || level == logger.Logger.WARN) ? " " : "";
                    net.user1.logger.ConsoleLogger.out("" + timeStamp + (timeStamp == "" ? "" : " ") + e.getLevel() + ": " + bufferSpace + e.getMessage());
                };
                ConsoleLogger.out = function (value) {
                    console === null || console === void 0 ? void 0 : console.log(value);
                };
                ConsoleLogger.prototype.dispose = function () {
                    this.log.removeEventListener(logger.LogEvent.UPDATE, net.user1.logger.ConsoleLogger.updateListener, this);
                    this.log = null;
                };
                return ConsoleLogger;
            }());
            logger.ConsoleLogger = ConsoleLogger;
        })(logger = user1.logger || (user1.logger = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var logger;
        (function (logger) {
            var LogEvent = (function (_super) {
                __extends(LogEvent, _super);
                function LogEvent(type, message, level, timeStamp) {
                    var _this = _super.call(this, type) || this;
                    _this.message = message;
                    _this.level = level;
                    _this.timeStamp = timeStamp;
                    return _this;
                }
                LogEvent.prototype.getLevel = function () {
                    var _a;
                    return (_a = this.level) !== null && _a !== void 0 ? _a : null;
                };
                LogEvent.prototype.getMessage = function () {
                    var _a;
                    return (_a = this.message) !== null && _a !== void 0 ? _a : null;
                };
                LogEvent.prototype.getTimeStamp = function () {
                    var _a;
                    return (_a = this.timeStamp) !== null && _a !== void 0 ? _a : null;
                };
                LogEvent.prototype.toString = function () {
                    return '[object LogEvent]';
                };
                LogEvent.LEVEL_CHANGE = 'LEVEL_CHANGE';
                LogEvent.UPDATE = 'UPDATE';
                return LogEvent;
            }(net.user1.events.Event));
            logger.LogEvent = LogEvent;
        })(logger = user1.logger || (user1.logger = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter_4) {
            var LogEvent = net.user1.logger.LogEvent;
            var CoreEventLogger = (function () {
                function CoreEventLogger(log, connectionMan, roomMan, accountMan, server, clientMan, orbiter) {
                    this.log = log;
                    accountMan.addEventListener(orbiter_4.AccountEvent.CHANGE_PASSWORD, this.changePasswordListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountEvent.CHANGE_PASSWORD_RESULT, this.changePasswordResultListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountEvent.LOGIN, this.loginListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountEvent.LOGIN_RESULT, this.loginResultListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountEvent.LOGOFF, this.logoffListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountEvent.LOGOFF_RESULT, this.logoffResultListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountEvent.OBSERVE, this.observeAccountListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountEvent.OBSERVE_RESULT, this.observeAccountResultListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountEvent.STOP_OBSERVING, this.stopObservingAccountListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountEvent.STOP_OBSERVING_RESULT, this.stopObservingAccountResultListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountManagerEvent.ACCOUNT_ADDED, this.accountAddedListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountManagerEvent.ACCOUNT_REMOVED, this.accountRemovedListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountManagerEvent.CREATE_ACCOUNT_RESULT, this.createAccountResultListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountManagerEvent.REMOVE_ACCOUNT_RESULT, this.removeAccountResultListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountManagerEvent.STOP_WATCHING_FOR_ACCOUNTS_RESULT, this.stopWatchingForAccountsResultListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountManagerEvent.SYNCHRONIZE, this.synchronizeAccountsListener, this, integer.MAX_VALUE);
                    accountMan.addEventListener(orbiter_4.AccountManagerEvent.WATCH_FOR_ACCOUNTS_RESULT, this.watchForAccountsResultListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientEvent.OBSERVE, this.observeClientListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientEvent.OBSERVE_RESULT, this.observeClientResultListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientEvent.STOP_OBSERVING, this.stopObservingClientListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientEvent.STOP_OBSERVING_RESULT, this.stopObservingClientResultListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientManagerEvent.ADDRESS_BANNED, this.addressBannedListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientManagerEvent.ADDRESS_UNBANNED, this.addressUnbannedListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientManagerEvent.CLIENT_CONNECTED, this.clientConnectedListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientManagerEvent.CLIENT_DISCONNECTED, this.clientDisconnectedListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientManagerEvent.STOP_WATCHING_FOR_BANNED_ADDRESSES_RESULT, this.stopWatchingForBannedAddressesResultListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientManagerEvent.STOP_WATCHING_FOR_CLIENTS_RESULT, this.stopWatchingForClientsResultListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientManagerEvent.SYNCHRONIZE, this.synchronizeClientsListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientManagerEvent.SYNCHRONIZE_BANLIST, this.synchronizeBanlistListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientManagerEvent.WATCH_FOR_BANNED_ADDRESSES_RESULT, this.watchForBannedAddressesResultListener, this, integer.MAX_VALUE);
                    clientMan.addEventListener(orbiter_4.ClientManagerEvent.WATCH_FOR_CLIENTS_RESULT, this.watchForClientsResultListener, this, integer.MAX_VALUE);
                    connectionMan.addEventListener(orbiter_4.ConnectionManagerEvent.CLIENT_KILL_CONNECT, this.clientKillConnectListener, this, integer.MAX_VALUE);
                    connectionMan.addEventListener(orbiter_4.ConnectionManagerEvent.CONNECT_FAILURE, this.connectFailureListener, this, integer.MAX_VALUE);
                    connectionMan.addEventListener(orbiter_4.ConnectionManagerEvent.SERVER_KILL_CONNECT, this.serverKillConnectListener, this, integer.MAX_VALUE);
                    orbiter.addEventListener(orbiter_4.OrbiterEvent.CONNECT_REFUSED, this.connectRefusedListener, this, integer.MAX_VALUE);
                    orbiter.addEventListener(orbiter_4.OrbiterEvent.PROTOCOL_INCOMPATIBLE, this.protocolIncompatibleListener, this, integer.MAX_VALUE);
                    orbiter.addEventListener(orbiter_4.OrbiterEvent.READY, this.readyListener, this, integer.MAX_VALUE);
                    roomMan.addEventListener(orbiter_4.RoomEvent.JOIN_RESULT, this.joinRoomResultListener, this, integer.MAX_VALUE);
                    roomMan.addEventListener(orbiter_4.RoomEvent.LEAVE_RESULT, this.leaveRoomResultListener, this, integer.MAX_VALUE);
                    roomMan.addEventListener(orbiter_4.RoomEvent.OBSERVE_RESULT, this.observeRoomResultListener, this, integer.MAX_VALUE);
                    roomMan.addEventListener(orbiter_4.RoomEvent.STOP_OBSERVING_RESULT, this.stopObservingRoomResultListener, this, integer.MAX_VALUE);
                    roomMan.addEventListener(orbiter_4.RoomManagerEvent.CREATE_ROOM_RESULT, this.createRoomResultListener, this, integer.MAX_VALUE);
                    roomMan.addEventListener(orbiter_4.RoomManagerEvent.REMOVE_ROOM_RESULT, this.removeRoomResultListener, this, integer.MAX_VALUE);
                    roomMan.addEventListener(orbiter_4.RoomManagerEvent.ROOM_ADDED, this.roomAddedListener, this, integer.MAX_VALUE);
                    roomMan.addEventListener(orbiter_4.RoomManagerEvent.ROOM_COUNT, this.roomCountListener, this, integer.MAX_VALUE);
                    roomMan.addEventListener(orbiter_4.RoomManagerEvent.ROOM_REMOVED, this.roomRemovedListener, this, integer.MAX_VALUE);
                    roomMan.addEventListener(orbiter_4.RoomManagerEvent.STOP_WATCHING_FOR_ROOMS_RESULT, this.stopWatchingForRoomsResultListener, this, integer.MAX_VALUE);
                    roomMan.addEventListener(orbiter_4.RoomManagerEvent.WATCH_FOR_ROOMS_RESULT, this.watchForRoomsResultListener, this, integer.MAX_VALUE);
                    server.addEventListener(orbiter_4.ServerEvent.TIME_SYNC, this.timeSyncListener, this, integer.MAX_VALUE);
                    this.log.addEventListener(LogEvent.LEVEL_CHANGE, this.logLevelChangeListener, this, integer.MAX_VALUE);
                }
                CoreEventLogger.prototype.accountAddedListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] Account added: " + e.getAccount());
                };
                CoreEventLogger.prototype.accountRemovedListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] Account removed: " + e.getAccount());
                };
                CoreEventLogger.prototype.addressBannedListener = function (e) {
                    this.log.info("[CLIENT_MANAGER] Client address banned: [" + e.getAddress() + "].");
                };
                CoreEventLogger.prototype.addressUnbannedListener = function (e) {
                    this.log.info("[CLIENT_MANAGER] Client address unbanned. ClientID: [" + e.getAddress() + "].");
                };
                CoreEventLogger.prototype.changePasswordListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] Password changed for account: " + e.getUserID());
                };
                CoreEventLogger.prototype.changePasswordResultListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] Result for changePassword(). Account: " + e.getUserID() + ", Status: " + e.getStatus());
                };
                CoreEventLogger.prototype.clientConnectedListener = function (e) {
                    this.log.info("[CLIENT_MANAGER] Foreign client connected. ClientID: [" + e.getClientID() + "].");
                };
                CoreEventLogger.prototype.clientDisconnectedListener = function (e) {
                    this.log.info("[CLIENT_MANAGER] Foreign client disconnected. ClientID: [" + e.getClientID() + "].");
                };
                CoreEventLogger.prototype.clientKillConnectListener = function (e) {
                    this.log.info('[CONNECTION_MANAGER] Connection to server closed by client.');
                };
                CoreEventLogger.prototype.connectFailureListener = function (e) {
                    this.log.info("[CONNECTION_MANAGER] " + e.getStatus());
                };
                CoreEventLogger.prototype.connectRefusedListener = function (e) {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    if (((_a = e.getConnectionRefusal()) === null || _a === void 0 ? void 0 : _a.reason) == orbiter_4.ConnectionRefusalReason.BANNED) {
                        this.log.warn("[ORBITER] Union Server refused the connection because the client address is banned for the following reason: [" + ((_b = e.getConnectionRefusal()) === null || _b === void 0 ? void 0 : _b.banReason) + "]. The ban started at: [" + new Date((_d = (_c = e.getConnectionRefusal()) === null || _c === void 0 ? void 0 : _c.bannedAt) !== null && _d !== void 0 ? _d : 0) + "]. The ban duration is: [" + net.user1.utils.NumericFormatter.msToElapsedDayHrMinSec((_f = (_e = e.getConnectionRefusal()) === null || _e === void 0 ? void 0 : _e.banDuration) !== null && _f !== void 0 ? _f : 0 * 1000) + "].");
                    }
                    else {
                        this.log.warn("[ORBITER] Union Server refused the connection. Reason: [" + ((_g = e.getConnectionRefusal()) === null || _g === void 0 ? void 0 : _g.reason) + "]. Description: [" + ((_h = e.getConnectionRefusal()) === null || _h === void 0 ? void 0 : _h.description) + "].");
                    }
                };
                CoreEventLogger.prototype.createAccountResultListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] Result for createAccount(). Account: " + e.getUserID() + ", Status: " + e.getStatus());
                };
                CoreEventLogger.prototype.createRoomResultListener = function (e) {
                    this.log.info("[ROOM_MANAGER] Room creation result for room [" + e.getRoomID() + "]: " + e.getStatus());
                };
                CoreEventLogger.prototype.joinRoomResultListener = function (e) {
                    this.log.info("[ROOM_MANAGER] Join result for room [" + e.getRoomID() + "]: " + e.getStatus());
                };
                CoreEventLogger.prototype.leaveRoomResultListener = function (e) {
                    this.log.info("[ROOM_MANAGER] Leave result for room [" + e.getRoomID() + "]: " + e.getStatus());
                };
                CoreEventLogger.prototype.logLevelChangeListener = function (e) {
                    this.log.info("[LOGGER] Log level set to: [" + e.getLevel() + "].");
                };
                CoreEventLogger.prototype.loginListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] Account logged in: " + e.getAccount());
                };
                CoreEventLogger.prototype.loginResultListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] Result for login(). Account: " + e.getAccount() + ", Status: " + e.getStatus());
                };
                CoreEventLogger.prototype.logoffListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] Account logged off: " + e.getAccount());
                };
                CoreEventLogger.prototype.logoffResultListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] Result for logoff(). Account: " + e.getAccount() + ", Status: " + e.getStatus());
                };
                CoreEventLogger.prototype.observeAccountListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] Account observed: " + e.getAccount());
                };
                CoreEventLogger.prototype.observeAccountResultListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] 'Observe account result' for account: " + e.getAccount() + ", Status: " + e.getStatus());
                };
                CoreEventLogger.prototype.observeClientListener = function (e) {
                    this.log.info("[CLIENT_MANAGER] Client observed: " + e.getClient());
                };
                CoreEventLogger.prototype.observeClientResultListener = function (e) {
                    this.log.info("[CLIENT_MANAGER] 'Observe client' result for client: " + e.getClient() + ", status: " + e.getStatus());
                };
                CoreEventLogger.prototype.observeRoomResultListener = function (e) {
                    this.log.info("[ROOM_MANAGER] Observe result for room [" + e.getRoomID() + "]: " + e.getStatus());
                };
                CoreEventLogger.prototype.protocolIncompatibleListener = function (e) {
                    var _a, _b;
                    this.log.warn("[ORBITER] Orbiter UPC protocol incompatibility detected. Client UPC version: " + ((_a = e.target) === null || _a === void 0 ? void 0 : _a.getSystem().getUPCVersion().toString()) + ". Server version: " + ((_b = e.getServerUPCVersion()) === null || _b === void 0 ? void 0 : _b.toString()) + ".");
                };
                CoreEventLogger.prototype.readyListener = function (e) {
                    this.log.info('[ORBITER] Orbiter now connected and ready.');
                };
                CoreEventLogger.prototype.removeAccountResultListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] Result for removeAccount(). Account: " + e.getUserID() + ", Status: " + e.getStatus());
                };
                CoreEventLogger.prototype.removeRoomResultListener = function (e) {
                    this.log.info("[ROOM_MANAGER] Room removal result for room [" + e.getRoomID() + "]: " + e.getStatus());
                };
                CoreEventLogger.prototype.roomAddedListener = function (e) {
                    this.log.info("[ROOM_MANAGER] Room added: " + e.getRoom() + ".");
                };
                CoreEventLogger.prototype.roomCountListener = function (e) {
                    this.log.info("[ROOM_MANAGER] New room count: " + e.getNumRooms() + ".");
                };
                CoreEventLogger.prototype.roomRemovedListener = function (e) {
                    this.log.info("[ROOM_MANAGER] Room removed: " + e.getRoom() + ".");
                };
                CoreEventLogger.prototype.serverKillConnectListener = function (e) {
                    this.log.info('[CONNECTION_MANAGER] Server closed the connection.');
                };
                CoreEventLogger.prototype.stopObservingAccountListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] Stopped observing account: " + e.getUserID());
                };
                ;
                CoreEventLogger.prototype.stopObservingAccountResultListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] 'Stop observing account result' for account: " + e.getUserID() + ", Status: " + e.getStatus());
                };
                CoreEventLogger.prototype.stopObservingClientListener = function (e) {
                    this.log.info("[CLIENT_MANAGER] Stopped observing client: " + e.getClient());
                };
                CoreEventLogger.prototype.stopObservingClientResultListener = function (e) {
                    this.log.info("[CLIENT_MANAGER] 'Stop observing client' result for client: " + e.getClient() + ", status: " + e.getStatus());
                };
                CoreEventLogger.prototype.stopObservingRoomResultListener = function (e) {
                    this.log.info("[ROOM_MANAGER] Stop observing result for room [" + e.getRoomID() + "]: " + e.getStatus());
                };
                CoreEventLogger.prototype.stopWatchingForAccountsResultListener = function (e) {
                    this.log.info("[SERVER] 'Stop watching for accounts' result: " + e.getStatus());
                };
                CoreEventLogger.prototype.stopWatchingForBannedAddressesResultListener = function (e) {
                    this.log.info("[CLIENT_MANAGER] 'Stop watching for banned addresses' result: " + e.getStatus());
                };
                CoreEventLogger.prototype.stopWatchingForClientsResultListener = function (e) {
                    this.log.info("[CLIENT_MANAGER] 'Stop watching for clients' result: " + e.getStatus());
                };
                CoreEventLogger.prototype.stopWatchingForRoomsResultListener = function (e) {
                    this.log.info("[ROOM_MANAGER] 'Stop watching for rooms' result for qualifier [" + e.getRoomIdQualifier() + "]: " + e.getStatus());
                };
                CoreEventLogger.prototype.synchronizeAccountsListener = function (e) {
                    this.log.info('[ACCOUNT_MANAGER] User account list synchronized with server.');
                };
                CoreEventLogger.prototype.synchronizeBanlistListener = function (e) {
                    this.log.info('[CLIENT_MANAGER] Banned list synchronized with server.');
                };
                CoreEventLogger.prototype.synchronizeClientsListener = function (e) {
                    this.log.info('[CLIENT_MANAGER] Client list synchronized with server.');
                };
                CoreEventLogger.prototype.timeSyncListener = function (e) {
                    var _a;
                    this.log.info("[SERVER] Server time synchronized with client. Approximate time on server is now: " + new Date((_a = e.target) === null || _a === void 0 ? void 0 : _a.getServerTime()));
                };
                CoreEventLogger.prototype.watchForAccountsResultListener = function (e) {
                    this.log.info("[ACCOUNT_MANAGER] 'Watch for accounts' result: " + e.getStatus());
                };
                CoreEventLogger.prototype.watchForBannedAddressesResultListener = function (e) {
                    this.log.info("[CLIENT_MANAGER] 'Watch for banned addresses' result: " + e.getStatus());
                };
                CoreEventLogger.prototype.watchForClientsResultListener = function (e) {
                    this.log.info("[CLIENT_MANAGER] 'Watch for clients' result: " + e.getStatus());
                };
                CoreEventLogger.prototype.watchForRoomsResultListener = function (e) {
                    this.log.info("[ROOM_MANAGER] 'Watch for rooms' result for qualifier [" + e.getRoomIdQualifier() + "]: " + e.getStatus());
                };
                return CoreEventLogger;
            }());
            orbiter_4.CoreEventLogger = CoreEventLogger;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter_5) {
            var CoreMessageListener = (function () {
                function CoreMessageListener(orbiter) {
                    this.orbiter = orbiter;
                    this.orbiter = orbiter;
                    this.log = orbiter.getLog();
                    this.registerCoreListeners();
                    this.orbiter.getConnectionManager().addEventListener(orbiter_5.ConnectionManagerEvent.SELECT_CONNECTION, this.selectConnectionListener, this);
                    this.roomMan = this.orbiter.getRoomManager();
                    this.accountMan = this.orbiter.getAccountManager();
                    this.clientMan = this.orbiter.getClientManager();
                    this.snapshotMan = this.orbiter.getSnapshotManager();
                }
                CoreMessageListener.prototype.createHashFromArg = function (arg) {
                    var list = arg.split(orbiter_5.Tokens.RS), hash = {};
                    for (var i = 0; i < list.length; i += 2) {
                        hash[list[i]] = list[i + 1];
                    }
                    return hash;
                };
                CoreMessageListener.prototype.registerCoreListeners = function () {
                    var msgMan = this.orbiter.getMessageManager();
                    msgMan.addMessageListener(orbiter_5.UPC.JOINED_ROOM, this.u6, this);
                    msgMan.addMessageListener(orbiter_5.UPC.RECEIVE_MESSAGE, this.u7, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENT_ATTR_UPDATE, this.u8, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ROOM_ATTR_UPDATE, this.u9, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENT_METADATA, this.u29, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CREATE_ROOM_RESULT, this.u32, this);
                    msgMan.addMessageListener(orbiter_5.UPC.REMOVE_ROOM_RESULT, this.u33, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENTCOUNT_SNAPSHOT, this.u34, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENT_ADDED_TO_ROOM, this.u36, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENT_REMOVED_FROM_ROOM, this.u37, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ROOMLIST_SNAPSHOT, this.u38, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ROOM_ADDED, this.u39, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ROOM_REMOVED, this.u40, this);
                    msgMan.addMessageListener(orbiter_5.UPC.WATCH_FOR_ROOMS_RESULT, this.u42, this);
                    msgMan.addMessageListener(orbiter_5.UPC.STOP_WATCHING_FOR_ROOMS_RESULT, this.u43, this);
                    msgMan.addMessageListener(orbiter_5.UPC.LEFT_ROOM, this.u44, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CHANGE_ACCOUNT_PASSWORD_RESULT, this.u46, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CREATE_ACCOUNT_RESULT, this.u47, this);
                    msgMan.addMessageListener(orbiter_5.UPC.REMOVE_ACCOUNT_RESULT, this.u48, this);
                    msgMan.addMessageListener(orbiter_5.UPC.LOGIN_RESULT, this.u49, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ROOM_SNAPSHOT, this.u54, this);
                    msgMan.addMessageListener(orbiter_5.UPC.OBSERVED_ROOM, this.u59, this);
                    msgMan.addMessageListener(orbiter_5.UPC.GET_ROOM_SNAPSHOT_RESULT, this.u60, this);
                    msgMan.addMessageListener(orbiter_5.UPC.STOPPED_OBSERVING_ROOM, this.u62, this);
                    msgMan.addMessageListener(orbiter_5.UPC.SERVER_HELLO, this.u66, this);
                    msgMan.addMessageListener(orbiter_5.UPC.JOIN_ROOM_RESULT, this.u72, this);
                    msgMan.addMessageListener(orbiter_5.UPC.SET_CLIENT_ATTR_RESULT, this.u73, this);
                    msgMan.addMessageListener(orbiter_5.UPC.SET_ROOM_ATTR_RESULT, this.u74, this);
                    msgMan.addMessageListener(orbiter_5.UPC.GET_CLIENTCOUNT_SNAPSHOT_RESULT, this.u75, this);
                    msgMan.addMessageListener(orbiter_5.UPC.LEAVE_ROOM_RESULT, this.u76, this);
                    msgMan.addMessageListener(orbiter_5.UPC.OBSERVE_ROOM_RESULT, this.u77, this);
                    msgMan.addMessageListener(orbiter_5.UPC.STOP_OBSERVING_ROOM_RESULT, this.u78, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ROOM_ATTR_REMOVED, this.u79, this);
                    msgMan.addMessageListener(orbiter_5.UPC.REMOVE_ROOM_ATTR_RESULT, this.u80, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENT_ATTR_REMOVED, this.u81, this);
                    msgMan.addMessageListener(orbiter_5.UPC.REMOVE_CLIENT_ATTR_RESULT, this.u82, this);
                    msgMan.addMessageListener(orbiter_5.UPC.SESSION_TERMINATED, this.u84, this);
                    msgMan.addMessageListener(orbiter_5.UPC.LOGOFF_RESULT, this.u87, this);
                    msgMan.addMessageListener(orbiter_5.UPC.LOGGED_IN, this.u88, this);
                    msgMan.addMessageListener(orbiter_5.UPC.LOGGED_OFF, this.u89, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ACCOUNT_PASSWORD_CHANGED, this.u90, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENTLIST_SNAPSHOT, this.u101, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENT_ADDED_TO_SERVER, this.u102, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENT_REMOVED_FROM_SERVER, this.u103, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENT_SNAPSHOT, this.u104, this);
                    msgMan.addMessageListener(orbiter_5.UPC.OBSERVE_CLIENT_RESULT, this.u105, this);
                    msgMan.addMessageListener(orbiter_5.UPC.STOP_OBSERVING_CLIENT_RESULT, this.u106, this);
                    msgMan.addMessageListener(orbiter_5.UPC.WATCH_FOR_CLIENTS_RESULT, this.u107, this);
                    msgMan.addMessageListener(orbiter_5.UPC.STOP_WATCHING_FOR_CLIENTS_RESULT, this.u108, this);
                    msgMan.addMessageListener(orbiter_5.UPC.WATCH_FOR_ACCOUNTS_RESULT, this.u109, this);
                    msgMan.addMessageListener(orbiter_5.UPC.STOP_WATCHING_FOR_ACCOUNTS_RESULT, this.u110, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ACCOUNT_ADDED, this.u111, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ACCOUNT_REMOVED, this.u112, this);
                    msgMan.addMessageListener(orbiter_5.UPC.JOINED_ROOM_ADDED_TO_CLIENT, this.u113, this);
                    msgMan.addMessageListener(orbiter_5.UPC.JOINED_ROOM_REMOVED_FROM_CLIENT, this.u114, this);
                    msgMan.addMessageListener(orbiter_5.UPC.GET_CLIENT_SNAPSHOT_RESULT, this.u115, this);
                    msgMan.addMessageListener(orbiter_5.UPC.GET_ACCOUNT_SNAPSHOT_RESULT, this.u116, this);
                    msgMan.addMessageListener(orbiter_5.UPC.OBSERVED_ROOM_ADDED_TO_CLIENT, this.u117, this);
                    msgMan.addMessageListener(orbiter_5.UPC.OBSERVED_ROOM_REMOVED_FROM_CLIENT, this.u118, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENT_OBSERVED, this.u119, this);
                    msgMan.addMessageListener(orbiter_5.UPC.STOPPED_OBSERVING_CLIENT, this.u120, this);
                    msgMan.addMessageListener(orbiter_5.UPC.OBSERVE_ACCOUNT_RESULT, this.u123, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ACCOUNT_OBSERVED, this.u124, this);
                    msgMan.addMessageListener(orbiter_5.UPC.STOP_OBSERVING_ACCOUNT_RESULT, this.u125, this);
                    msgMan.addMessageListener(orbiter_5.UPC.STOPPED_OBSERVING_ACCOUNT, this.u126, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ACCOUNT_LIST_UPDATE, this.u127, this);
                    msgMan.addMessageListener(orbiter_5.UPC.UPDATE_LEVELS_UPDATE, this.u128, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENT_OBSERVED_ROOM, this.u129, this);
                    msgMan.addMessageListener(orbiter_5.UPC.CLIENT_STOPPED_OBSERVING_ROOM, this.u130, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ROOM_OCCUPANTCOUNT_UPDATE, this.u131, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ROOM_OBSERVERCOUNT_UPDATE, this.u132, this);
                    msgMan.addMessageListener(orbiter_5.UPC.ADD_ROLE_RESULT, this.u134, this);
                    msgMan.addMessageListener(orbiter_5.UPC.REMOVE_ROLE_RESULT, this.u136, this);
                    msgMan.addMessageListener(orbiter_5.UPC.BAN_RESULT, this.u138, this);
                    msgMan.addMessageListener(orbiter_5.UPC.UNBAN_RESULT, this.u140, this);
                    msgMan.addMessageListener(orbiter_5.UPC.BANNED_LIST_SNAPSHOT, this.u142, this);
                    msgMan.addMessageListener(orbiter_5.UPC.WATCH_FOR_BANNED_ADDRESSES_RESULT, this.u144, this);
                    msgMan.addMessageListener(orbiter_5.UPC.STOP_WATCHING_FOR_BANNED_ADDRESSES_RESULT, this.u146, this);
                    msgMan.addMessageListener(orbiter_5.UPC.BANNED_ADDRESS_ADDED, this.u147, this);
                    msgMan.addMessageListener(orbiter_5.UPC.BANNED_ADDRESS_REMOVED, this.u148, this);
                    msgMan.addMessageListener(orbiter_5.UPC.KICK_CLIENT_RESULT, this.u150, this);
                    msgMan.addMessageListener(orbiter_5.UPC.SERVERMODULELIST_SNAPSHOT, this.u152, this);
                    msgMan.addMessageListener(orbiter_5.UPC.GET_UPC_STATS_SNAPSHOT_RESULT, this.u155, this);
                    msgMan.addMessageListener(orbiter_5.UPC.UPC_STATS_SNAPSHOT, this.u156, this);
                    msgMan.addMessageListener(orbiter_5.UPC.RESET_UPC_STATS_RESULT, this.u158, this);
                    msgMan.addMessageListener(orbiter_5.UPC.WATCH_FOR_PROCESSED_UPCS_RESULT, this.u160, this);
                    msgMan.addMessageListener(orbiter_5.UPC.PROCESSED_UPC_ADDED, this.u161, this);
                    msgMan.addMessageListener(orbiter_5.UPC.STOP_WATCHING_FOR_PROCESSED_UPCS_RESULT, this.u163, this);
                    msgMan.addMessageListener(orbiter_5.UPC.NODELIST_SNAPSHOT, this.u166, this);
                    msgMan.addMessageListener(orbiter_5.UPC.GATEWAYS_SNAPSHOT, this.u168, this);
                };
                CoreMessageListener.prototype.selectConnectionListener = function (e) {
                    var msgMan = this.orbiter.getMessageManager();
                    if (msgMan.removeListenersOnDisconnect) {
                        this.registerCoreListeners();
                    }
                };
                CoreMessageListener.prototype.u101 = function (requestID, serializedIDs) {
                    if (requestID == '') {
                        this.clientMan.deserializeWatchedClients(serializedIDs);
                    }
                    else {
                        var clientList = [], ids = serializedIDs.split(orbiter_5.Tokens.RS);
                        for (var i = ids.length - 1; i >= 0; i -= 2) {
                            var thisUserID = ids[i];
                            thisUserID = thisUserID == '' ? null : thisUserID;
                            clientList.push({ clientID: ids[i - 1], userID: thisUserID });
                        }
                        this.snapshotMan.receiveClientListSnapshot(requestID, clientList);
                    }
                };
                CoreMessageListener.prototype.u102 = function (clientID) {
                    this.clientMan.addWatchedClient(this.clientMan.requestClient(clientID));
                };
                CoreMessageListener.prototype.u103 = function (clientID) {
                    var _a;
                    var client = this.clientMan.getInternalClient(clientID);
                    if (this.clientMan.hasWatchedClient(clientID))
                        this.clientMan.removeWatchedClient(clientID);
                    if (this.clientMan.isObservingClient(clientID))
                        this.clientMan.removeObservedClient(clientID);
                    if (client) {
                        client.setConnectionState(orbiter_5.ConnectionState.NOT_CONNECTED);
                        this.clientMan.fireClientDisconnected((_a = this.clientMan.getClient(clientID)) !== null && _a !== void 0 ? _a : undefined);
                    }
                };
                CoreMessageListener.prototype.u104 = function (requestID, clientID, userID, serializedOccupiedRoomIDs, serializedObservedRoomIDs, globalAttrs) {
                    var _a, _b;
                    var roomAttrs = [];
                    for (var _i = 6; _i < arguments.length; _i++) {
                        roomAttrs[_i - 6] = arguments[_i];
                    }
                    var account = this.accountMan.requestAccount(userID), clientManifest = new orbiter_5.ClientManifest();
                    clientManifest.deserialize(clientID, userID, serializedOccupiedRoomIDs, serializedObservedRoomIDs, globalAttrs, roomAttrs);
                    if (clientID) {
                        if (requestID == '') {
                            var theClient = this.clientMan.requestClient(clientID);
                            theClient.setAccount(account !== null && account !== void 0 ? account : undefined);
                            theClient.synchronize(clientManifest);
                            theClient.fireSynchronize();
                        }
                        else {
                            this.snapshotMan.receiveClientSnapshot(requestID, clientManifest);
                        }
                    }
                    else {
                        if (requestID == '') {
                            var scopes = clientManifest.persistentAttributes.getScopes();
                            for (var i = scopes.length; --i >= 0;) {
                                (_b = (_a = account === null || account === void 0 ? void 0 : account.getAttributeManager()) === null || _a === void 0 ? void 0 : _a.getAttributeCollection()) === null || _b === void 0 ? void 0 : _b.synchronizeScope(scopes[i], clientManifest.persistentAttributes);
                            }
                            account === null || account === void 0 ? void 0 : account.fireSynchronize();
                        }
                        else {
                            this.snapshotMan.receiveAccountSnapshot(requestID, clientManifest);
                        }
                    }
                };
                CoreMessageListener.prototype.u105 = function (clientID, status) {
                    var theClient = this.clientMan.getInternalClient(clientID);
                    switch (status) {
                        case orbiter_5.Status.CLIENT_NOT_FOUND:
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ALREADY_OBSERVING:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.clientMan.fireObserveClientResult(clientID, status);
                            theClient === null || theClient === void 0 ? void 0 : theClient.fireObserveResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u105. Client ID: [" + clientID + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u106 = function (clientID, status) {
                    var theClient = this.clientMan.getInternalClient(clientID);
                    switch (status) {
                        case orbiter_5.Status.CLIENT_NOT_FOUND:
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.NOT_OBSERVING:
                            this.clientMan.fireStopObservingClientResult(clientID, status);
                            if (theClient)
                                theClient.fireStopObservingResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u106. Client ID: [" + clientID + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u107 = function (status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ALREADY_WATCHING:
                            this.clientMan.fireWatchForClientsResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u107.Status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u108 = function (status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                            this.clientMan.setIsWatchingForClients(false);
                            this.clientMan.removeAllWatchedClients();
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.NOT_WATCHING:
                            this.clientMan.fireStopWatchingForClientsResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u108.Status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u109 = function (status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                            this.accountMan.setIsWatchingForAccounts(true);
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ALREADY_WATCHING:
                            this.accountMan.fireWatchForAccountsResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u109.Status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u110 = function (status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                            this.accountMan.setIsWatchingForAccounts(false);
                            this.accountMan.removeAllWatchedAccounts();
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.NOT_WATCHING:
                            this.accountMan.fireStopWatchingForAccountsResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u110.Status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u111 = function (userID) {
                    var account = this.accountMan.requestAccount(userID);
                    account && this.accountMan.addWatchedAccount(account);
                };
                CoreMessageListener.prototype.u112 = function (userID) {
                    var account = null;
                    if (this.accountMan.hasWatchedAccount(userID)) {
                        account = this.accountMan.removeWatchedAccount(userID);
                    }
                    if (this.accountMan.isObservingAccount(userID)) {
                        account = this.accountMan.removeObservedAccount(userID);
                    }
                    account && this.accountMan.fireAccountRemoved(userID, account);
                };
                CoreMessageListener.prototype.u113 = function (clientID, roomID) {
                    var theRoom = this.roomMan.getRoom(roomID), client = this.clientMan.requestClient(clientID);
                    if (!theRoom) {
                        this.log.warn("No room for u113. Room ID: [" + roomID + "].");
                        return;
                    }
                    client.addOccupiedRoomID(roomID);
                    client.fireJoinRoom(theRoom, roomID);
                };
                CoreMessageListener.prototype.u114 = function (clientID, roomID) {
                    var theRoom = this.roomMan.getRoom(roomID), client = this.clientMan.requestClient(clientID);
                    if (!theRoom) {
                        this.log.warn("No room for u114. Room ID: [" + roomID + "].");
                        return;
                    }
                    client.removeOccupiedRoomID(roomID);
                    client.fireLeaveRoom(theRoom, roomID);
                };
                CoreMessageListener.prototype.u115 = function (requestID, clientID, status) {
                    this.snapshotMan.receiveSnapshotResult(requestID, status);
                };
                CoreMessageListener.prototype.u116 = function (requestID, userID, status) {
                    this.snapshotMan.receiveSnapshotResult(requestID, status);
                };
                CoreMessageListener.prototype.u117 = function (clientID, roomID) {
                    var theRoom = this.roomMan.getRoom(roomID), client = this.clientMan.requestClient(clientID);
                    if (!theRoom) {
                        this.log.warn("No room for u117. Room ID: [" + roomID + "].");
                        return;
                    }
                    client.addObservedRoomID(roomID);
                    client.fireObserveRoom(theRoom, roomID);
                };
                CoreMessageListener.prototype.u118 = function (clientID, roomID) {
                    var theRoom = this.roomMan.getRoom(roomID), client = this.clientMan.requestClient(clientID);
                    if (!theRoom) {
                        this.log.warn("No room for u118. Room ID: [" + roomID + "].");
                        return;
                    }
                    client.removeObservedRoomID(roomID);
                    client.fireStopObservingRoom(theRoom, roomID);
                };
                CoreMessageListener.prototype.u119 = function (clientID) {
                    var client = this.clientMan.requestClient(clientID);
                    this.clientMan.addObservedClient(client);
                    client.fireObserve();
                };
                CoreMessageListener.prototype.u120 = function (clientID) {
                    var client = this.clientMan.getInternalClient(clientID);
                    this.clientMan.removeObservedClient(clientID);
                    if (client)
                        client.fireStopObserving();
                };
                CoreMessageListener.prototype.u123 = function (userID, status) {
                    var theAccount = this.accountMan.getAccount(userID);
                    switch (status) {
                        case orbiter_5.Status.ACCOUNT_NOT_FOUND:
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ALREADY_OBSERVING:
                            this.accountMan.fireObserveAccountResult(userID, status);
                            if (theAccount)
                                theAccount.fireObserveResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u123. User ID: [" + userID + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u124 = function (userID) {
                    var theAccount = this.accountMan.requestAccount(userID);
                    if (theAccount) {
                        this.accountMan.addObservedAccount(theAccount);
                        theAccount.fireObserve();
                    }
                };
                CoreMessageListener.prototype.u125 = function (userID, status) {
                    var theAccount = this.accountMan.getAccount(userID);
                    switch (status) {
                        case orbiter_5.Status.ACCOUNT_NOT_FOUND:
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ALREADY_OBSERVING:
                            this.accountMan.fireStopObservingAccountResult(userID, status);
                            theAccount === null || theAccount === void 0 ? void 0 : theAccount.fireStopObservingResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u125. User ID: [" + userID + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u126 = function (userID) {
                    var account = this.accountMan.getAccount(userID);
                    this.accountMan.removeObservedAccount(userID);
                    account === null || account === void 0 ? void 0 : account.fireStopObserving();
                };
                CoreMessageListener.prototype.u127 = function (requestID, serializedIDs) {
                    var ids = serializedIDs.split(orbiter_5.Tokens.RS);
                    if (requestID == '') {
                        this.accountMan.deserializeWatchedAccounts(serializedIDs);
                    }
                    else {
                        var accountList = [];
                        for (var i = ids.length; --i >= 0;) {
                            accountList.push(ids[i]);
                        }
                        this.snapshotMan.receiveAccountListSnapshot(requestID, accountList);
                    }
                };
                CoreMessageListener.prototype.u128 = function (updateLevels, roomID) {
                    var room = this.roomMan.getRoom(roomID), levels = new orbiter_5.UpdateLevels();
                    levels.fromInt(parseInt(updateLevels));
                    if (room) {
                        if (!levels.occupantList) {
                            var occupantIDs = room.getOccupantIDs(), numOccupantIDs = occupantIDs.length;
                            for (var i = 0; i < numOccupantIDs; i++) {
                                var occupantID = occupantIDs[i];
                                room.removeOccupant(occupantID);
                            }
                        }
                        if (!levels.observerList) {
                            var observerIDs = room.getObserverIDs(), numObserverIDs = observerIDs.length;
                            for (var i = 0; i < numObserverIDs; i++) {
                                var observerID = observerIDs[i];
                                room.removeObserver(observerID);
                            }
                        }
                        if (!levels.sharedRoomAttributes && !levels.allRoomAttributes) {
                            room.getAttributeManager().removeAll();
                        }
                    }
                };
                CoreMessageListener.prototype.u129 = function (roomID, clientID, userID, globalAttributes, roomAttributes) {
                    var theClient = this.clientMan.requestClient(clientID), account = this.accountMan.requestAccount(userID);
                    if (account && theClient.getAccount() != account) {
                        theClient.setAccount(account);
                    }
                    var theRoom = this.roomMan.getRoom(roomID);
                    if (!theRoom) {
                        this.log.warn("No room for u129. Room ID: [" + roomID + "]");
                        return;
                    }
                    if (!theClient.isSelf()) {
                        var clientManifest = new orbiter_5.ClientManifest();
                        clientManifest.deserialize(clientID, userID, undefined, undefined, globalAttributes, [roomID, roomAttributes]);
                        theClient.synchronize(clientManifest);
                        if (!this.clientMan.isObservingClient(clientID)) {
                            theClient.fireObserveRoom(theRoom, roomID);
                        }
                    }
                    theRoom.addObserver(theClient);
                };
                CoreMessageListener.prototype.u130 = function (roomID, clientID) {
                    var theClient = this.clientMan.requestClient(clientID), theRoom = this.roomMan.getRoom(roomID);
                    if (!theRoom) {
                        this.log.warn("No room for u130. Room ID: [" + roomID + "], status: [" + status + "].");
                        return;
                    }
                    theRoom.removeObserver(clientID);
                    if (!theClient.isSelf()) {
                        if (!this.clientMan.isObservingClient(clientID)) {
                            theClient.fireStopObservingRoom(theRoom, roomID);
                        }
                    }
                };
                CoreMessageListener.prototype.u131 = function (roomID, numClients) {
                    var _a, _b;
                    var levels = (_a = this.clientMan.self()) === null || _a === void 0 ? void 0 : _a.getUpdateLevels(roomID);
                    if (levels) {
                        if (!levels.occupantList) {
                            (_b = this.roomMan.getRoom(roomID)) === null || _b === void 0 ? void 0 : _b.setNumOccupants(parseInt(numClients));
                        }
                    }
                    else {
                        throw new Error("[CORE_MESSAGE_LISTENER] Received a room occupant count update (u131), but update levels are unknown for the room. Synchronization error");
                    }
                };
                CoreMessageListener.prototype.u132 = function (roomID, numClients) {
                    var _a, _b;
                    var levels = (_a = this.clientMan.self()) === null || _a === void 0 ? void 0 : _a.getUpdateLevels(roomID);
                    if (levels) {
                        if (!levels.observerList) {
                            (_b = this.roomMan.getRoom(roomID)) === null || _b === void 0 ? void 0 : _b.setNumObservers(parseInt(numClients));
                        }
                    }
                    else {
                        throw new Error("[CORE_MESSAGE_LISTENER] Received a room observer count update (u132), but update levels are unknown for the room. Synchronization error.");
                    }
                };
                CoreMessageListener.prototype.u134 = function (userID, role, status) {
                    var theAccount = this.accountMan.getAccount(userID);
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ACCOUNT_NOT_FOUND:
                        case orbiter_5.Status.ROLE_NOT_FOUND:
                        case orbiter_5.Status.ALREADY_ASSIGNED:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.accountMan.fireAddRoleResult(userID, role, status);
                            theAccount === null || theAccount === void 0 ? void 0 : theAccount.fireAddRoleResult(role, status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u134. User ID: [" + userID + "], role: [" + role + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u136 = function (userID, role, status) {
                    var theAccount = this.accountMan.getAccount(userID);
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ACCOUNT_NOT_FOUND:
                        case orbiter_5.Status.ROLE_NOT_FOUND:
                        case orbiter_5.Status.NOT_ASSIGNED:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.accountMan.fireRemoveRoleResult(userID, role, status);
                            theAccount === null || theAccount === void 0 ? void 0 : theAccount.fireRemoveRoleResult(role, status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u136. User ID: [" + userID + "], role: [" + role + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u138 = function (address, clientID, status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.CLIENT_NOT_FOUND:
                        case orbiter_5.Status.ALREADY_BANNED:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.clientMan.fireBanClientResult(address, clientID, status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u138. Address: [" + address + "], clientID: [" + clientID + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u140 = function (address, status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.NOT_BANNED:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.clientMan.fireUnbanClientResult(address, status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u140. Address: [" + address + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u142 = function (requestID, bannedListSource) {
                    var bannedList = bannedListSource == '' ? [] : bannedListSource.split(orbiter_5.Tokens.RS);
                    if (requestID == '') {
                        this.clientMan.setWatchedBannedAddresses(bannedList);
                    }
                    else {
                        this.snapshotMan.receiveBannedListSnapshot(requestID, bannedList);
                    }
                };
                CoreMessageListener.prototype.u144 = function (status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ALREADY_WATCHING:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.clientMan.fireWatchForBannedAddressesResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u144: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u146 = function (status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.NOT_WATCHING:
                            this.clientMan.fireStopWatchingForBannedAddressesResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u146: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u147 = function (address) {
                    this.clientMan.addWatchedBannedAddress(address);
                };
                CoreMessageListener.prototype.u148 = function (address) {
                    this.clientMan.removeWatchedBannedAddress(address);
                };
                CoreMessageListener.prototype.u150 = function (clientID, status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.CLIENT_NOT_FOUND:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.clientMan.fireKickClientResult(clientID, status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u150: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u152 = function (requestID, serverModuleListSource) {
                    var moduleListArray = serverModuleListSource == '' ? [] :
                        serverModuleListSource.split(orbiter_5.Tokens.RS);
                    var moduleList = [];
                    for (var i = 0; i < moduleListArray.length; i += 3) {
                        moduleList.push(new orbiter_5.ModuleDefinition(moduleListArray[i], moduleListArray[i + 1], moduleListArray[i + 2]));
                    }
                    if (requestID == '') {
                        this.log.warn('Incoming SERVERMODULELIST_SNAPSHOT UPC missing required requestID. Ignoring message.');
                    }
                    else {
                        this.snapshotMan.receiveServerModuleListSnapshot(requestID, moduleList);
                    }
                };
                CoreMessageListener.prototype.u155 = function (requestID, status) {
                    this.snapshotMan.receiveSnapshotResult(requestID, status);
                };
                CoreMessageListener.prototype.u156 = function (requestID, totalUPCsProcessed, numUPCsInQueue, lastQueueWaitTime) {
                    var longestUPCProcesses = [];
                    for (var _i = 4; _i < arguments.length; _i++) {
                        longestUPCProcesses[_i - 4] = arguments[_i];
                    }
                    var processes = [];
                    for (var i = 0; i < longestUPCProcesses.length; i++) {
                        var upcProcessingRecord = new orbiter_5.UPCProcessingRecord();
                        upcProcessingRecord.deserialize(longestUPCProcesses[i]);
                        processes[i] = upcProcessingRecord;
                    }
                    this.snapshotMan.receiveUPCStatsSnapshot(requestID, parseFloat(totalUPCsProcessed), parseFloat(numUPCsInQueue), parseFloat(lastQueueWaitTime), processes);
                };
                CoreMessageListener.prototype.u158 = function (status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.orbiter.getServer().dispatchResetUPCStatsResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u158.Status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u160 = function (status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                            this.orbiter.getServer().setIsWatchingForProcessedUPCs(true);
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ALREADY_WATCHING:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.orbiter.getServer().dispatchWatchForProcessedUPCsResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u160.Status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u161 = function (fromClientID, fromUserID, fromClientAddress, queuedAt, processingStartedAt, processingFinishedAt, source) {
                    var upcProcessingRecord = new orbiter_5.UPCProcessingRecord();
                    upcProcessingRecord.deserializeParts(fromClientID, fromUserID, fromClientAddress, queuedAt, processingStartedAt, processingFinishedAt, source);
                    this.orbiter.getServer().dispatchUPCProcessed(upcProcessingRecord);
                };
                CoreMessageListener.prototype.u163 = function (status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                            this.orbiter.getServer().setIsWatchingForProcessedUPCs(false);
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.NOT_WATCHING:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.orbiter.getServer().dispatchStopWatchingForProcessedUPCsResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u163.Status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u166 = function (requestID, nodeListSource) {
                    var nodeIDs = nodeListSource == '' ? [] : nodeListSource.split(orbiter_5.Tokens.RS);
                    if (requestID == '') {
                        this.log.warn('Incoming NODELIST_SNAPSHOT UPC missing required requestID. Ignoring message.');
                    }
                    else {
                        this.snapshotMan.receiveNodeListSnapshot(requestID, nodeIDs);
                    }
                };
                CoreMessageListener.prototype.u168 = function (requestID, gatewayListSource) {
                    var gateways = [];
                    for (var i = 0; i < gatewayListSource.length; i += 8) {
                        var gateway = new orbiter_5.Gateway();
                        gateway.id = gatewayListSource[i];
                        gateway.type = gatewayListSource[i + 1];
                        gateway.lifetimeConnectionsByCategory = gatewayListSource[i + 2] === '' ? {} : this.createHashFromArg(gatewayListSource[i + 2]);
                        for (var p in gateway.lifetimeConnectionsByCategory) {
                            gateway.lifetimeConnectionsByCategory[p] = parseFloat(gateway.lifetimeConnectionsByCategory[p]);
                        }
                        gateway.lifetimeClientsByType = gatewayListSource[i + 3] === '' ? {} : this.createHashFromArg(gatewayListSource[i + 3]);
                        for (var p in gateway.lifetimeClientsByType) {
                            gateway.lifetimeClientsByType[p] = parseFloat(gateway.lifetimeClientsByType[p]);
                        }
                        gateway.lifetimeClientsByUPCVersion = gatewayListSource[i + 4] === '' ? {} : this.createHashFromArg(gatewayListSource[i + 4]);
                        for (var p in gateway.lifetimeClientsByUPCVersion) {
                            gateway.lifetimeClientsByUPCVersion[p] = parseFloat(gateway.lifetimeClientsByUPCVersion[p]);
                        }
                        gateway.attributes = gatewayListSource[i + 5] === '' ? {} : this.createHashFromArg(gatewayListSource[i + 5]);
                        var gatewayIntervalSource = gatewayListSource[i + 6].split(orbiter_5.Tokens.RS);
                        gateway.connectionsPerSecond = parseFloat(gatewayIntervalSource[0]);
                        gateway.maxConnectionsPerSecond = parseFloat(gatewayIntervalSource[1]);
                        gateway.clientsPerSecond = parseFloat(gatewayIntervalSource[2]);
                        gateway.maxClientsPerSecond = parseFloat(gatewayIntervalSource[3]);
                        var gatewayBandwidth = new orbiter_5.GatewayBandwidth();
                        var gatewayBandwidthSource = gatewayListSource[i + 7].split(orbiter_5.Tokens.RS);
                        gatewayBandwidth.lifetimeRead = parseFloat(gatewayBandwidthSource[0] || '0');
                        gatewayBandwidth.lifetimeWritten = parseFloat(gatewayBandwidthSource[1] || '0');
                        gatewayBandwidth.averageRead = parseFloat(gatewayBandwidthSource[2] || '0');
                        gatewayBandwidth.averageWritten = parseFloat(gatewayBandwidthSource[3] || '0');
                        gatewayBandwidth.intervalRead = parseFloat(gatewayBandwidthSource[4] || '0');
                        gatewayBandwidth.intervalWritten = parseFloat(gatewayBandwidthSource[5] || '0');
                        gatewayBandwidth.maxIntervalRead = parseFloat(gatewayBandwidthSource[6] || '0');
                        gatewayBandwidth.maxIntervalWritten = parseFloat(gatewayBandwidthSource[7] || '0');
                        gatewayBandwidth.scheduledWrite = parseFloat(gatewayBandwidthSource[8] || '0');
                        gateway.bandwidth = gatewayBandwidth;
                        gateways.push(gateway);
                    }
                    if (requestID == '') {
                        this.log.warn('Incoming GATEWAYS_SNAPSHOT UPC missing required requestID. Ignoring message.');
                    }
                    else {
                        this.snapshotMan.receiveGatewaysSnapshot(requestID, gateways);
                    }
                };
                CoreMessageListener.prototype.u29 = function (id) {
                    var theClient = this.clientMan.requestClient(id);
                    this.clientMan.setSelf(theClient);
                };
                CoreMessageListener.prototype.u32 = function (roomID, status) {
                    var theRoom = this.roomMan.getRoom(roomID);
                    switch (status) {
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ROOM_EXISTS:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.roomMan.fireCreateRoomResult(orbiter_5.RoomIDParser.getQualifier(roomID), orbiter_5.RoomIDParser.getSimpleRoomID(roomID), status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u32. Room ID: [" + roomID + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u33 = function (roomID, status) {
                    this.roomMan.fireRemoveRoomResult(orbiter_5.RoomIDParser.getQualifier(roomID), orbiter_5.RoomIDParser.getSimpleRoomID(roomID), status);
                    switch (status) {
                        case orbiter_5.Status.ERROR:
                            this.log.warn("Server error for room removal attempt: " + roomID);
                            break;
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.log.info("Attempt to remove room [" + roomID + "] failed. Permission denied. See server log for details.");
                            break;
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ROOM_NOT_FOUND:
                            if (this.roomMan.getRoom(roomID)) {
                                this.roomMan.disposeRoom(roomID);
                            }
                            break;
                        case orbiter_5.Status.AUTHORIZATION_REQUIRED:
                        case orbiter_5.Status.AUTHORIZATION_FAILED:
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u33. Room ID: [" + roomID + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u34 = function (requestID, numClients) {
                    this.snapshotMan.receiveClientCountSnapshot(requestID, parseInt(numClients));
                };
                CoreMessageListener.prototype.u36 = function (roomID, clientID, userID, globalAttributes, roomAttributes) {
                    var theClient = this.clientMan.requestClient(clientID), account = this.accountMan.requestAccount(userID);
                    if (account && theClient.getAccount() != account) {
                        theClient.setAccount(account);
                    }
                    var theRoom = this.roomMan.getRoom(roomID);
                    if (!theRoom) {
                        this.log.warn("No room for u36. Room ID: [" + roomID + "].");
                        return;
                    }
                    if (!theClient.isSelf()) {
                        var clientManifest = new orbiter_5.ClientManifest();
                        clientManifest.deserialize(clientID, userID, undefined, undefined, globalAttributes, [roomID, roomAttributes]);
                        theClient.synchronize(clientManifest);
                        if (!this.clientMan.isObservingClient(clientID)) {
                            theClient.fireJoinRoom(theRoom, roomID);
                        }
                    }
                    theRoom.addOccupant(theClient);
                };
                CoreMessageListener.prototype.u37 = function (roomID, clientID) {
                    var theClient = this.clientMan.requestClient(clientID), theRoom = this.roomMan.getRoom(roomID);
                    if (!theRoom) {
                        this.log.warn("No room for u37. Room ID: [" + roomID + "].");
                        return;
                    }
                    theRoom.removeOccupant(clientID);
                    if (!theClient.isSelf()) {
                        if (!this.clientMan.isObservingClient(clientID)) {
                            theClient.fireLeaveRoom(theRoom, roomID);
                        }
                    }
                };
                CoreMessageListener.prototype.u38 = function (requestID, requestedRoomIDQualifier, recursive) {
                    var args = [];
                    for (var _i = 3; _i < arguments.length; _i++) {
                        args[_i - 3] = arguments[_i];
                    }
                    var roomList = [];
                    if (requestID == '') {
                        for (var i = 0; i < args.length; i += 2) {
                            var roomQualifier = args[i], roomIDs = args[i + 1].split(orbiter_5.Tokens.RS);
                            this.roomMan.setWatchedRooms(roomQualifier, roomIDs);
                        }
                    }
                    else {
                        for (var i = 0; i < args.length; i += 2) {
                            var roomQualifier = args[i], roomIDs = args[i + 1].split(orbiter_5.Tokens.RS);
                            for (var j = 0; j < roomIDs.length; j++) {
                                roomList.push(roomQualifier + (roomQualifier == '' ? '' : '.') + roomIDs[j]);
                            }
                        }
                        this.snapshotMan.receiveRoomListSnapshot(requestID, roomList, requestedRoomIDQualifier, recursive == 'true');
                    }
                };
                CoreMessageListener.prototype.u39 = function (roomID) {
                    this.roomMan.addWatchedRoom(roomID);
                };
                CoreMessageListener.prototype.u40 = function (roomID) {
                    this.roomMan.removeWatchedRoom(roomID);
                    if (this.roomMan.getRoom(roomID)) {
                        this.roomMan.disposeRoom(roomID);
                    }
                };
                CoreMessageListener.prototype.u42 = function (roomIdQualifier, recursive, status) {
                    this.roomMan.fireWatchForRoomsResult(roomIdQualifier, status);
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.INVALID_QUALIFIER:
                        case orbiter_5.Status.ALREADY_WATCHING:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u42. Room ID Qualifier: [" + roomIdQualifier + "], recursive: [" + recursive + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u43 = function (roomIdQualifier, recursive, status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                            if (roomIdQualifier == '' && recursive == 'true') {
                                this.roomMan.removeAllWatchedRooms();
                            }
                            else {
                                this.roomMan.setWatchedRooms(roomIdQualifier, []);
                            }
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.NOT_WATCHING:
                        case orbiter_5.Status.INVALID_QUALIFIER:
                            this.roomMan.fireStopWatchingForRoomsResult(roomIdQualifier, status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u43. Room ID Qualifier: [" + roomIdQualifier + "], recursive: [" + recursive + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u44 = function (roomID) {
                    var _a;
                    var leftRoom = this.roomMan.getRoom(roomID);
                    this.roomMan.removeOccupiedRoom(roomID);
                    if (leftRoom) {
                        leftRoom.doLeave();
                        (_a = this.clientMan.self()) === null || _a === void 0 ? void 0 : _a.fireLeaveRoom(leftRoom, roomID);
                    }
                };
                CoreMessageListener.prototype.u46 = function (userID, status) {
                    var account = this.accountMan.getAccount(userID);
                    if (account) {
                        account.fireChangePasswordResult(status);
                    }
                    this.accountMan.fireChangePasswordResult(userID, status);
                };
                CoreMessageListener.prototype.u47 = function (userID, status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ACCOUNT_EXISTS:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.orbiter.getAccountManager().fireCreateAccountResult(userID, status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u47. Account: [" + userID + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u48 = function (userID, status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ACCOUNT_NOT_FOUND:
                        case orbiter_5.Status.AUTHORIZATION_FAILED:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.orbiter.getAccountManager().fireRemoveAccountResult(userID, status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u48. Account: [" + userID + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u49 = function (userID, status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ALREADY_LOGGED_IN:
                        case orbiter_5.Status.ACCOUNT_NOT_FOUND:
                        case orbiter_5.Status.AUTHORIZATION_FAILED:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.orbiter.getAccountManager().fireLoginResult(userID, status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u49. Account: [" + userID + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u54 = function (requestID, roomID, occupantCount, observerCount, roomAttributes) {
                    var clientList = [];
                    for (var _i = 5; _i < arguments.length; _i++) {
                        clientList[_i - 5] = arguments[_i];
                    }
                    var roomManifest = new orbiter_5.RoomManifest();
                    roomManifest.deserialize(roomID, roomAttributes, clientList, parseInt(occupantCount), parseInt(observerCount));
                    if (requestID == '') {
                        var theRoom = this.roomMan.getRoom(roomID);
                        if (!theRoom) {
                            theRoom = this.roomMan.addCachedRoom(roomID);
                        }
                        theRoom === null || theRoom === void 0 ? void 0 : theRoom.synchronize(roomManifest);
                    }
                    else {
                        this.snapshotMan.receiveRoomSnapshot(requestID, roomManifest);
                    }
                };
                CoreMessageListener.prototype.u59 = function (roomID) {
                    var _a;
                    var room = this.roomMan.addObservedRoom(roomID);
                    if (room) {
                        room.doObserve();
                        (_a = this.clientMan.self()) === null || _a === void 0 ? void 0 : _a.fireObserveRoom(room, roomID);
                    }
                };
                CoreMessageListener.prototype.u6 = function (roomID) {
                    var _a;
                    var room = this.roomMan.addOccupiedRoom(roomID);
                    if (room) {
                        room.doJoin();
                        (_a = this.clientMan.self()) === null || _a === void 0 ? void 0 : _a.fireJoinRoom(room, roomID);
                    }
                };
                CoreMessageListener.prototype.u60 = function (requestID, roomID, status) {
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ROOM_NOT_FOUND:
                        case orbiter_5.Status.AUTHORIZATION_REQUIRED:
                        case orbiter_5.Status.AUTHORIZATION_FAILED:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.snapshotMan.receiveSnapshotResult(requestID, status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u60. Request ID: [" + requestID + "], Room ID: [" + roomID + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u62 = function (roomID) {
                    var _a;
                    var theRoom = this.roomMan.getRoom(roomID);
                    this.roomMan.removeObservedRoom(roomID);
                    if (theRoom) {
                        theRoom.doStopObserving();
                        (_a = this.clientMan.self()) === null || _a === void 0 ? void 0 : _a.fireStopObservingRoom(theRoom, roomID);
                    }
                };
                CoreMessageListener.prototype.u66 = function (serverVersion, sessionID, serverUPCVersionString, protocolCompatible, affinityAddress, affinityDuration) {
                    var _a;
                    this.log.info('[ORBITER] Server version: ' + serverVersion);
                    this.log.info('[ORBITER] Server UPC version: ' + serverUPCVersionString);
                    var serverUPCVersion = new orbiter_5.VersionNumber();
                    serverUPCVersion.fromVersionString(serverUPCVersionString);
                    this.orbiter.getServer().setVersion(serverVersion);
                    this.orbiter.getServer().setUPCVersion(serverUPCVersion);
                    var inProgressConnection = this.orbiter.getConnectionManager().getInProgressConnection(), inProgressConnectionHost = (_a = inProgressConnection === null || inProgressConnection === void 0 ? void 0 : inProgressConnection.getHost()) !== null && _a !== void 0 ? _a : '';
                    if (affinityAddress != '' && typeof affinityAddress !== 'undefined' && affinityAddress != inProgressConnectionHost) {
                        this.orbiter.getConnectionManager().setAffinity(inProgressConnectionHost, affinityAddress, parseFloat(affinityDuration));
                        inProgressConnection === null || inProgressConnection === void 0 ? void 0 : inProgressConnection.applyAffinity();
                    }
                };
                CoreMessageListener.prototype.u7 = function (message, broadcastType, fromClientID, toRoomID) {
                    var _a, _b;
                    var userDefinedArgs = [];
                    for (var _i = 4; _i < arguments.length; _i++) {
                        userDefinedArgs[_i - 4] = arguments[_i];
                    }
                    var msgMan = this.orbiter.getMessageManager();
                    var listenerError, fromClient, args;
                    var toRoom = this.roomMan.getRoom(toRoomID);
                    if (fromClientID == '') {
                        fromClient = null;
                    }
                    else {
                        fromClient = (_a = this.clientMan.getClient(fromClientID)) !== null && _a !== void 0 ? _a : this.clientMan.requestClient(fromClientID);
                    }
                    if (broadcastType != orbiter_5.ReceiveMessageBroadcastType.TO_ROOMS) {
                        args = [fromClient].concat(userDefinedArgs);
                        try {
                            msgMan.notifyMessageListeners(message, args);
                        }
                        catch (e) {
                            listenerError = e;
                        }
                    }
                    else {
                        if (!toRoom) {
                            this.log.warn("Message (u7) received for unknown room: [" + toRoomID + "]Message: [" + message + "]");
                            return;
                        }
                        var listeners = msgMan.getMessageListeners(message), toRoomSimpleID = orbiter_5.RoomIDParser.getSimpleRoomID(toRoomID), toRoomQualifier = orbiter_5.RoomIDParser.getQualifier(toRoomID);
                        var listenerFound = void 0;
                        var listenerIgnoredMessage = void 0;
                        for (var i = 0; i < listeners.length; i++) {
                            var messageListener = listeners[i];
                            listenerIgnoredMessage = true;
                            if (!messageListener.getForRoomIDs()) {
                                args = [fromClient, toRoom].concat(userDefinedArgs);
                                try {
                                    messageListener.getListenerFunction().apply(messageListener.getThisArg(), args);
                                }
                                catch (e) {
                                    listenerError = e;
                                }
                                listenerFound = true;
                                listenerIgnoredMessage = false;
                                continue;
                            }
                            var listenerRoomIDs = (_b = messageListener.getForRoomIDs()) !== null && _b !== void 0 ? _b : [];
                            for (var j = 0; j < listenerRoomIDs.length; j++) {
                                var listenerRoomIDString = listenerRoomIDs[j], listenerRoomQualifier = orbiter_5.RoomIDParser.getQualifier(listenerRoomIDString), listenerRoomSimpleID = orbiter_5.RoomIDParser.getSimpleRoomID(listenerRoomIDString);
                                if (listenerRoomQualifier == toRoomQualifier &&
                                    (listenerRoomSimpleID == toRoomSimpleID || listenerRoomSimpleID == '*')) {
                                    if (listenerRoomIDs.length == 1) {
                                        args = [fromClient].concat(userDefinedArgs);
                                    }
                                    else {
                                        args = [fromClient, toRoom].concat(userDefinedArgs);
                                    }
                                    try {
                                        messageListener.getListenerFunction().apply(messageListener.getThisArg(), args);
                                    }
                                    catch (e) {
                                        listenerError = e;
                                    }
                                    listenerFound = true;
                                    listenerIgnoredMessage = false;
                                    break;
                                }
                            }
                            if (listenerIgnoredMessage) {
                                this.log.debug("Message listener ignored message: " + message + ". Listener registered to receive messages sent to: " + messageListener.getForRoomIDs() + ", but message was sent to: " + toRoomID);
                            }
                        }
                        if (!listenerFound) {
                            this.log.warn("No message listener handled incoming message: " + message + ", sent to: " + toRoomID);
                        }
                    }
                    if (listenerError) {
                        throw new Error("A message listener for incoming message [" + message + "] received from client [" + (fromClient === null || fromClient === void 0 ? void 0 : fromClient.getClientID()) + "] encountered an error: " + listenerError.toString() + " Ensure that all [" + message + "] listeners supply a first parameter whose datatype is Client (or a compatible type). Listeners that registered for the message via MessageManager's addMessageListener() with anything other than a single roomID for the toRoomIDs parameter must also define a second paramter whose datatype is Room (or a compatible type). Finally, ensure that the listener's declared message parameters match the following actual message arguments: " + userDefinedArgs + (typeof listenerError.stack === 'undefined' ? '' : '\n\nStack trace follows:\n' + listenerError.stack));
                    }
                };
                CoreMessageListener.prototype.u72 = function (roomID, status) {
                    var theRoom = this.roomMan.getRoom(roomID);
                    switch (status) {
                        case orbiter_5.Status.ROOM_NOT_FOUND:
                            if (this.roomMan.getRoom(roomID)) {
                                this.roomMan.disposeRoom(roomID);
                            }
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.ROOM_FULL:
                        case orbiter_5.Status.AUTHORIZATION_REQUIRED:
                        case orbiter_5.Status.AUTHORIZATION_FAILED:
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ALREADY_IN_ROOM:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.roomMan.fireJoinRoomResult(roomID, status);
                            if (theRoom) {
                                theRoom.doJoinResult(status);
                            }
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u72. Room ID: [" + roomID + "], status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u73 = function (attrScope, clientID, userID, attrName, attrOptions, status) {
                    var _a;
                    switch (status) {
                        case orbiter_5.Status.CLIENT_NOT_FOUND:
                        case orbiter_5.Status.ACCOUNT_NOT_FOUND:
                            break;
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.DUPLICATE_VALUE:
                        case orbiter_5.Status.IMMUTABLE:
                        case orbiter_5.Status.SERVER_ONLY:
                        case orbiter_5.Status.EVALUATION_FAILED:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            if (parseInt(attrOptions) & orbiter_5.AttributeOptions.FLAG_PERSISTENT) {
                                var theAccount = this.accountMan.requestAccount(userID);
                                (_a = theAccount === null || theAccount === void 0 ? void 0 : theAccount.getAttributeManager()) === null || _a === void 0 ? void 0 : _a.fireSetAttributeResult(attrName, attrScope, status);
                            }
                            else {
                                var theClient = this.clientMan.requestClient(clientID);
                                theClient.getAttributeManager().fireSetAttributeResult(attrName, attrScope, status);
                            }
                            break;
                        default:
                            this.log.warn('Unrecognized status received for u73: ' + status);
                    }
                };
                CoreMessageListener.prototype.u74 = function (roomID, attrName, status) {
                    var theRoom = this.roomMan.getRoom(roomID);
                    if (!theRoom) {
                        this.log.warn("Room attribute update received for room with no client-side Room object. Room ID [" + roomID + "]. Attribute: [" + attrName + "]. Status: [" + status + "].");
                        return;
                    }
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.IMMUTABLE:
                        case orbiter_5.Status.SERVER_ONLY:
                        case orbiter_5.Status.EVALUATION_FAILED:
                        case orbiter_5.Status.ROOM_NOT_FOUND:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            theRoom.getAttributeManager().fireSetAttributeResult(attrName, orbiter_5.Tokens.GLOBAL_ATTR, status);
                            break;
                        default:
                            this.log.warn("Unrecognized status received for u74: " + status);
                    }
                };
                CoreMessageListener.prototype.u75 = function (requestID, status) {
                    this.snapshotMan.receiveSnapshotResult(requestID, status);
                };
                CoreMessageListener.prototype.u76 = function (roomID, status) {
                    var leftRoom = this.roomMan.getRoom(roomID);
                    switch (status) {
                        case orbiter_5.Status.ROOM_NOT_FOUND:
                            if (leftRoom) {
                                this.roomMan.disposeRoom(roomID);
                            }
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.NOT_IN_ROOM:
                            this.roomMan.fireLeaveRoomResult(roomID, status);
                            leftRoom === null || leftRoom === void 0 ? void 0 : leftRoom.doLeaveResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u76. Room ID: [" + roomID + "]. Status: [" + status + "].");
                    }
                };
                CoreMessageListener.prototype.u77 = function (roomID, status) {
                    var theRoom = this.roomMan.getRoom(roomID);
                    switch (status) {
                        case orbiter_5.Status.ROOM_NOT_FOUND:
                            if (theRoom) {
                                this.roomMan.disposeRoom(roomID);
                            }
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.AUTHORIZATION_REQUIRED:
                        case orbiter_5.Status.AUTHORIZATION_FAILED:
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ALREADY_OBSERVING:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            this.roomMan.fireObserveRoomResult(roomID, status);
                            theRoom === null || theRoom === void 0 ? void 0 : theRoom.doObserveResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u77. Room ID: [" + roomID + "], status: " + status + ".");
                    }
                };
                CoreMessageListener.prototype.u78 = function (roomID, status) {
                    var theRoom = this.roomMan.getRoom(roomID);
                    switch (status) {
                        case orbiter_5.Status.ROOM_NOT_FOUND:
                            if (theRoom) {
                                this.roomMan.disposeRoom(roomID);
                            }
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.NOT_OBSERVING:
                            this.roomMan.fireStopObservingRoomResult(roomID, status);
                            theRoom === null || theRoom === void 0 ? void 0 : theRoom.doStopObservingResult(status);
                            break;
                        default:
                            this.log.warn("Unrecognized status code for u78. Room ID: [" + roomID + "], status: " + status + ".");
                    }
                };
                CoreMessageListener.prototype.u79 = function (roomID, byClientID, attrName) {
                    var theRoom = this.roomMan.getRoom(roomID);
                    if (!theRoom) {
                        this.log.warn("Room attribute removal notification received for room with no client-side Room object. Room ID [" + roomID + "]. Attribute: [" + attrName + "].");
                        return;
                    }
                    var theClient = byClientID == '' ? null : this.clientMan.requestClient(byClientID);
                    theRoom.getAttributeManager().removeAttributeLocal(attrName, orbiter_5.Tokens.GLOBAL_ATTR, theClient !== null && theClient !== void 0 ? theClient : undefined);
                };
                CoreMessageListener.prototype.u8 = function (attrScope, clientID, userID, attrName, attrVal, attrOptions) {
                    var _a;
                    var options = parseInt(attrOptions);
                    if (options & orbiter_5.AttributeOptions.FLAG_PERSISTENT) {
                        var account = this.accountMan.getAccount(userID);
                        if (account) {
                            (_a = account.getAttributeManager()) === null || _a === void 0 ? void 0 : _a.setAttributeLocal(attrName, attrVal, attrScope);
                        }
                        else {
                            throw new Error("[CORE_MESSAGE_LISTENER] Received an attribute update for  an unknown user account [" + userID + "].");
                        }
                    }
                    else {
                        var client = this.clientMan.getInternalClient(clientID);
                        if (client) {
                            client.getAttributeManager().setAttributeLocal(attrName, attrVal, attrScope);
                        }
                        else {
                            throw new Error("[CORE_MESSAGE_LISTENER] Received an attribute update for  an unknown client [" + clientID + "].");
                        }
                    }
                };
                CoreMessageListener.prototype.u80 = function (roomID, attrName, status) {
                    var theRoom = this.roomMan.getRoom(roomID);
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.IMMUTABLE:
                        case orbiter_5.Status.SERVER_ONLY:
                        case orbiter_5.Status.ROOM_NOT_FOUND:
                        case orbiter_5.Status.ATTR_NOT_FOUND:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            if (theRoom) {
                                theRoom.getAttributeManager().fireDeleteAttributeResult(attrName, orbiter_5.Tokens.GLOBAL_ATTR, status);
                            }
                            break;
                        default:
                            this.log.warn("Unrecognized status received for u80: " + status);
                    }
                };
                CoreMessageListener.prototype.u81 = function (attrScope, clientID, userID, attrName, attrOptions) {
                    var _a;
                    if (parseInt(attrOptions) & orbiter_5.AttributeOptions.FLAG_PERSISTENT) {
                        var account = this.accountMan.requestAccount(userID);
                        (_a = account === null || account === void 0 ? void 0 : account.getAttributeManager()) === null || _a === void 0 ? void 0 : _a.removeAttributeLocal(attrName, attrScope);
                    }
                    else {
                        var client = this.clientMan.requestClient(clientID);
                        client.getAttributeManager().removeAttributeLocal(attrName, attrScope);
                    }
                };
                CoreMessageListener.prototype.u82 = function (attrScope, clientID, userID, attrName, attrOptions, status) {
                    var _a;
                    switch (status) {
                        case orbiter_5.Status.CLIENT_NOT_FOUND:
                        case orbiter_5.Status.ACCOUNT_NOT_FOUND:
                            break;
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.IMMUTABLE:
                        case orbiter_5.Status.SERVER_ONLY:
                        case orbiter_5.Status.ATTR_NOT_FOUND:
                        case orbiter_5.Status.EVALUATION_FAILED:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            if (parseInt(attrOptions) & orbiter_5.AttributeOptions.FLAG_PERSISTENT) {
                                var account = this.accountMan.requestAccount(userID);
                                (_a = account === null || account === void 0 ? void 0 : account.getAttributeManager()) === null || _a === void 0 ? void 0 : _a.fireDeleteAttributeResult(attrName, attrScope, status);
                            }
                            else {
                                var client = this.clientMan.requestClient(clientID);
                                client.getAttributeManager().fireDeleteAttributeResult(attrName, attrScope, status);
                            }
                            break;
                        default:
                            this.log.warn("Unrecognized status received for u82: " + status);
                    }
                };
                CoreMessageListener.prototype.u84 = function () {
                    this.orbiter.getConnectionManager().dispatchSessionTerminated();
                };
                CoreMessageListener.prototype.u87 = function (userID, status) {
                    var account = this.accountMan.getAccount(userID);
                    switch (status) {
                        case orbiter_5.Status.SUCCESS:
                        case orbiter_5.Status.ERROR:
                        case orbiter_5.Status.AUTHORIZATION_FAILED:
                        case orbiter_5.Status.ACCOUNT_NOT_FOUND:
                        case orbiter_5.Status.NOT_LOGGED_IN:
                        case orbiter_5.Status.PERMISSION_DENIED:
                            account === null || account === void 0 ? void 0 : account.fireLogoffResult(status);
                            this.accountMan.fireLogoffResult(userID, status);
                            break;
                        default:
                            this.log.warn("Unrecognized status received for u87: " + status);
                    }
                };
                CoreMessageListener.prototype.u88 = function (clientID, userID, globalAttrs) {
                    var _a;
                    var roomAttrs = [];
                    for (var _i = 3; _i < arguments.length; _i++) {
                        roomAttrs[_i - 3] = arguments[_i];
                    }
                    var account = this.accountMan.requestAccount(userID), client = this.clientMan.requestClient(clientID), clientManifest = new orbiter_5.ClientManifest();
                    clientManifest.deserialize(clientID, userID, undefined, undefined, globalAttrs, roomAttrs);
                    var scopes = clientManifest.persistentAttributes.getScopes(), accountAttrs = (_a = account === null || account === void 0 ? void 0 : account.getAttributeManager()) === null || _a === void 0 ? void 0 : _a.getAttributeCollection();
                    for (var i = scopes.length; --i >= 0;) {
                        accountAttrs === null || accountAttrs === void 0 ? void 0 : accountAttrs.synchronizeScope(scopes[i], clientManifest.persistentAttributes);
                    }
                    if (!client.getAccount()) {
                        client.setAccount(account !== null && account !== void 0 ? account : undefined);
                        client.fireLogin();
                        account === null || account === void 0 ? void 0 : account.doLoginTasks();
                        account && this.accountMan.fireLogin(account, clientID);
                    }
                    else {
                    }
                };
                CoreMessageListener.prototype.u89 = function (clientID, userID) {
                    var client = this.clientMan.getInternalClient(clientID), account = this.accountMan.getAccount(userID);
                    if (account) {
                        if (account.getConnectionState() == orbiter_5.ConnectionState.LOGGED_IN) {
                            if (client) {
                                client.fireLogoff(userID);
                            }
                            account.doLogoffTasks();
                            this.accountMan.fireLogoff(account, clientID);
                        }
                        else {
                        }
                    }
                    else {
                        throw new Error("LOGGED_OFF (u89) received for an unknown user: [" + userID + "].");
                    }
                };
                CoreMessageListener.prototype.u9 = function (roomID, byClientID, attrName, attrVal) {
                    var _a;
                    var theRoom = this.roomMan.getRoom(roomID);
                    var byClient;
                    if (!theRoom) {
                        this.log.warn("Room attribute update received for server-side room with no matching client-side Room object. Room ID [" + roomID + "]. Attribute: [" + attrName + "].");
                        return;
                    }
                    if (byClientID == '') {
                        byClient = null;
                    }
                    else {
                        byClient = (_a = this.clientMan.getClient(byClientID)) !== null && _a !== void 0 ? _a : this.clientMan.requestClient(byClientID);
                    }
                    theRoom.getAttributeManager().setAttributeLocal(attrName, attrVal, orbiter_5.Tokens.GLOBAL_ATTR, byClient !== null && byClient !== void 0 ? byClient : undefined);
                };
                CoreMessageListener.prototype.u90 = function () {
                    var self = this.orbiter.self(), selfAccount = self === null || self === void 0 ? void 0 : self.getAccount();
                    selfAccount === null || selfAccount === void 0 ? void 0 : selfAccount.fireChangePassword();
                    this.accountMan.fireChangePassword(selfAccount === null || selfAccount === void 0 ? void 0 : selfAccount.getUserID());
                };
                return CoreMessageListener;
            }());
            orbiter_5.CoreMessageListener = CoreMessageListener;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var CustomClient = (function () {
                function CustomClient() {
                }
                CustomClient.prototype.addEventListener = function (type, listener, thisArg, priority) {
                    var _a;
                    if (priority === void 0) { priority = 0; }
                    (_a = this.client) === null || _a === void 0 ? void 0 : _a.addEventListener(type, listener, thisArg, priority);
                };
                CustomClient.prototype.ban = function (duration, reason) {
                    var _a;
                    (_a = this.client) === null || _a === void 0 ? void 0 : _a.ban(duration, reason !== null && reason !== void 0 ? reason : undefined);
                };
                CustomClient.prototype.deleteAttribute = function (attrName, attrScope) {
                    var _a;
                    (_a = this.client) === null || _a === void 0 ? void 0 : _a.deleteAttribute(attrName, attrScope);
                };
                CustomClient.prototype.dispatchEvent = function (event) {
                    var _a;
                    return (_a = this.client) === null || _a === void 0 ? void 0 : _a.dispatchEvent(event);
                };
                CustomClient.prototype.getAccount = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getAccount()) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.getAttribute = function (attrName, attrScope) {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getAttribute(attrName, attrScope)) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.getAttributes = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getAttributes()) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.getAttributesByScope = function (scope) {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getAttributesByScope(scope)) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.getClientID = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID()) !== null && _b !== void 0 ? _b : '';
                };
                CustomClient.prototype.getClientManager = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientManager()) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.getConnectTime = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getConnectTime()) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.getConnectionState = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getConnectionState()) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.getIP = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getIP()) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.getObservedRoomIDs = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getObservedRoomIDs()) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.getOccupiedRoomIDs = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getOccupiedRoomIDs()) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.getPing = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getPing()) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.getTimeOnline = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.getTimeOnline()) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.init = function () {
                };
                CustomClient.prototype.isAdmin = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.isAdmin()) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.isInRoom = function (roomID) {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.isInRoom(roomID)) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.isObservingRoom = function (roomID) {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.isObservingRoom(roomID)) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.isSelf = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.isSelf()) !== null && _b !== void 0 ? _b : null;
                };
                CustomClient.prototype.kick = function () {
                    var _a;
                    (_a = this.client) === null || _a === void 0 ? void 0 : _a.kick();
                };
                CustomClient.prototype.observe = function () {
                    var _a;
                    (_a = this.client) === null || _a === void 0 ? void 0 : _a.observe();
                };
                CustomClient.prototype.removeEventListener = function (type, listener, thisObj) {
                    var _a;
                    (_a = this.client) === null || _a === void 0 ? void 0 : _a.removeEventListener(type, listener, thisObj);
                };
                CustomClient.prototype.sendMessage = function (messageName) {
                    var _a;
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    (_a = this.client) === null || _a === void 0 ? void 0 : _a.sendMessage.apply(_a, __spreadArrays([messageName], args));
                };
                CustomClient.prototype.setAttribute = function (attrName, attrValue, attrScope, isShared, evaluate) {
                    var _a;
                    if (isShared === void 0) { isShared = true; }
                    if (evaluate === void 0) { evaluate = false; }
                    (_a = this.client) === null || _a === void 0 ? void 0 : _a.setAttribute(attrName, attrValue, attrScope, isShared, evaluate);
                };
                CustomClient.prototype.setClient = function (client) {
                    this.client = client;
                };
                CustomClient.prototype.setClientClass = function (scope, clientClass) {
                    var _a;
                    var fallbackClasses = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        fallbackClasses[_i - 2] = arguments[_i];
                    }
                    (_a = this.client) === null || _a === void 0 ? void 0 : _a.setClientClass.apply(_a, __spreadArrays([scope, clientClass], fallbackClasses));
                };
                CustomClient.prototype.stopObserving = function () {
                    var _a;
                    (_a = this.client) === null || _a === void 0 ? void 0 : _a.stopObserving();
                };
                CustomClient.prototype.toString = function () {
                    return "[object CustomClient, ID: " + this.getClientID() + "]";
                };
                return CustomClient;
            }());
            orbiter.CustomClient = CustomClient;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var events;
        (function (events) {
            var EventListener = (function () {
                function EventListener(listener, thisArg, priority) {
                    this.listener = listener;
                    this.thisArg = thisArg;
                    this.priority = priority;
                }
                EventListener.prototype.getListenerFunction = function () {
                    return this.listener;
                };
                EventListener.prototype.getPriority = function () {
                    return this.priority;
                };
                EventListener.prototype.getThisArg = function () {
                    return this.thisArg;
                };
                EventListener.prototype.toString = function () {
                    return '[object EventListener]';
                };
                return EventListener;
            }());
            events.EventListener = EventListener;
        })(events = user1.events || (user1.events = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var filters;
            (function (filters) {
                var FilterSet = (function () {
                    function FilterSet() {
                        this.filters = [];
                    }
                    FilterSet.prototype.addFilter = function (filter) {
                        this.filters.push(filter);
                    };
                    FilterSet.prototype.getFilters = function () {
                        return this.filters.slice(0);
                    };
                    FilterSet.prototype.toXMLString = function () {
                        var s = '<filters>\n';
                        for (var _i = 0, _a = this.filters; _i < _a.length; _i++) {
                            var filter = _a[_i];
                            s += filter.toXMLString() + '\n';
                        }
                        s += '</filters>';
                        return s;
                    };
                    return FilterSet;
                }());
                filters.FilterSet = FilterSet;
            })(filters = orbiter.filters || (orbiter.filters = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var Gateway = (function () {
                function Gateway() {
                    this.connectionsPerSecond = 0;
                    this.maxConnectionsPerSecond = 0;
                    this.clientsPerSecond = 0;
                    this.maxClientsPerSecond = 0;
                }
                return Gateway;
            }());
            orbiter.Gateway = Gateway;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var GatewayBandwidth = (function () {
                function GatewayBandwidth() {
                    this.averageRead = 0;
                    this.averageWritten = 0;
                    this.intervalRead = 0;
                    this.intervalWritten = 0;
                    this.lifetimeRead = 0;
                    this.lifetimeWritten = 0;
                    this.maxIntervalRead = 0;
                    this.maxIntervalWritten = 0;
                    this.scheduledWrite = 0;
                }
                return GatewayBandwidth;
            }());
            orbiter.GatewayBandwidth = GatewayBandwidth;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var GatewaysSnapshot = (function (_super) {
                    __extends(GatewaysSnapshot, _super);
                    function GatewaysSnapshot() {
                        var _this = _super.call(this) || this;
                        _this.method = orbiter.UPC.GET_GATEWAYS_SNAPSHOT;
                        return _this;
                    }
                    GatewaysSnapshot.prototype.setGateways = function (value) {
                        this.gateways = value;
                    };
                    GatewaysSnapshot.prototype.getGateways = function () {
                        var _a, _b;
                        return (_b = (_a = this.gateways) === null || _a === void 0 ? void 0 : _a.slice()) !== null && _b !== void 0 ? _b : null;
                    };
                    return GatewaysSnapshot;
                }(snapshot.Snapshot));
                snapshot.GatewaysSnapshot = GatewaysSnapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var HTTPConnection = (function (_super) {
                __extends(HTTPConnection, _super);
                function HTTPConnection(host, port, type) {
                    if (type === void 0) { type = orbiter.ConnectionType.HTTP; }
                    var _this = _super.call(this, host, port, type) || this;
                    _this.url = '';
                    _this.sendDelayTimerEnabled = true;
                    _this.messageQueue = [];
                    _this.retryDelay = 500;
                    _this.retryHelloTimeoutID = -1;
                    _this.retryIncomingTimeoutID = -1;
                    _this.retryOutgoingTimeoutID = -1;
                    _this.helloResponsePending = false;
                    _this.outgoingResponsePending = false;
                    _this.sendDelayTimeoutID = -1;
                    _this.sendDelayTimerRunning = false;
                    _this.sendDelay = HTTPConnection.DEFAULT_SEND_DELAY;
                    _this.addEventListener(orbiter.ConnectionEvent.SESSION_TERMINATED, _this.sessionTerminatedListener, _this);
                    _this.addEventListener(orbiter.ConnectionEvent.SESSION_NOT_FOUND, _this.sessionNotFoundListener, _this);
                    return _this;
                }
                HTTPConnection.prototype.doDispose = function () { };
                HTTPConnection.prototype.doRequestDeactivation = function () { };
                HTTPConnection.prototype.doRetryHello = function () { };
                HTTPConnection.prototype.doRetryIncoming = function () { };
                HTTPConnection.prototype.doRetryOutgoing = function () { };
                HTTPConnection.prototype.doSendHello = function (data) { };
                HTTPConnection.prototype.doSendIncoming = function () { };
                HTTPConnection.prototype.doSendOutgoing = function (data) { };
                HTTPConnection.prototype.applyAffinity = function (data) {
                    _super.prototype.applyAffinity.call(this);
                    this.buildURL();
                };
                HTTPConnection.prototype.buildURL = function () {
                    this.url = "http://" + this.host + ":" + this.port;
                };
                HTTPConnection.prototype.connect = function () {
                    _super.prototype.connect.call(this);
                };
                HTTPConnection.prototype.deactivateConnection = function () {
                    var _a, _b, _c, _d;
                    (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().debug("[CONNECTION] " + this.toString() + " Deactivating...");
                    this.connectionState = orbiter.ConnectionState.DISCONNECTION_IN_PROGRESS;
                    this.stopSendDelayTimer();
                    if (this.retryHelloTimeoutID != -1) {
                        (_b = this.orbiter) === null || _b === void 0 ? void 0 : _b.getLog().debug("[CONNECTION] " + this.toString() + " Cancelling scheduled hello-request retry.");
                        clearTimeout(this.retryHelloTimeoutID);
                        this.retryHelloTimeoutID = -1;
                    }
                    if (this.retryIncomingTimeoutID != -1) {
                        (_c = this.orbiter) === null || _c === void 0 ? void 0 : _c.getLog().debug("[CONNECTION] " + this.toString() + " Cancelling scheduled incoming-request retry.");
                        clearTimeout(this.retryIncomingTimeoutID);
                        this.retryIncomingTimeoutID = -1;
                    }
                    if (this.retryOutgoingTimeoutID != -1) {
                        (_d = this.orbiter) === null || _d === void 0 ? void 0 : _d.getLog().debug("[CONNECTION] " + this.toString() + " Cancelling scheduled outgoing-request retry.");
                        clearTimeout(this.retryOutgoingTimeoutID);
                        this.retryOutgoingTimeoutID = -1;
                    }
                    this.deactivateHTTPRequests();
                    _super.prototype.deactivateConnection.call(this);
                };
                HTTPConnection.prototype.setServer = function (host, port) {
                    try {
                        _super.prototype.setServer.call(this, host, port);
                    }
                    finally {
                        this.buildURL();
                    }
                };
                HTTPConnection.prototype.toString = function () {
                    return "[" + this.connectionType + ", requested host: " + this.requestedHost + ", host: " + this.host + ", port: " + this.port + ", send-delay: " + this.getSendDelay() + "]";
                };
                HTTPConnection.prototype.dispose = function () {
                    this.doDispose();
                    this.stopSendDelayTimer();
                    _super.prototype.dispose.call(this);
                };
                HTTPConnection.prototype.deactivateHTTPRequests = function () {
                    var _a;
                    (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().debug("[CONNECTION] " + this.toString() + " Closing all pending HTTP requests.");
                    this.doRequestDeactivation();
                    this.helloResponsePending = false;
                    this.outgoingResponsePending = false;
                };
                HTTPConnection.prototype.flushMessageQueue = function () {
                    if (!this.outgoingResponsePending) {
                        this.openNewOutgoingRequest(this.messageQueue.join(''));
                        this.messageQueue = [];
                    }
                    else {
                    }
                };
                HTTPConnection.prototype.getSendDelay = function () {
                    return this.sendDelay;
                };
                HTTPConnection.prototype.helloCompleteListener = function (data) {
                    var _this = this;
                    var _a, _b;
                    if (this.disposed)
                        return;
                    if (this.helloResponsePending) {
                        this.helloResponsePending = false;
                        this.processIncomingData(data);
                        setTimeout(function () { return _this.openNewIncomingRequest(); }, 0);
                    }
                    else {
                        if (this.connectionState == orbiter.ConnectionState.NOT_CONNECTED) {
                            (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().error("[CONNECTION]" + toString() + " u66 (SERVER_HELLO) received, but client is not connected. Ignoring.");
                        }
                        else {
                            (_b = this.orbiter) === null || _b === void 0 ? void 0 : _b.getLog().error("[CONNECTION]" + toString() + " Redundant u66 (SERVER_HELLO) received. Ignoring.");
                        }
                    }
                };
                HTTPConnection.prototype.helloErrorListener = function () {
                    var _this = this;
                    var _a, _b;
                    if (this.disposed)
                        return;
                    if (this.retryHelloTimeoutID != -1)
                        return;
                    if (this.connectionState != orbiter.ConnectionState.CONNECTION_IN_PROGRESS) {
                        (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().error("[CONNECTION]" + this.toString() + " u65 (CLIENT_HELLO) request failed. Connection is no longer in progress, so no retry scheduled.");
                        return;
                    }
                    (_b = this.orbiter) === null || _b === void 0 ? void 0 : _b.getLog().error("[CONNECTION]" + this.toString() + " u65 (CLIENT_HELLO) request failed. Retrying in " + this.retryDelay + "ms.");
                    this.retryHelloTimeoutID = setTimeout(function () {
                        _this.retryHelloTimeoutID = -1;
                        _this.doRetryHello();
                    }, this.retryDelay);
                };
                HTTPConnection.prototype.incomingCompleteListener = function (data) {
                    var _this = this;
                    if (this.disposed ||
                        this.connectionState == orbiter.ConnectionState.NOT_CONNECTED ||
                        this.connectionState == orbiter.ConnectionState.DISCONNECTION_IN_PROGRESS) {
                        return;
                    }
                    setTimeout(function () {
                        _this.processIncomingData(data);
                        if (_this.disposed ||
                            _this.connectionState == orbiter.ConnectionState.NOT_CONNECTED ||
                            _this.connectionState == orbiter.ConnectionState.DISCONNECTION_IN_PROGRESS) {
                            return;
                        }
                        _this.openNewIncomingRequest();
                    }, 0);
                };
                HTTPConnection.prototype.incomingErrorListener = function () {
                    var _this = this;
                    var _a, _b;
                    if (this.disposed)
                        return;
                    if (this.retryIncomingTimeoutID != -1)
                        return;
                    if (this.connectionState == orbiter.ConnectionState.NOT_CONNECTED ||
                        this.connectionState == orbiter.ConnectionState.DISCONNECTION_IN_PROGRESS) {
                        (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().error("[CONNECTION]" + this.toString() + " Incoming request failed. Connection is closed, so no retry scheduled.");
                        return;
                    }
                    (_b = this.orbiter) === null || _b === void 0 ? void 0 : _b.getLog().error("[CONNECTION]" + this.toString() + " Incoming request failed. Retrying in " + this.retryDelay + "ms.");
                    this.retryIncomingTimeoutID = setTimeout(function () {
                        _this.retryIncomingTimeoutID = -1;
                        if (_this.disposed ||
                            _this.connectionState == orbiter.ConnectionState.NOT_CONNECTED ||
                            _this.connectionState == orbiter.ConnectionState.DISCONNECTION_IN_PROGRESS) {
                            return;
                        }
                        _this.doRetryIncoming();
                    }, this.retryDelay);
                };
                HTTPConnection.prototype.openNewIncomingRequest = function () {
                    this.doSendIncoming();
                };
                HTTPConnection.prototype.openNewOutgoingRequest = function (data) {
                    this.dispatchSendData(data);
                    this.outgoingResponsePending = true;
                    this.doSendOutgoing(data);
                    if (this.sendDelayTimerEnabled) {
                        this.startSendDelayTimer();
                    }
                };
                HTTPConnection.prototype.outgoingCompleteListener = function () {
                    var _this = this;
                    if (this.disposed)
                        return;
                    this.outgoingResponsePending = false;
                    if (!this.sendDelayTimerRunning && this.messageQueue.length > 0) {
                        setTimeout(function () { return _this.flushMessageQueue(); }, 0);
                    }
                };
                HTTPConnection.prototype.outgoingErrorListener = function () {
                    var _this = this;
                    var _a, _b;
                    if (this.disposed)
                        return;
                    if (this.retryOutgoingTimeoutID != -1)
                        return;
                    if (this.connectionState == orbiter.ConnectionState.NOT_CONNECTED ||
                        this.connectionState == orbiter.ConnectionState.DISCONNECTION_IN_PROGRESS) {
                        (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().error("[CONNECTION]" + this.toString() + " Outgoing request failed. Connection is closed, so no retry scheduled.");
                        return;
                    }
                    (_b = this.orbiter) === null || _b === void 0 ? void 0 : _b.getLog().error("[CONNECTION]" + this.toString() + " Outgoing request failed. Retrying in " + this.retryDelay + "ms.");
                    this.retryOutgoingTimeoutID = setTimeout(function () {
                        _this.retryOutgoingTimeoutID = -1;
                        if (_this.disposed ||
                            _this.connectionState == orbiter.ConnectionState.NOT_CONNECTED ||
                            _this.connectionState == orbiter.ConnectionState.DISCONNECTION_IN_PROGRESS) {
                            return;
                        }
                        _this.doRetryOutgoing();
                    }, this.retryDelay);
                };
                HTTPConnection.prototype.processIncomingData = function (data) {
                    var _a;
                    if (this.disposed)
                        return;
                    this.dispatchReceiveData(data);
                    var upcs = [];
                    var upcEndTagIndex = data.indexOf('</U>');
                    if (upcEndTagIndex == -1 && data.length > 0) {
                        (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().error("Invalid message received. No UPC found: [" + data + "]");
                        if (!this.isReady()) {
                            this.disconnect();
                            return;
                        }
                    }
                    while (upcEndTagIndex != -1) {
                        upcs.push(data.substring(0, upcEndTagIndex + 4));
                        data = data.substring(upcEndTagIndex + 4);
                        upcEndTagIndex = data.indexOf('</U>');
                    }
                    for (var i = 0; i < upcs.length; i++) {
                        this.dispatchEvent(new orbiter.ConnectionEvent(orbiter.ConnectionEvent.RECEIVE_UPC, upcs[i]));
                    }
                };
                HTTPConnection.prototype.send = function (data) {
                    if (!this.sendDelayTimerRunning) {
                        this.messageQueue.push(data);
                        this.flushMessageQueue();
                    }
                    else {
                        this.messageQueue.push(data);
                    }
                };
                HTTPConnection.prototype.sendDelayTimerListener = function () {
                    this.sendDelayTimerRunning = false;
                    if (this.messageQueue.length > 0) {
                        this.flushMessageQueue();
                    }
                    else {
                    }
                };
                HTTPConnection.prototype.sessionNotFoundListener = function (e) {
                    this.deactivateConnection();
                    if (this.connectionState == orbiter.ConnectionState.CONNECTION_IN_PROGRESS) {
                        this.dispatchConnectFailure("Client attempted to reestablish an expired session or establish an unknown session.");
                    }
                    else {
                        this.dispatchServerKillConnect();
                    }
                };
                HTTPConnection.prototype.sessionTerminatedListener = function (e) {
                    this.deactivateConnection();
                    if (this.connectionState == orbiter.ConnectionState.CONNECTION_IN_PROGRESS) {
                        this.dispatchConnectFailure('Server terminated session before READY state was achieved.');
                    }
                    else {
                        this.dispatchServerKillConnect();
                    }
                };
                HTTPConnection.prototype.setRetryDelay = function (milliseconds) {
                    var _a;
                    if (milliseconds > -1) {
                        if (milliseconds != this.retryDelay) {
                            this.retryDelay = milliseconds;
                            (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().debug("[CONNECTION] " + this.toString() + " Retry delay set to: [" + milliseconds + "].");
                        }
                    }
                    else {
                        throw new Error("[CONNECTION]" + this.toString() + " Invalid retry delay specified: [" + milliseconds + "].");
                    }
                };
                HTTPConnection.prototype.setSendDelay = function (milliseconds) {
                    var _a, _b;
                    if (milliseconds > 0) {
                        if ((milliseconds != this.sendDelay)) {
                            this.sendDelay = milliseconds;
                            (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().debug("[CONNECTION] " + this.toString() + " Send delay set to: [" + milliseconds + "].");
                        }
                        this.sendDelayTimerEnabled = true;
                    }
                    else if (milliseconds == -1) {
                        (_b = this.orbiter) === null || _b === void 0 ? void 0 : _b.getLog().debug("[CONNECTION] " + toString() + " Send delay disabled.");
                        this.sendDelayTimerEnabled = false;
                        this.stopSendDelayTimer();
                    }
                    else {
                        throw new Error("[CONNECTION]" + this.toString() + " Invalid send-delay specified: [" + milliseconds + "].");
                    }
                };
                HTTPConnection.prototype.startSendDelayTimer = function () {
                    var _this = this;
                    this.stopSendDelayTimer();
                    this.sendDelayTimerRunning = true;
                    this.sendDelayTimeoutID = setTimeout(function () { return _this.sendDelayTimerListener(); }, this.sendDelay);
                };
                HTTPConnection.prototype.stopSendDelayTimer = function () {
                    this.sendDelayTimerRunning = false;
                    if (this.sendDelayTimeoutID != -1) {
                        clearTimeout(this.sendDelayTimeoutID);
                    }
                    this.sendDelayTimeoutID = -1;
                };
                HTTPConnection.prototype.transmitHelloMessage = function (helloString) {
                    this.dispatchSendData(helloString);
                    this.helloResponsePending = true;
                    this.doSendHello(helloString);
                };
                HTTPConnection.DEFAULT_SEND_DELAY = 300;
                return HTTPConnection;
            }(orbiter.Connection));
            orbiter.HTTPConnection = HTTPConnection;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var HTTPDirectConnection = (function (_super) {
                __extends(HTTPDirectConnection, _super);
                function HTTPDirectConnection(host, port, type) {
                    if (type === void 0) { type = orbiter.ConnectionType.HTTP; }
                    var _this = _super.call(this, host, port, type) || this;
                    _this.outgoingRequestID = 0;
                    _this.incomingRequestID = 0;
                    _this.pendingRequests = [];
                    return _this;
                }
                HTTPDirectConnection.prototype.createHelloPostData = function (data) {
                    return "mode=d&data=" + data;
                };
                HTTPDirectConnection.prototype.createIncomingPostData = function () {
                    var _a;
                    this.incomingRequestID++;
                    return "rid=" + this.incomingRequestID + "&sid=" + ((_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getSessionID()) + "&mode=c";
                };
                HTTPDirectConnection.prototype.createOutgoingPostData = function (data) {
                    var _a;
                    this.outgoingRequestID++;
                    return "rid=" + this.outgoingRequestID + "&sid=" + ((_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getSessionID()) + "&mode=s&data=" + data;
                };
                HTTPDirectConnection.prototype.doDispose = function () {
                    this.deactivateHTTPRequests();
                };
                HTTPDirectConnection.prototype.doRequestDeactivation = function () {
                    for (var i = this.pendingRequests.length; --i >= 0;) {
                        try {
                            this.pendingRequests[i].abort();
                        }
                        catch (e) {
                        }
                    }
                    this.pendingRequests = [];
                };
                HTTPDirectConnection.prototype.doRetryHello = function () {
                    this.retryHello();
                };
                HTTPDirectConnection.prototype.doRetryIncoming = function () {
                    this.retryIncoming();
                };
                HTTPDirectConnection.prototype.doRetryOutgoing = function () {
                    this.retryOutgoing();
                };
                HTTPDirectConnection.prototype.doSendHello = function (helloString) {
                    this.newHelloRequest(helloString);
                };
                HTTPDirectConnection.prototype.doSendIncoming = function () {
                    this.newIncomingRequest();
                };
                HTTPDirectConnection.prototype.doSendOutgoing = function (data) {
                    this.newOutgoingRequest(data);
                };
                HTTPDirectConnection.prototype.connect = function () {
                    _super.prototype.connect.call(this);
                    this.beginReadyHandshake();
                };
                HTTPDirectConnection.prototype.toString = function () {
                    return "[HTTPDirectConnection, requested host: " + this.requestedHost + ", host: " + this.host + ", port: " + this.port + ", send-delay: " + this.getSendDelay() + "]";
                };
                HTTPDirectConnection.helloRequestErrorListener = function (xhr, connection) {
                    connection.removePendingRequest(xhr);
                    connection.helloErrorListener();
                };
                HTTPDirectConnection.helloRequestReadystatechangeListener = function (xhr, connection) {
                    if (xhr.readyState == 4) {
                        connection.removePendingRequest(xhr);
                        if (xhr.status >= 200 && xhr.status <= 299) {
                            connection.helloCompleteListener(xhr.responseText);
                        }
                        else {
                            connection.helloErrorListener();
                        }
                    }
                };
                HTTPDirectConnection.incomingRequestErrorListener = function (xhr, connection) {
                    connection.removePendingRequest(xhr);
                    connection.incomingErrorListener();
                };
                HTTPDirectConnection.incomingRequestReadystatechangeListener = function (xhr, connection) {
                    if (xhr.readyState == 4) {
                        connection.removePendingRequest(xhr);
                        if (xhr.status >= 200 && xhr.status <= 299) {
                            connection.incomingCompleteListener(xhr.responseText);
                        }
                        else {
                            connection.incomingErrorListener();
                        }
                    }
                };
                HTTPDirectConnection.prototype.newHelloRequest = function (data) {
                    this.lastHelloPostData = this.createHelloPostData(encodeURIComponent(data));
                    this.transmitRequest(this.lastHelloPostData, HTTPDirectConnection.helloRequestReadystatechangeListener, HTTPDirectConnection.helloRequestErrorListener);
                };
                HTTPDirectConnection.prototype.newIncomingRequest = function () {
                    this.lastIncomingPostData = this.createIncomingPostData();
                    this.transmitRequest(this.lastIncomingPostData, HTTPDirectConnection.incomingRequestReadystatechangeListener, HTTPDirectConnection.incomingRequestErrorListener);
                };
                HTTPDirectConnection.prototype.newOutgoingRequest = function (data) {
                    this.lastOutgoingPostData = this.createOutgoingPostData(encodeURIComponent(data));
                    this.transmitRequest(this.lastOutgoingPostData, HTTPDirectConnection.outgoingRequestReadystatechangeListener, HTTPDirectConnection.outgoingRequestErrorListener);
                };
                HTTPDirectConnection.outgoingRequestErrorListener = function (xhr, connection) {
                    connection.removePendingRequest(xhr);
                    connection.outgoingErrorListener();
                };
                HTTPDirectConnection.outgoingRequestReadystatechangeListener = function (xhr, connection) {
                    if (xhr.readyState == 4) {
                        connection.removePendingRequest(xhr);
                        if (xhr.status >= 200 && xhr.status <= 299) {
                            connection.outgoingCompleteListener();
                        }
                        else {
                            connection.outgoingErrorListener();
                        }
                    }
                };
                HTTPDirectConnection.prototype.removePendingRequest = function (request) {
                    for (var i = this.pendingRequests.length; --i >= 0;) {
                        if (this.pendingRequests[i] === request) {
                            this.pendingRequests.splice(i, 1);
                        }
                    }
                };
                HTTPDirectConnection.prototype.retryHello = function () {
                    this.transmitRequest(this.lastHelloPostData, HTTPDirectConnection.helloRequestReadystatechangeListener, HTTPDirectConnection.helloRequestErrorListener);
                };
                HTTPDirectConnection.prototype.retryIncoming = function () {
                    this.transmitRequest(this.lastIncomingPostData, HTTPDirectConnection.incomingRequestReadystatechangeListener, HTTPDirectConnection.incomingRequestErrorListener);
                };
                HTTPDirectConnection.prototype.retryOutgoing = function () {
                    this.transmitRequest(this.lastOutgoingPostData, HTTPDirectConnection.outgoingRequestReadystatechangeListener, HTTPDirectConnection.outgoingRequestErrorListener);
                };
                HTTPDirectConnection.prototype.transmitRequest = function (data, readystatechangeListener, errorListener) {
                    var request;
                    var self = this;
                    if (typeof this.XDomainRequest != 'undefined') {
                        var request_1 = new XDomainRequest();
                        request_1.onload = function () {
                            request_1.readyState = 4;
                            request_1.status = 200;
                            readystatechangeListener(this, self);
                        };
                        request_1.onerror = function () {
                            errorListener(this, self);
                        };
                        request_1.ontimeout = function () {
                            errorListener(this, self);
                        };
                        request_1.onprogress = function () { };
                    }
                    else {
                        var request_2 = new XMLHttpRequest();
                        this.pendingRequests.push(request_2);
                        request_2.onreadystatechange = function () {
                            readystatechangeListener(this, self);
                        };
                        request_2.onerror = function () {
                            errorListener(this, self);
                        };
                    }
                    request.open('POST', this.url);
                    if (typeof request.setRequestHeader != 'undefined') {
                        request.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
                    }
                    request.send(data);
                };
                return HTTPDirectConnection;
            }(orbiter.HTTPConnection));
            orbiter.HTTPDirectConnection = HTTPDirectConnection;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var HTTPIFrameConnection = (function (_super) {
                __extends(HTTPIFrameConnection, _super);
                function HTTPIFrameConnection(host, port, type) {
                    var _this = _super.call(this, host, port, type || net.user1.orbiter.ConnectionType.HTTP) || this;
                    _this.iFrameReady = false;
                    _this.postMessageInited = false;
                    return _this;
                }
                HTTPIFrameConnection.prototype.doDispose = function () {
                    this.postToIFrame('dispose');
                };
                HTTPIFrameConnection.prototype.doRequestDeactivation = function () {
                    this.postToIFrame('deactivate');
                };
                HTTPIFrameConnection.prototype.doRetryHello = function () {
                    this.postToIFrame('retryhello');
                };
                HTTPIFrameConnection.prototype.doRetryIncoming = function () {
                    this.postToIFrame('retryincoming');
                };
                HTTPIFrameConnection.prototype.doRetryOutgoing = function () {
                    this.postToIFrame('retryoutgoing');
                };
                HTTPIFrameConnection.prototype.doSendHello = function (helloString) {
                    this.postToIFrame('sendhello', helloString);
                };
                HTTPIFrameConnection.prototype.doSendIncoming = function () {
                    this.postToIFrame('sendincoming');
                };
                HTTPIFrameConnection.prototype.doSendOutgoing = function (data) {
                    this.postToIFrame('sendoutgoing', data);
                };
                HTTPIFrameConnection.prototype.connect = function () {
                    this.postMessageInited || this.initPostMessage();
                    _super.prototype.connect.call(this);
                    this.makeIFrame();
                };
                HTTPIFrameConnection.prototype.toString = function () {
                    return "[HTTPIFrameConnection, requested host: " + this.requestedHost + ", host: " + this.host + ", port: " + this.port + ", send-delay: " + this.getSendDelay() + "]";
                };
                HTTPIFrameConnection.prototype.initPostMessage = function () {
                    var _this = this;
                    var _a, _b;
                    if (this.postMessageInited) {
                        throw new Error('[HTTPIFrameConnection] Illegal duplicate initialization attempt.');
                    }
                    var win = (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.window;
                    var errorMsg = '';
                    var postMessageListener = function (e) {
                        var _a;
                        if (e.origin.indexOf("//" + _this.host + (_this.port == 80 ? '' : (':' + _this.port))) == -1 &&
                            e.origin.indexOf("//" + _this.requestedHost + (_this.port == 80 ? '' : (':' + _this.port))) == -1) {
                            (_a = _this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().error("[CONNECTION] " + _this.toString() + " Ignored message from unknown origin: " + e.origin);
                            return;
                        }
                        _this.processPostMessage(e.data);
                    };
                    if (!win) {
                        errorMsg = "[HTTPIFrameConnection] Unable to create connection. No window object found.";
                    }
                    else {
                        if (typeof win.addEventListener != 'undefined') {
                            win.addEventListener('message', postMessageListener, false);
                        }
                        else {
                            if (typeof win.attachEvent != 'undefined') {
                                win.attachEvent('onmessage', postMessageListener);
                            }
                            else {
                                errorMsg = "[HTTPIFrameConnection] Unable to create connection. No event listener registration method found on window object.";
                            }
                        }
                    }
                    if (errorMsg) {
                        (_b = this.orbiter) === null || _b === void 0 ? void 0 : _b.getLog().error(errorMsg);
                        throw new Error(errorMsg);
                    }
                    this.postMessageInited = true;
                };
                HTTPIFrameConnection.prototype.makeIFrame = function () {
                    var _a, _b, _c;
                    if (typeof ((_b = (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.window) === null || _b === void 0 ? void 0 : _b.document) == 'undefined') {
                        var errorMsg = "[HTTPIFrameConnection] Unable to create connection. No document object found.";
                        (_c = this.orbiter) === null || _c === void 0 ? void 0 : _c.getLog().error(errorMsg);
                        throw new Error(errorMsg);
                    }
                    var doc = this.orbiter.window.document;
                    this.iFrameReady = false;
                    if (this.iframe) {
                        this.postToIFrame('dispose');
                        doc.body.removeChild(this.iframe);
                    }
                    this.iframe = doc.createElement('iframe');
                    this.iframe.width = '0px';
                    this.iframe.height = '0px';
                    this.iframe.frameBorder = '0';
                    this.iframe.style.visibility = 'hidden';
                    this.iframe.style.display = 'none';
                    this.iframe.src = this.url + '/orbiter';
                    doc.body.appendChild(this.iframe);
                };
                HTTPIFrameConnection.prototype.onIFrameReady = function () {
                    this.beginReadyHandshake();
                };
                HTTPIFrameConnection.prototype.postToIFrame = function (cmd, data) {
                    var _a, _b;
                    if (data === void 0) { data = ''; }
                    if (this.iframe && this.iFrameReady) {
                        (_b = (_a = this.iframe) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.postMessage(cmd + "," + data, this.iframe.contentWindow.location.href);
                    }
                };
                HTTPIFrameConnection.prototype.processPostMessage = function (postedData) {
                    var _a = postedData.split(','), cmd = _a[0], data = _a[1];
                    switch (cmd) {
                        case 'ready':
                            this.iFrameReady = true;
                            this.onIFrameReady();
                            break;
                        case 'hellocomplete':
                            this.helloCompleteListener(data);
                            break;
                        case 'helloerror':
                            this.helloErrorListener();
                            break;
                        case 'outgoingcomplete':
                            this.outgoingCompleteListener();
                            break;
                        case 'outgoingerror':
                            this.outgoingErrorListener();
                            break;
                        case 'incomingcomplete':
                            this.incomingCompleteListener(data);
                            break;
                        case 'incomingerror':
                            this.incomingErrorListener();
                            break;
                    }
                };
                HTTPIFrameConnection.prototype.u66 = function (serverVersion, sessionID, upcVersion, protocolCompatible) {
                    _super.prototype.u66.call(this, serverVersion, sessionID, upcVersion, protocolCompatible);
                    if (this.iframe) {
                        this.postToIFrame('sessionid', sessionID);
                    }
                };
                return HTTPIFrameConnection;
            }(net.user1.orbiter.HTTPConnection));
            orbiter.HTTPIFrameConnection = HTTPIFrameConnection;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var utils;
        (function (utils) {
            var LocalData = (function () {
                function LocalData() {
                    this.data = (typeof localStorage == 'undefined') ? new utils.LocalStorage() : localStorage;
                }
                LocalData.prototype.read = function (record, field) {
                    var _a;
                    return (_a = this.data.getItem(record + field)) !== null && _a !== void 0 ? _a : null;
                };
                LocalData.prototype.remove = function (record, field) {
                    var value = this.data.getItem(record + field);
                    value && this.data.removeItem(record + field);
                };
                LocalData.prototype.write = function (record, field, value) {
                    this.data.setItem(record + field, value);
                };
                return LocalData;
            }());
            utils.LocalData = LocalData;
        })(utils = user1.utils || (user1.utils = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var utils;
        (function (utils) {
            var LocalStorage = (function () {
                function LocalStorage() {
                    this.data = new utils.MemoryStore();
                }
                LocalStorage.prototype.getItem = function (key) {
                    return this.data.read('localStorage', key);
                };
                LocalStorage.prototype.removeItem = function (key) {
                    this.data.remove('localStorage', key);
                };
                LocalStorage.prototype.setItem = function (key, value) {
                    this.data.write('localStorage', key, value);
                };
                return LocalStorage;
            }());
            utils.LocalStorage = LocalStorage;
        })(utils = user1.utils || (user1.utils = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var utils;
        (function (utils) {
            var NumericFormatter = (function () {
                function NumericFormatter() {
                }
                NumericFormatter.addLeadingZero = function (n) {
                    return ((n > 9) ? '' : '0') + n;
                };
                NumericFormatter.addTrailingZeros = function (n) {
                    var ns = n.toString();
                    if (ns.length == 1) {
                        return ns + '00';
                    }
                    else if (ns.length == 2) {
                        return ns + '0';
                    }
                    else {
                        return ns;
                    }
                };
                NumericFormatter.dateToLocalHrMinSec = function (date) {
                    return this.addLeadingZero(date.getHours()) + ':' +
                        this.addLeadingZero(date.getMinutes()) + ':' +
                        this.addLeadingZero(date.getSeconds());
                };
                NumericFormatter.dateToLocalHrMinSecMs = function (date) {
                    return NumericFormatter.dateToLocalHrMinSec(date) + '.' +
                        NumericFormatter.addTrailingZeros(date.getMilliseconds());
                };
                NumericFormatter.msToElapsedDayHrMinSec = function (ms) {
                    var sec = Math.floor(ms / 1000);
                    var min = Math.floor(sec / 60);
                    sec = sec % 60;
                    var timeString = NumericFormatter.addLeadingZero(sec);
                    var hr = Math.floor(min / 60);
                    min = min % 60;
                    timeString = NumericFormatter.addLeadingZero(min) + ":" + timeString;
                    var day = Math.floor(hr / 24);
                    hr = hr % 24;
                    timeString = NumericFormatter.addLeadingZero(hr) + ":" + timeString;
                    if (day > 0) {
                        timeString = day + "d " + timeString;
                    }
                    return timeString;
                };
                return NumericFormatter;
            }());
            utils.NumericFormatter = NumericFormatter;
        })(utils = user1.utils || (user1.utils = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var logger;
        (function (logger) {
            var NumericFormatter = net.user1.utils.NumericFormatter;
            var Logger = (function (_super) {
                __extends(Logger, _super);
                function Logger(historyLength) {
                    if (historyLength === void 0) { historyLength = 100; }
                    var _this = _super.call(this) || this;
                    _this.historyLength = 0;
                    _this.logLevel = 0;
                    _this.messages = [];
                    _this.suppressionTerms = [];
                    _this.timeStampEnabled = false;
                    _this.setHistoryLength(historyLength);
                    _this.enableTimeStamp();
                    _this.setLevel(Logger.INFO);
                    return _this;
                }
                Logger.prototype.addSuppressionTerm = function (term) {
                    this.debug("Added suppression term. Log messages containing '" + term + "' will now be ignored.");
                    this.suppressionTerms.push(term);
                };
                Logger.prototype.debug = function (msg) {
                    this.addEntry(4, net.user1.logger.Logger.DEBUG, msg);
                };
                Logger.prototype.disableTimeStamp = function () {
                    this.timeStampEnabled = false;
                };
                Logger.prototype.enableTimeStamp = function () {
                    this.timeStampEnabled = true;
                };
                Logger.prototype.error = function (msg) {
                    this.addEntry(1, net.user1.logger.Logger.ERROR, msg);
                };
                Logger.prototype.fatal = function (msg) {
                    this.addEntry(0, net.user1.logger.Logger.FATAL, msg);
                };
                Logger.prototype.getHistory = function () {
                    return this.messages.slice(0);
                };
                Logger.prototype.getHistoryLength = function () {
                    return this.historyLength;
                };
                Logger.prototype.getLevel = function () {
                    return net.user1.logger.Logger.logLevels[this.logLevel];
                };
                Logger.prototype.info = function (msg) {
                    this.addEntry(3, net.user1.logger.Logger.INFO, msg);
                };
                Logger.prototype.removeSuppressionTerm = function (term) {
                    var termIndex = this.suppressionTerms.indexOf(term);
                    if (termIndex != -1) {
                        this.suppressionTerms.splice(termIndex, 1);
                        this.debug("Removed suppression term. Log messages containing '" + term + "' will now be shown.");
                        return true;
                    }
                    return false;
                };
                Logger.prototype.setLevel = function (level) {
                    if (level != undefined) {
                        for (var i = 0; i < Logger.logLevels.length; i++) {
                            if (Logger.logLevels[i].toLowerCase() == level.toLowerCase()) {
                                this.logLevel = i;
                                this.dispatchEvent(new logger.LogEvent(logger.LogEvent.LEVEL_CHANGE, undefined, level));
                                return;
                            }
                        }
                    }
                    this.warn('Invalid log level specified: ' + level);
                };
                Logger.prototype.toString = function () {
                    return '[object Logger]';
                };
                Logger.prototype.warn = function (msg) {
                    this.addEntry(2, net.user1.logger.Logger.WARN, msg);
                };
                Logger.prototype.addEntry = function (level, levelName, msg) {
                    var timeStamp = '', time;
                    if (this.logLevel < level) {
                        return;
                    }
                    for (var i = this.suppressionTerms.length; --i >= 0;) {
                        if (msg.indexOf(this.suppressionTerms[i]) != -1) {
                            return;
                        }
                    }
                    if (this.timeStampEnabled) {
                        time = new Date();
                        timeStamp = time.getMonth() + 1 + '/' + String(time.getDate()) + '/' + String(time.getFullYear()).substr(2) + ' ' + NumericFormatter.dateToLocalHrMinSecMs(time) + ' UTC' + (time.getTimezoneOffset() >= 0 ? '-' : '+') + Math.abs(time.getTimezoneOffset() / 60);
                    }
                    this.addToHistory(levelName, msg, timeStamp);
                    var e = new logger.LogEvent(logger.LogEvent.UPDATE, msg, levelName, timeStamp);
                    this.dispatchEvent(e);
                };
                Logger.prototype.addToHistory = function (level, msg, timeStamp) {
                    this.messages.push("" + timeStamp + (timeStamp == '' ? '' : ' ') + level + ": " + msg);
                    if (this.messages.length > this.historyLength) {
                        this.messages.shift();
                    }
                };
                Logger.prototype.setHistoryLength = function (newHistoryLength) {
                    this.historyLength = newHistoryLength;
                    if (this.messages.length > this.historyLength) {
                        this.messages.splice(this.historyLength);
                    }
                };
                Logger.DEBUG = 'DEBUG';
                Logger.ERROR = 'ERROR';
                Logger.FATAL = 'FATAL';
                Logger.INFO = 'INFO';
                Logger.WARN = 'WARN';
                Logger.logLevels = [
                    Logger.FATAL, Logger.ERROR, Logger.WARN, Logger.INFO, Logger.DEBUG
                ];
                return Logger;
            }(net.user1.events.EventDispatcher));
            logger.Logger = Logger;
        })(logger = user1.logger || (user1.logger = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var utils;
        (function (utils) {
            var MemoryStore = (function () {
                function MemoryStore() {
                    this.data = {};
                    this.clear();
                }
                MemoryStore.prototype.clear = function () {
                    this.data = {};
                };
                MemoryStore.prototype.read = function (record, field) {
                    var _a, _b, _c;
                    return (_c = (_b = (_a = this.data) === null || _a === void 0 ? void 0 : _a[record]) === null || _b === void 0 ? void 0 : _b[field]) !== null && _c !== void 0 ? _c : null;
                };
                MemoryStore.prototype.remove = function (record, field) {
                    delete this.data[record][field];
                };
                MemoryStore.prototype.write = function (record, field, value) {
                    if (typeof this.data[record] === 'undefined') {
                        this.data[record] = {};
                    }
                    this.data[record][field] = value;
                };
                return MemoryStore;
            }());
            utils.MemoryStore = MemoryStore;
        })(utils = user1.utils || (user1.utils = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var MessageListener = (function () {
                function MessageListener(listener, forRoomIDs, thisArg) {
                    this.listener = listener;
                    this.forRoomIDs = forRoomIDs;
                    this.thisArg = thisArg;
                }
                MessageListener.prototype.getForRoomIDs = function () {
                    var _a;
                    return (_a = this.forRoomIDs) !== null && _a !== void 0 ? _a : null;
                };
                MessageListener.prototype.getListenerFunction = function () {
                    return this.listener;
                };
                MessageListener.prototype.getThisArg = function () {
                    return this.thisArg;
                };
                MessageListener.prototype.toString = function () {
                    return '[object MessageListener]';
                };
                return MessageListener;
            }());
            orbiter.MessageListener = MessageListener;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var MessageManager = (function () {
                function MessageManager(log, connectionManager) {
                    var _a;
                    this.log = log;
                    this.removeListenersOnDisconnect = true;
                    this.messageListeners = {};
                    this.numMessagesReceived = 0;
                    this.numMessagesSent = 0;
                    this.connectionManager = connectionManager;
                    (_a = this.connectionManager) === null || _a === void 0 ? void 0 : _a.addEventListener(orbiter.ConnectionManagerEvent.SELECT_CONNECTION, this.selectConnectionListener, this);
                }
                MessageManager.prototype.addMessageListener = function (message, listener, thisArg, forRoomIDs) {
                    var _a;
                    if (forRoomIDs && !Array.isArray(forRoomIDs))
                        throw new Error("[MESSAGE_MANAGER] Illegal argument type  supplied for addMessageListener()'s forRoomIDs parameter. Value must be an array.");
                    this.messageListeners[message] = (_a = this.messageListeners[message]) !== null && _a !== void 0 ? _a : [];
                    var listenerArray = this.messageListeners[message];
                    if (this.hasMessageListener(message, listener))
                        return false;
                    var newListener = new orbiter.MessageListener(listener, forRoomIDs, thisArg);
                    listenerArray.push(newListener);
                    return true;
                };
                MessageManager.prototype.dispose = function () {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info('[MESSAGE_MANAGER] Disposing resources.');
                    this.log = undefined;
                    this.messageListeners = undefined;
                    this.numMessagesSent = 0;
                    this.numMessagesReceived = 0;
                    this.currentConnection = undefined;
                };
                MessageManager.prototype.getMessageListeners = function (message) {
                    var _a;
                    return (_a = this.messageListeners[message]) !== null && _a !== void 0 ? _a : [];
                };
                MessageManager.prototype.getNumMessagesReceived = function () {
                    return this.numMessagesReceived;
                };
                MessageManager.prototype.getNumMessagesSent = function () {
                    return this.numMessagesSent;
                };
                MessageManager.prototype.getTotalMessages = function () {
                    return this.numMessagesSent + this.numMessagesReceived;
                };
                MessageManager.prototype.hasMessageListener = function (message, listener) {
                    var listenerArray = this.messageListeners[message];
                    if (!listenerArray)
                        return false;
                    for (var i = 0; i < listenerArray.length; i++) {
                        if (listenerArray[i].getListenerFunction() == listener)
                            return true;
                    }
                    return false;
                };
                MessageManager.prototype.notifyMessageListeners = function (message, args) {
                    var _a;
                    var listeners = this.messageListeners[message];
                    if (listeners === undefined) {
                        if (!(message.charAt(0) == 'u' && parseInt(message.substring(1)) > 1)) {
                            (_a = this.log) === null || _a === void 0 ? void 0 : _a.warn("Message delivery failed. No listeners found. Message: " + message + ". Arguments: " + args.join());
                        }
                        return;
                    }
                    else {
                        listeners = listeners.slice(0);
                    }
                    for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                        var listener = listeners_1[_i];
                        listener.getListenerFunction().apply(listener.getThisArg(), args);
                    }
                };
                MessageManager.prototype.removeMessageListener = function (message, listener) {
                    var listenerArray = this.messageListeners[message];
                    if (!listenerArray)
                        return false;
                    var foundListener = false;
                    for (var i = 0; i < listenerArray.length; i++) {
                        if (listenerArray[i].getListenerFunction() == listener) {
                            foundListener = true;
                            listenerArray.splice(i, 1);
                            break;
                        }
                    }
                    if (listenerArray.length == 0)
                        delete this.messageListeners[message];
                    return foundListener;
                };
                MessageManager.prototype.sendUPC = function (message) {
                    var _a, _b, _c, _d, _e;
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (!((_a = this.connectionManager) === null || _a === void 0 ? void 0 : _a.isReady())) {
                        (_b = this.log) === null || _b === void 0 ? void 0 : _b.warn("[MESSAGE_MANAGER] Connection not ready. UPC not sent. Message: " + message);
                        return;
                    }
                    var theUPC = "<U><M>" + message + "</M>";
                    if (args.length > 0) {
                        theUPC += '<L>';
                        for (var _f = 0, args_1 = args; _f < args_1.length; _f++) {
                            var arg = args_1[_f];
                            arg = (_c = arg === null || arg === void 0 ? void 0 : arg.toString()) !== null && _c !== void 0 ? _c : '';
                            if (arg.indexOf('<') != -1) {
                                if (arg.indexOf('<f t=') != 0) {
                                    arg = "<![CDATA[" + arg + "]]>";
                                }
                            }
                            theUPC += "<A>" + arg + "</A>";
                        }
                        theUPC += '</L>';
                    }
                    theUPC += '</U>';
                    this.numMessagesSent++;
                    (_d = this.log) === null || _d === void 0 ? void 0 : _d.debug("[MESSAGE_MANAGER] UPC sent: " + theUPC);
                    (_e = this.connectionManager.getActiveConnection()) === null || _e === void 0 ? void 0 : _e.send(theUPC);
                };
                MessageManager.prototype.sendUPCObject = function (upc) {
                    this.sendUPC.apply(this, __spreadArrays([upc.method], upc.args.slice()));
                };
                MessageManager.prototype.toString = function () {
                    return '[object MessageManager]';
                };
                MessageManager.prototype.cleanupAfterClosedConnection = function (connection) {
                    var _a, _b;
                    connection === null || connection === void 0 ? void 0 : connection.removeEventListener(orbiter.ConnectionEvent.RECEIVE_UPC, this.upcReceivedListener, this);
                    if (this.removeListenersOnDisconnect) {
                        (_a = this.log) === null || _a === void 0 ? void 0 : _a.info('[MESSAGE_MANAGER] Removing registered message listeners.');
                        for (var message in this.messageListeners) {
                            var listenerList = this.messageListeners[message];
                            for (var p in listenerList) {
                                if (listenerList.hasOwnProperty(p))
                                    this.removeMessageListener(message, listenerList[p].getListenerFunction());
                            }
                        }
                    }
                    else {
                        (_b = this.log) === null || _b === void 0 ? void 0 : _b.warn("[MESSAGE_MANAGER] Leaving message listeners registered. Be sure to remove any unwanted message listeners manually.");
                    }
                    this.numMessagesReceived = 0;
                    this.numMessagesSent = 0;
                };
                MessageManager.prototype.connectFailureListener = function (e) {
                    this.cleanupAfterClosedConnection(e.target);
                };
                MessageManager.prototype.disconnectListener = function (e) {
                    this.cleanupAfterClosedConnection(e.target);
                };
                MessageManager.prototype.selectConnectionListener = function (e) {
                    var _a, _b, _c, _d;
                    if (this.currentConnection) {
                        this.currentConnection.removeEventListener(orbiter.ConnectionEvent.RECEIVE_UPC, this.upcReceivedListener, this);
                        this.currentConnection.removeEventListener(orbiter.ConnectionEvent.DISCONNECT, this.disconnectListener, this);
                        this.currentConnection.removeEventListener(orbiter.ConnectionEvent.CONNECT_FAILURE, this.connectFailureListener, this);
                    }
                    this.currentConnection = (_a = e.getConnection()) !== null && _a !== void 0 ? _a : undefined;
                    (_b = this.currentConnection) === null || _b === void 0 ? void 0 : _b.addEventListener(orbiter.ConnectionEvent.RECEIVE_UPC, this.upcReceivedListener, this);
                    (_c = this.currentConnection) === null || _c === void 0 ? void 0 : _c.addEventListener(orbiter.ConnectionEvent.DISCONNECT, this.disconnectListener, this);
                    (_d = this.currentConnection) === null || _d === void 0 ? void 0 : _d.addEventListener(orbiter.ConnectionEvent.CONNECT_FAILURE, this.connectFailureListener, this);
                };
                MessageManager.prototype.upcReceivedListener = function (e) {
                    var _a;
                    this.numMessagesReceived++;
                    var upc = e.getUPC(), upcArgs = [];
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug("[MESSAGE_MANAGER] UPC received: " + upc);
                    if (!upc)
                        return;
                    var closeMTagIndex = upc.indexOf('</M>'), method = upc.substring(6, closeMTagIndex);
                    var searchBeginIndex = upc.indexOf('<A>', closeMTagIndex);
                    while (searchBeginIndex != -1) {
                        var closeATagIndex = upc.indexOf('</A>', searchBeginIndex);
                        var arg = upc.substring(searchBeginIndex + 3, closeATagIndex);
                        if (arg.indexOf('<![CDATA[') == 0) {
                            arg = arg.substr(9, arg.length - 12);
                        }
                        upcArgs.push(arg);
                        searchBeginIndex = upc.indexOf('<A>', closeATagIndex);
                    }
                    this.notifyMessageListeners(method, upcArgs);
                };
                return MessageManager;
            }());
            orbiter.MessageManager = MessageManager;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var Messages;
            (function (Messages) {
                Messages["CLIENT_HEARTBEAT"] = "CLIENT_HEARTBEAT";
            })(Messages = orbiter.Messages || (orbiter.Messages = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ModuleDefinition = (function () {
                function ModuleDefinition(id, type, source) {
                    this.id = id;
                    this.type = type;
                    this.source = source;
                }
                return ModuleDefinition;
            }());
            orbiter.ModuleDefinition = ModuleDefinition;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ModuleType;
            (function (ModuleType) {
                ModuleType["CLASS"] = "class";
                ModuleType["SCRIPT"] = "script";
            })(ModuleType = orbiter.ModuleType || (orbiter.ModuleType = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var NodeListSnapshot = (function (_super) {
                    __extends(NodeListSnapshot, _super);
                    function NodeListSnapshot() {
                        var _this = _super.call(this) || this;
                        _this.method = orbiter.UPC.GET_NODELIST_SNAPSHOT;
                        return _this;
                    }
                    NodeListSnapshot.prototype.setNodeList = function (value) {
                        this.nodeList = value;
                    };
                    NodeListSnapshot.prototype.getNodeList = function () {
                        var _a, _b;
                        return (_b = (_a = this.nodeList) === null || _a === void 0 ? void 0 : _a.slice()) !== null && _b !== void 0 ? _b : null;
                    };
                    return NodeListSnapshot;
                }(snapshot.Snapshot));
                snapshot.NodeListSnapshot = NodeListSnapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var utils;
        (function (utils) {
            var ObjectUtil = (function () {
                function ObjectUtil() {
                }
                ObjectUtil.combine = function () {
                    var objects = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        objects[_i] = arguments[_i];
                    }
                    var source = objects.length == 1 ? objects[0] : objects;
                    var master = {};
                    for (var i = 0; i < source.length; i++) {
                        var object = source[i];
                        for (var key in object) {
                            if (object.hasOwnProperty(key)) {
                                master[key] = object[key];
                            }
                        }
                    }
                    return master;
                };
                ObjectUtil.len = function (object) {
                    var len = 0;
                    for (var p in object) {
                        if (object.hasOwnProperty(p))
                            len++;
                    }
                    return len;
                };
                return ObjectUtil;
            }());
            utils.ObjectUtil = ObjectUtil;
        })(utils = user1.utils || (user1.utils = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var filters;
            (function (filters) {
                var OrGroup = (function (_super) {
                    __extends(OrGroup, _super);
                    function OrGroup() {
                        return _super.call(this, filters.BooleanGroupType.OR) || this;
                    }
                    return OrGroup;
                }(filters.BooleanGroup));
                filters.OrGroup = OrGroup;
            })(filters = orbiter.filters || (orbiter.filters = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var Orbiter = (function (_super) {
                __extends(Orbiter, _super);
                function Orbiter(configURL, traceLogMessages) {
                    if (traceLogMessages === void 0) { traceLogMessages = true; }
                    var _this = _super.call(this) || this;
                    _this.useSecureConnect = false;
                    _this.window = typeof window == 'undefined' ? undefined : window;
                    _this.system = new orbiter.System(_this.window);
                    _this.log = new net.user1.logger.Logger();
                    if (typeof navigator != 'undefined') {
                        _this.log.info("User Agent: " + navigator.userAgent + " " + navigator.platform);
                    }
                    _this.log.info("Union Client Version: " + _this.system.getClientType() + " " + _this.system.getClientVersion().toStringVerbose());
                    _this.log.info("Client UPC Protocol Version: " + _this.system.getUPCVersion().toString());
                    _this.consoleLogger = undefined;
                    _this.connectionMan = new orbiter.ConnectionManager(_this);
                    _this.roomMan = new orbiter.RoomManager(_this);
                    _this.messageMan = new orbiter.MessageManager(_this.log, _this.connectionMan);
                    _this.server = new orbiter.Server(_this);
                    _this.accountMan = new orbiter.AccountManager(_this.log);
                    _this.clientMan = new orbiter.ClientManager(_this.roomMan, _this.accountMan, _this.connectionMan, _this.messageMan, _this.server, _this.log);
                    _this.accountMan.setClientManager(_this.clientMan);
                    _this.accountMan.setMessageManager(_this.messageMan);
                    _this.accountMan.setRoomManager(_this.roomMan);
                    _this.snapshotMan = new orbiter.SnapshotManager(_this.messageMan);
                    _this.coreMsgListener = new orbiter.CoreMessageListener(_this);
                    _this.coreEventLogger = new orbiter.CoreEventLogger(_this.log, _this.connectionMan, _this.roomMan, _this.accountMan, _this.server, _this.clientMan, _this);
                    _this.connectionMan.addEventListener(orbiter.ConnectionManagerEvent.READY, _this.readyListener, _this);
                    _this.connectionMan.addEventListener(orbiter.ConnectionManagerEvent.CONNECT_FAILURE, _this.connectFailureListener, _this);
                    _this.connectionMan.addEventListener(orbiter.ConnectionManagerEvent.DISCONNECT, _this.disconnectListener, _this);
                    _this.connectionMonitor = new orbiter.ConnectionMonitor(_this);
                    _this.connectionMonitor.restoreDefaults();
                    _this.connectionMan.addEventListener(orbiter.ConnectionManagerEvent.SELECT_CONNECTION, _this.selectConnectionListener, _this);
                    _this.httpFailoverEnabled = true;
                    if (traceLogMessages) {
                        _this.enableConsole();
                    }
                    if (configURL == null || configURL == '') {
                        _this.log.info('[ORBITER] Initialization complete.');
                    }
                    else {
                        _this.loadConfig(configURL);
                    }
                    return _this;
                }
                Orbiter.prototype.buildConnection = function (host, port, type, sendDelay) {
                    var connection;
                    switch (type) {
                        case orbiter.ConnectionType.HTTP:
                            if (this.system.hasHTTPDirectConnection()) {
                                connection = new orbiter.HTTPDirectConnection();
                            }
                            else {
                                connection = new orbiter.HTTPIFrameConnection();
                            }
                            break;
                        case orbiter.ConnectionType.SECURE_HTTP:
                            if (this.system.hasHTTPDirectConnection()) {
                                connection = new orbiter.SecureHTTPDirectConnection();
                            }
                            else {
                                connection = new orbiter.SecureHTTPIFrameConnection();
                            }
                            break;
                        case orbiter.ConnectionType.WEBSOCKET:
                            connection = new orbiter.WebSocketConnection();
                            break;
                        case orbiter.ConnectionType.SECURE_WEBSOCKET:
                            connection = new orbiter.SecureWebSocketConnection();
                            break;
                        default:
                            throw new Error("[ORBITER] Error at buildConnection(). Invalid type specified: [" + type + "]");
                    }
                    try {
                        connection.setServer(host, port);
                    }
                    catch (e) {
                        this.log.error("[CONNECTION] " + connection.toString() + " " + e);
                    }
                    finally {
                        this.connectionMan.addConnection(connection);
                        if (connection instanceof orbiter.HTTPConnection) {
                            if (sendDelay != null) {
                                connection.setSendDelay(sendDelay);
                            }
                        }
                    }
                };
                Orbiter.prototype.configErrorListener = function (e) {
                    this.log.fatal('[ORBITER] Configuration file could not be loaded.');
                };
                Orbiter.prototype.configLoadCompleteListener = function (request) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                    var config = request.responseXML;
                    if ((request.status != 200 && request.status != 0) || config == null) {
                        this.log.error('[ORBITER] Configuration file failed to load.');
                        return;
                    }
                    this.log.error('[ORBITER] Configuration file loaded.');
                    try {
                        var loglevel = this.getTextForNode(config, 'logLevel');
                        if (loglevel != null) {
                            this.log.setLevel(loglevel);
                        }
                        var autoreconnectfrequencyNodes = config.getElementsByTagName('autoreconnectfrequency');
                        var autoreconnectfrequencyNode = null;
                        if (autoreconnectfrequencyNodes.length == 1) {
                            autoreconnectfrequencyNode = autoreconnectfrequencyNodes[0];
                            var nodetext = this.getTextForNode(config, 'autoreconnectfrequency');
                            if (nodetext != null && !isNaN(parseInt(nodetext))) {
                                this.connectionMonitor.setAutoReconnectFrequency(parseInt(nodetext), parseInt(nodetext), (_b = (((_a = autoreconnectfrequencyNode.getAttribute('delayfirstattempt')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) == 'true')) !== null && _b !== void 0 ? _b : false);
                            }
                            else {
                                this.connectionMonitor.setAutoReconnectFrequency(parseInt((_c = autoreconnectfrequencyNode.getAttribute('minms')) !== null && _c !== void 0 ? _c : '1000'), parseInt((_d = autoreconnectfrequencyNode.getAttribute('maxms')) !== null && _d !== void 0 ? _d : '100000'), autoreconnectfrequencyNode.getAttribute('delayfirstattempt') == null ? false : ((_e = autoreconnectfrequencyNode.getAttribute('delayfirstattempt')) === null || _e === void 0 ? void 0 : _e.toLowerCase()) == 'true');
                            }
                            this.connectionMonitor.setAutoReconnectAttemptLimit(parseInt((_f = autoreconnectfrequencyNode.getAttribute('maxattempts')) !== null && _f !== void 0 ? _f : '100'));
                        }
                        var connectiontimeout = this.getTextForNode(config, 'connectionTimeout');
                        if (connectiontimeout != null) {
                            this.connectionMonitor.setConnectionTimeout(parseInt(connectiontimeout));
                        }
                        var heartbeatfrequency = this.getTextForNode(config, 'heartbeatFrequency');
                        if (heartbeatfrequency != null) {
                            this.connectionMonitor.setHeartbeatFrequency(parseInt(heartbeatfrequency));
                        }
                        var readytimeout = this.getTextForNode(config, 'readyTimeout');
                        if (readytimeout != null) {
                            this.connectionMan.setReadyTimeout(parseInt(readytimeout));
                        }
                        var connections = config.getElementsByTagName('connection');
                        if (connections.length == 0) {
                            this.log.error('[ORBITER] No connections specified in Orbiter configuration file.');
                            return;
                        }
                        for (var i = 0; i < connections.length; i++) {
                            var connection = connections[i], host = (_g = connection.getAttribute('host')) !== null && _g !== void 0 ? _g : '', port = parseInt((_h = connection.getAttribute('port')) !== null && _h !== void 0 ? _h : ''), type = (_k = (_j = connection.getAttribute('type')) === null || _j === void 0 ? void 0 : _j.toUpperCase()) !== null && _k !== void 0 ? _k : '', secure = (_l = connection.getAttribute('secure')) !== null && _l !== void 0 ? _l : '', sendDelay = parseInt((_m = connection.getAttribute('senddelay')) !== null && _m !== void 0 ? _m : '');
                            switch (type) {
                                case null:
                                    if (secure === 'true') {
                                        this.buildConnection(host, port, orbiter.ConnectionType.SECURE_WEBSOCKET, -1);
                                        this.buildConnection(host, port, orbiter.ConnectionType.SECURE_HTTP, sendDelay);
                                    }
                                    else {
                                        this.buildConnection(host, port, orbiter.ConnectionType.WEBSOCKET, -1);
                                        this.buildConnection(host, port, orbiter.ConnectionType.HTTP, sendDelay);
                                    }
                                    break;
                                case orbiter.ConnectionType.WEBSOCKET:
                                    if (secure === 'true') {
                                        this.buildConnection(host, port, orbiter.ConnectionType.SECURE_WEBSOCKET, -1);
                                    }
                                    else {
                                        this.buildConnection(host, port, orbiter.ConnectionType.WEBSOCKET, -1);
                                    }
                                    break;
                                case orbiter.ConnectionType.HTTP:
                                    if (secure === 'true') {
                                        this.buildConnection(host, port, orbiter.ConnectionType.SECURE_HTTP, sendDelay);
                                    }
                                    else {
                                        this.buildConnection(host, port, orbiter.ConnectionType.HTTP, sendDelay);
                                    }
                                    break;
                                default:
                                    this.log.error("[ORBITER] Unrecognized connection type in Orbiter configuration file: [" + type + "]. Connection ignored.");
                            }
                        }
                    }
                    catch (error) {
                        this.log.error("[ORBITER] Error parsing connection in Orbiter configuration file: " + request.responseText + " " + error.toString());
                    }
                    this.connect();
                };
                Orbiter.prototype.connect = function (host) {
                    var ports = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        ports[_i - 1] = arguments[_i];
                    }
                    this.useSecureConnect = false;
                    this.doConnect.apply(this, __spreadArrays([host], ports));
                };
                Orbiter.prototype.connectFailureListener = function (e) {
                    this.fireClose();
                };
                Orbiter.prototype.disableConsole = function () {
                    if (this.consoleLogger) {
                        this.consoleLogger.dispose();
                        this.consoleLogger = undefined;
                    }
                };
                Orbiter.prototype.disableHTTPFailover = function () {
                    this.httpFailoverEnabled = false;
                };
                Orbiter.prototype.disableStatistics = function () {
                    if (this.statistics != null) {
                        this.statistics.stop();
                    }
                };
                Orbiter.prototype.disconnect = function () {
                    this.connectionMan.disconnect();
                };
                Orbiter.prototype.disconnectListener = function (e) {
                    this.accountMan.cleanup();
                    this.roomMan.cleanup();
                    this.clientMan.cleanup();
                    this.server.cleanup();
                    this.fireClose();
                };
                ;
                Orbiter.prototype.dispatchConnectRefused = function (refusal) {
                    this.dispatchEvent(new orbiter.OrbiterEvent(orbiter.OrbiterEvent.CONNECT_REFUSED, undefined, refusal));
                };
                Orbiter.prototype.dispose = function () {
                    var _a;
                    this.log.info('[ORBITER] Beginning disposal of all resources...');
                    this.connectionMan.dispose();
                    this.roomMan.dispose();
                    this.connectionMonitor.dispose();
                    this.clientMan.dispose();
                    this.messageMan.dispose();
                    (_a = this.statistics) === null || _a === void 0 ? void 0 : _a.stop();
                    this.log.info('[ORBITER] Disposal complete.');
                };
                Orbiter.prototype.doConnect = function (host) {
                    var ports = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        ports[_i - 1] = arguments[_i];
                    }
                    if (host) {
                        var args = __spreadArrays([host], ports);
                        this.setServer.apply(this, args);
                    }
                    this.log.info('[ORBITER] Connecting to Union...');
                    this.connectionMan.connect();
                };
                Orbiter.prototype.enableConsole = function () {
                    if (!this.consoleLogger) {
                        this.consoleLogger = new net.user1.logger.ConsoleLogger(this.log);
                    }
                };
                Orbiter.prototype.enableHTTPFailover = function () {
                    this.httpFailoverEnabled = true;
                };
                Orbiter.prototype.enableStatistics = function () {
                    if (!this.statistics) {
                        this.statistics = new orbiter.Statistics(this);
                    }
                };
                Orbiter.prototype.fireClose = function () {
                    this.dispatchEvent(new orbiter.OrbiterEvent(orbiter.OrbiterEvent.CLOSE));
                };
                Orbiter.prototype.fireProtocolIncompatible = function (serverUPCVersion) {
                    this.dispatchEvent(new orbiter.OrbiterEvent(orbiter.OrbiterEvent.PROTOCOL_INCOMPATIBLE, serverUPCVersion));
                };
                Orbiter.prototype.fireReady = function () {
                    this.dispatchEvent(new orbiter.OrbiterEvent(orbiter.OrbiterEvent.READY));
                };
                Orbiter.prototype.getAccountManager = function () {
                    return this.accountMan;
                };
                Orbiter.prototype.getClientID = function () {
                    var _a, _b;
                    return (_b = (_a = this.self()) === null || _a === void 0 ? void 0 : _a.getClientID()) !== null && _b !== void 0 ? _b : '';
                };
                Orbiter.prototype.getClientManager = function () {
                    return this.clientMan;
                };
                Orbiter.prototype.getConnectionManager = function () {
                    return this.connectionMan;
                };
                Orbiter.prototype.getConnectionMonitor = function () {
                    return this.connectionMonitor;
                };
                Orbiter.prototype.getCoreMessageListener = function () {
                    return this.coreMsgListener;
                };
                Orbiter.prototype.getLog = function () {
                    return this.log;
                };
                Orbiter.prototype.getMessageManager = function () {
                    return this.messageMan;
                };
                Orbiter.prototype.getRoomManager = function () {
                    return this.roomMan;
                };
                Orbiter.prototype.getServer = function () {
                    return this.server;
                };
                Orbiter.prototype.getSessionID = function () {
                    return this.sessionID == null ? '' : this.sessionID;
                };
                Orbiter.prototype.getSnapshotManager = function () {
                    return this.snapshotMan;
                };
                Orbiter.prototype.getStatistics = function () {
                    var _a;
                    return (_a = this.statistics) !== null && _a !== void 0 ? _a : null;
                };
                Orbiter.prototype.getSystem = function () {
                    return this.system;
                };
                Orbiter.prototype.getTextForNode = function (tree, tagname) {
                    var nodes = tree.getElementsByTagName(tagname);
                    var node;
                    if (nodes.length > 0) {
                        node = nodes[0];
                    }
                    if (node != null && node.firstChild != null && node.firstChild.nodeValue != null &&
                        node.firstChild.nodeType == 3 && node.firstChild.nodeValue.length > 0) {
                        return node.firstChild.nodeValue;
                    }
                    else {
                        return null;
                    }
                };
                Orbiter.prototype.isHTTPFailoverEnabled = function () {
                    return this.httpFailoverEnabled;
                };
                Orbiter.prototype.isReady = function () {
                    return this.connectionMan.isReady();
                };
                Orbiter.prototype.loadConfig = function (configURL) {
                    var _this = this;
                    this.log.info("[ORBITER] Loading config from " + configURL + ".");
                    var request = new XMLHttpRequest();
                    request.onerror = function () { return _this.configErrorListener(); };
                    request.onreadystatechange = function (state) {
                        if (request.readyState == 4) {
                            _this.configLoadCompleteListener(request);
                        }
                    };
                    request.open('GET', configURL);
                    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
                    request.send(null);
                };
                Orbiter.prototype.readyListener = function (e) {
                    this.fireReady();
                };
                Orbiter.prototype.secureConnect = function (host) {
                    var ports = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        ports[_i - 1] = arguments[_i];
                    }
                    this.useSecureConnect = true;
                    var args = __spreadArrays([host], ports);
                    this.doConnect.apply(this, args);
                };
                Orbiter.prototype.selectConnectionListener = function (e) {
                    this.messageMan.addMessageListener(orbiter.UPC.SERVER_HELLO, this.u66, this);
                    this.messageMan.addMessageListener(orbiter.UPC.CONNECTION_REFUSED, this.u164, this);
                };
                Orbiter.prototype.self = function () {
                    var _a;
                    if (this.clientMan == null || !this.isReady()) {
                        return null;
                    }
                    else {
                        var customGlobalClient = (_a = this.clientMan.self()) === null || _a === void 0 ? void 0 : _a.getCustomClient();
                        if (customGlobalClient) {
                            return customGlobalClient !== null && customGlobalClient !== void 0 ? customGlobalClient : null;
                        }
                        else {
                            return this.clientMan.self();
                        }
                    }
                };
                Orbiter.prototype.setServer = function (host) {
                    var ports = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        ports[_i - 1] = arguments[_i];
                    }
                    if (host != null && ports.length > 0) {
                        if (this.connectionMan.getConnections().length > 0) {
                            this.connectionMan.removeAllConnections();
                        }
                        var connectionType = void 0;
                        if (this.system.hasWebSocket()) {
                            for (var i = 1; i < arguments.length; i++) {
                                connectionType = this.useSecureConnect ? orbiter.ConnectionType.SECURE_WEBSOCKET :
                                    orbiter.ConnectionType.WEBSOCKET;
                                this.buildConnection(host, arguments[i], connectionType, -1);
                            }
                        }
                        else {
                            this.log.info('[ORBITER] WebSocket not found in host environment.Trying HTTP.');
                        }
                        if (this.isHTTPFailoverEnabled() || !this.system.hasWebSocket()) {
                            for (var i = 1; i < arguments.length; i++) {
                                connectionType = this.useSecureConnect ? orbiter.ConnectionType.SECURE_HTTP :
                                    orbiter.ConnectionType.HTTP;
                                this.buildConnection(host, arguments[i], connectionType, orbiter.HTTPConnection.DEFAULT_SEND_DELAY);
                            }
                        }
                    }
                    else {
                        this.log.error("[ORBITER] setServer() failed. Invalid host [" + host + "] or port [" + ports.join(',') + "].");
                    }
                };
                Orbiter.prototype.setSessionID = function (id) {
                    this.sessionID = id;
                };
                Orbiter.prototype.u164 = function (reason, description) {
                    this.connectionMonitor.setAutoReconnectFrequency(-1);
                    this.dispatchConnectRefused(new orbiter.ConnectionRefusal(reason, description));
                };
                Orbiter.prototype.u66 = function (serverVersion, sessionID, serverUPCVersionString, protocolCompatible, affinityAddress, affinityDuration) {
                    if (affinityAddress === void 0) { affinityAddress = ""; }
                    if (affinityDuration === void 0) { affinityDuration = ""; }
                    var serverUPCVersion = new orbiter.VersionNumber();
                    serverUPCVersion.fromVersionString(serverUPCVersionString);
                    if (protocolCompatible == 'false') {
                        this.fireProtocolIncompatible(serverUPCVersion);
                    }
                };
                Orbiter.prototype.updateSnapshot = function (snapshot) {
                    this.snapshotMan.updateSnapshot(snapshot);
                };
                return Orbiter;
            }(net.user1.events.EventDispatcher));
            orbiter.Orbiter = Orbiter;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var OrbiterEvent = (function (_super) {
                __extends(OrbiterEvent, _super);
                function OrbiterEvent(type, serverUPCVersion, connectionRefusal) {
                    var _this = _super.call(this, type) || this;
                    _this.serverUPCVersion = serverUPCVersion;
                    _this.connectionRefusal = connectionRefusal;
                    return _this;
                }
                OrbiterEvent.prototype.getConnectionRefusal = function () {
                    var _a;
                    return (_a = this.connectionRefusal) !== null && _a !== void 0 ? _a : null;
                };
                OrbiterEvent.prototype.getServerUPCVersion = function () {
                    var _a;
                    return (_a = this.serverUPCVersion) !== null && _a !== void 0 ? _a : null;
                };
                OrbiterEvent.prototype.toString = function () {
                    return '[object OrbiterEvent]';
                };
                OrbiterEvent.CLOSE = 'CLOSE';
                OrbiterEvent.CONNECT_REFUSED = 'CONNECT_REFUSED';
                OrbiterEvent.PROTOCOL_INCOMPATIBLE = 'PROTOCOL_INCOMPATIBLE';
                OrbiterEvent.READY = 'READY';
                return OrbiterEvent;
            }(net.user1.events.Event));
            orbiter.OrbiterEvent = OrbiterEvent;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var VersionNumber = (function () {
                function VersionNumber(major, minor, revision, build) {
                    if (build === void 0) { build = -1; }
                    this.major = major;
                    this.minor = minor;
                    this.revision = revision;
                    this.build = build;
                }
                VersionNumber.prototype.fromVersionString = function (value) {
                    var _a, _b;
                    _a = value.split('.').map(function (v) { return parseInt(v); }), this.major = _a[0], this.minor = _a[1], this.revision = _a[2], _b = _a[3], this.build = _b === void 0 ? -1 : _b;
                };
                VersionNumber.prototype.toString = function () {
                    return this.major + "." + this.minor + "." + this.revision + ((this.build == -1) ? '' : '.' + this.build);
                };
                VersionNumber.prototype.toStringVerbose = function () {
                    return this.major + "." + this.minor + "." + this.revision + ((this.build == -1) ? '' : ' (Build ' + this.build + ')');
                };
                return VersionNumber;
            }());
            orbiter.VersionNumber = VersionNumber;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var Product = (function () {
                function Product() {
                }
                Product.clientType = 'Orbiter';
                Product.clientVersion = new orbiter.VersionNumber(3, 0, 0, 1);
                Product.upcVersion = new orbiter.VersionNumber(1, 10, 3);
                return Product;
            }());
            orbiter.Product = Product;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ReceiveMessageBroadcastType;
            (function (ReceiveMessageBroadcastType) {
                ReceiveMessageBroadcastType["TO_SERVER"] = "0";
                ReceiveMessageBroadcastType["TO_ROOMS"] = "1";
                ReceiveMessageBroadcastType["TO_CLIENTS"] = "2";
            })(ReceiveMessageBroadcastType = orbiter.ReceiveMessageBroadcastType || (orbiter.ReceiveMessageBroadcastType = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var UPC = (function () {
                function UPC() {
                    this.args = [];
                    this.method = '';
                }
                UPC.ACCOUNT_ADDED = 'u111';
                UPC.ACCOUNT_LIST_UPDATE = 'u127';
                UPC.ACCOUNT_OBSERVED = 'u124';
                UPC.ACCOUNT_PASSWORD_CHANGED = 'u90';
                UPC.ACCOUNT_REMOVED = 'u112';
                UPC.ADD_ROLE = 'u133';
                UPC.ADD_ROLE_RESULT = 'u134';
                UPC.BAN = 'u137';
                UPC.BANNED_ADDRESS_ADDED = 'u147';
                UPC.BANNED_ADDRESS_REMOVED = 'u148';
                UPC.BANNED_LIST_SNAPSHOT = 'u142';
                UPC.BAN_RESULT = 'u138';
                UPC.CHANGE_ACCOUNT_PASSWORD = 'u13';
                UPC.CHANGE_ACCOUNT_PASSWORD_RESULT = 'u46';
                UPC.CLEAR_MODULE_CACHE = 'u153';
                UPC.CLIENTCOUNT_SNAPSHOT = 'u34';
                UPC.CLIENTLIST_SNAPSHOT = 'u101';
                UPC.CLIENT_ADDED_TO_ROOM = 'u36';
                UPC.CLIENT_ADDED_TO_SERVER = 'u102';
                UPC.CLIENT_ATTR_REMOVED = 'u81';
                UPC.CLIENT_ATTR_UPDATE = 'u8';
                UPC.CLIENT_HELLO = 'u65';
                UPC.CLIENT_METADATA = 'u29';
                UPC.CLIENT_OBSERVED = 'u119';
                UPC.CLIENT_OBSERVED_ROOM = 'u129';
                UPC.CLIENT_READY = 'u63';
                UPC.CLIENT_REMOVED_FROM_ROOM = 'u37';
                UPC.CLIENT_REMOVED_FROM_SERVER = 'u103';
                UPC.CLIENT_SNAPSHOT = 'u104';
                UPC.CLIENT_STOPPED_OBSERVING_ROOM = 'u130';
                UPC.CONNECTION_REFUSED = 'u164';
                UPC.CREATE_ACCOUNT = 'u11';
                UPC.CREATE_ACCOUNT_RESULT = 'u47';
                UPC.CREATE_ROOM = 'u24';
                UPC.CREATE_ROOM_RESULT = 'u32';
                UPC.GATEWAYS_SNAPSHOT = 'u168';
                UPC.GET_ACCOUNTLIST_SNAPSHOT = 'u97';
                UPC.GET_ACCOUNT_SNAPSHOT = 'u100';
                UPC.GET_ACCOUNT_SNAPSHOT_RESULT = 'u116';
                UPC.GET_BANNED_LIST_SNAPSHOT = 'u141';
                UPC.GET_CLIENTCOUNT_SNAPSHOT = 'u18';
                UPC.GET_CLIENTCOUNT_SNAPSHOT_RESULT = 'u75';
                UPC.GET_CLIENTLIST_SNAPSHOT = 'u91';
                UPC.GET_CLIENT_SNAPSHOT = 'u94';
                UPC.GET_CLIENT_SNAPSHOT_RESULT = 'u115';
                UPC.GET_GATEWAYS_SNAPSHOT = 'u167';
                UPC.GET_NODELIST_SNAPSHOT = 'u165';
                UPC.GET_ROOMLIST_SNAPSHOT = 'u21';
                UPC.GET_ROOM_SNAPSHOT = 'u55';
                UPC.GET_ROOM_SNAPSHOT_RESULT = 'u60';
                UPC.GET_SERVERMODULELIST_SNAPSHOT = 'u151';
                UPC.GET_UPC_STATS_SNAPSHOT = 'u154';
                UPC.GET_UPC_STATS_SNAPSHOT_RESULT = 'u155';
                UPC.JOINED_ROOM = 'u6';
                UPC.JOINED_ROOM_ADDED_TO_CLIENT = 'u113';
                UPC.JOINED_ROOM_REMOVED_FROM_CLIENT = 'u114';
                UPC.JOIN_ROOM = 'u4';
                UPC.JOIN_ROOM_RESULT = 'u72';
                UPC.KICK_CLIENT = 'u149';
                UPC.KICK_CLIENT_RESULT = 'u150';
                UPC.LEAVE_ROOM = 'u10';
                UPC.LEAVE_ROOM_RESULT = 'u76';
                UPC.LEFT_ROOM = 'u44';
                UPC.LOGGED_IN = 'u88';
                UPC.LOGGED_OFF = 'u89';
                UPC.LOGIN = 'u14';
                UPC.LOGIN_RESULT = 'u49';
                UPC.LOGOFF = 'u86';
                UPC.LOGOFF_RESULT = 'u87';
                UPC.NODELIST_SNAPSHOT = 'u166';
                UPC.OBSERVED_ROOM = 'u59';
                UPC.OBSERVED_ROOM_ADDED_TO_CLIENT = 'u117';
                UPC.OBSERVED_ROOM_REMOVED_FROM_CLIENT = 'u118';
                UPC.OBSERVE_ACCOUNT = 'u121';
                UPC.OBSERVE_ACCOUNT_RESULT = 'u123';
                UPC.OBSERVE_CLIENT = 'u95';
                UPC.OBSERVE_CLIENT_RESULT = 'u105';
                UPC.OBSERVE_ROOM = 'u58';
                UPC.OBSERVE_ROOM_RESULT = 'u77';
                UPC.PROCESSED_UPC_ADDED = 'u161';
                UPC.RECEIVE_MESSAGE = 'u7';
                UPC.REMOVE_ACCOUNT = 'u12';
                UPC.REMOVE_ACCOUNT_RESULT = 'u48';
                UPC.REMOVE_CLIENT_ATTR = 'u69';
                UPC.REMOVE_CLIENT_ATTR_RESULT = 'u82';
                UPC.REMOVE_ROLE = 'u135';
                UPC.REMOVE_ROLE_RESULT = 'u136';
                UPC.REMOVE_ROOM = 'u25';
                UPC.REMOVE_ROOM_ATTR = 'u67';
                UPC.REMOVE_ROOM_ATTR_RESULT = 'u80';
                UPC.REMOVE_ROOM_RESULT = 'u33';
                UPC.RESET_UPC_STATS = 'u157';
                UPC.RESET_UPC_STATS_RESULT = 'u158';
                UPC.ROOMLIST_SNAPSHOT = 'u38';
                UPC.ROOM_ADDED = 'u39';
                UPC.ROOM_ATTR_REMOVED = 'u79';
                UPC.ROOM_ATTR_UPDATE = 'u9';
                UPC.ROOM_OBSERVERCOUNT_UPDATE = 'u132';
                UPC.ROOM_OCCUPANTCOUNT_UPDATE = 'u131';
                UPC.ROOM_REMOVED = 'u40';
                UPC.ROOM_SNAPSHOT = 'u54';
                UPC.SEND_MESSAGE_TO_CLIENTS = 'u2';
                UPC.SEND_MESSAGE_TO_ROOMS = 'u1';
                UPC.SEND_MESSAGE_TO_SERVER = 'u57';
                UPC.SEND_ROOMMODULE_MESSAGE = 'u70';
                UPC.SEND_SERVERMODULE_MESSAGE = 'u71';
                UPC.SERVERMODULELIST_SNAPSHOT = 'u152';
                UPC.SERVER_HELLO = 'u66';
                UPC.SERVER_TIME_UPDATE = 'u50';
                UPC.SESSION_NOT_FOUND = 'u85';
                UPC.SESSION_TERMINATED = 'u84';
                UPC.SET_CLIENT_ATTR = 'u3';
                UPC.SET_CLIENT_ATTR_RESULT = 'u73';
                UPC.SET_ROOM_ATTR = 'u5';
                UPC.SET_ROOM_ATTR_RESULT = 'u74';
                UPC.SET_ROOM_UPDATE_LEVELS = 'u64';
                UPC.STOPPED_OBSERVING_ACCOUNT = 'u126';
                UPC.STOPPED_OBSERVING_CLIENT = 'u120';
                UPC.STOPPED_OBSERVING_ROOM = 'u62';
                UPC.STOP_OBSERVING_ACCOUNT = 'u122';
                UPC.STOP_OBSERVING_ACCOUNT_RESULT = 'u125';
                UPC.STOP_OBSERVING_CLIENT = 'u96';
                UPC.STOP_OBSERVING_CLIENT_RESULT = 'u106';
                UPC.STOP_OBSERVING_ROOM = 'u61';
                UPC.STOP_OBSERVING_ROOM_RESULT = 'u78';
                UPC.STOP_WATCHING_FOR_ACCOUNTS = 'u99';
                UPC.STOP_WATCHING_FOR_ACCOUNTS_RESULT = 'u110';
                UPC.STOP_WATCHING_FOR_BANNED_ADDRESSES = 'u145';
                UPC.STOP_WATCHING_FOR_BANNED_ADDRESSES_RESULT = 'u146';
                UPC.STOP_WATCHING_FOR_CLIENTS = 'u93';
                UPC.STOP_WATCHING_FOR_CLIENTS_RESULT = 'u108';
                UPC.STOP_WATCHING_FOR_PROCESSED_UPCS = 'u162';
                UPC.STOP_WATCHING_FOR_PROCESSED_UPCS_RESULT = 'u163';
                UPC.STOP_WATCHING_FOR_ROOMS = 'u27';
                UPC.STOP_WATCHING_FOR_ROOMS_RESULT = 'u43';
                UPC.SYNC_TIME = 'u19';
                UPC.TERMINATE_SESSION = 'u83';
                UPC.UNBAN = 'u139';
                UPC.UNBAN_RESULT = 'u140';
                UPC.UPC_STATS_SNAPSHOT = 'u156';
                UPC.UPDATE_LEVELS_UPDATE = 'u128';
                UPC.WATCH_FOR_ACCOUNTS = 'u98';
                UPC.WATCH_FOR_ACCOUNTS_RESULT = 'u109';
                UPC.WATCH_FOR_BANNED_ADDRESSES = 'u143';
                UPC.WATCH_FOR_BANNED_ADDRESSES_RESULT = 'u144';
                UPC.WATCH_FOR_CLIENTS = 'u92';
                UPC.WATCH_FOR_CLIENTS_RESULT = 'u107';
                UPC.WATCH_FOR_PROCESSED_UPCS = 'u159';
                UPC.WATCH_FOR_PROCESSED_UPCS_RESULT = 'u160';
                UPC.WATCH_FOR_ROOMS = 'u26';
                UPC.WATCH_FOR_ROOMS_RESULT = 'u42';
                return UPC;
            }());
            orbiter.UPC = UPC;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var upc;
            (function (upc) {
                var RemoveClientAttr = (function (_super) {
                    __extends(RemoveClientAttr, _super);
                    function RemoveClientAttr(clientID, userID, name, scope) {
                        var _this = _super.call(this) || this;
                        if (!orbiter.Validator.isValidAttributeName(name)) {
                            throw new Error("Cannot delete attribute. Illegal name (see Validator.isValidAttributeName()): " + name);
                        }
                        if (!orbiter.Validator.isValidAttributeScope(scope)) {
                            throw new Error("Cannot delete client attribute. Illegal scope (see Validator.isValidAttributeScope()): " + scope);
                        }
                        _this.method = orbiter.UPC.REMOVE_CLIENT_ATTR;
                        _this.args = [clientID, userID, name, scope];
                        return _this;
                    }
                    return RemoveClientAttr;
                }(orbiter.UPC));
                upc.RemoveClientAttr = RemoveClientAttr;
            })(upc = orbiter.upc || (orbiter.upc = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var upc;
            (function (upc) {
                var RemoveRoomAttr = (function () {
                    function RemoveRoomAttr(roomID, name) {
                        if (!orbiter.Validator.isValidAttributeName(name)) {
                            throw new Error("Cannot delete attribute. Illegal name (see Validator.isValidAttributeName()): " + name);
                        }
                        this.method = orbiter.UPC.REMOVE_ROOM_ATTR;
                        this.args = [roomID, name];
                    }
                    return RemoveRoomAttr;
                }());
                upc.RemoveRoomAttr = RemoveRoomAttr;
            })(upc = orbiter.upc || (orbiter.upc = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var Room = (function (_super) {
                __extends(Room, _super);
                function Room(id, roomManager, messageManager, clientManager, accountManager, log) {
                    var _this = _super.call(this) || this;
                    _this.roomManager = roomManager;
                    _this.messageManager = messageManager;
                    _this.clientManager = clientManager;
                    _this.accountManager = accountManager;
                    _this.log = log;
                    _this.disposed = false;
                    _this._clientIsInRoom = false;
                    _this._clientIsObservingRoom = false;
                    _this.numObservers = 0;
                    _this.numOccupants = 0;
                    _this.setRoomID(id);
                    _this.occupantList = new orbiter.ClientSet();
                    _this.observerList = new orbiter.ClientSet();
                    _this.attributeManager = new orbiter.AttributeManager(_this, _this.messageManager, _this.log);
                    _this.setSyncState(orbiter.SynchronizationState.NOT_SYNCHRONIZED);
                    return _this;
                }
                Room.prototype.addMessageListener = function (message, listener, thisArg) {
                    this.messageManager.addMessageListener(message, listener, thisArg, [this.getRoomID()]);
                };
                Room.prototype.addObserver = function (client) {
                    var _a;
                    if (this.observerList.contains(client)) {
                        (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " ignored addObserver() request. Observer list already contains client:" + client + ".");
                        return;
                    }
                    this.observerList.add(client);
                    this.setNumObservers(this.observerList.length());
                    if (!this.occupantList.contains(client)) {
                        this.addClientAttributeListeners(client);
                    }
                    this.fireAddObserver(client.getClientID());
                };
                Room.prototype.addOccupant = function (client) {
                    var _a;
                    if (this.occupantList.contains(client)) {
                        (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " ignored addOccupant() request. Occupant list already contains client:" + client + ".");
                        return;
                    }
                    this.occupantList.add(client);
                    this.setNumOccupants(this.occupantList.length());
                    if (!this.observerList.contains(client)) {
                        this.addClientAttributeListeners(client);
                    }
                    this.fireAddOccupant(client.getClientID());
                };
                Room.prototype.clientIsInRoom = function (clientID) {
                    if (this.disposed)
                        return false;
                    if (clientID == null) {
                        return this._clientIsInRoom;
                    }
                    return this.occupantList.containsClientID(clientID);
                };
                Room.prototype.clientIsObservingRoom = function (clientID) {
                    if (this.disposed)
                        return false;
                    if (clientID == null) {
                        return this._clientIsObservingRoom;
                    }
                    return this.observerList.containsClientID(clientID);
                };
                Room.prototype.deleteAttribute = function (attrName) {
                    if (this.disposed)
                        return;
                    var deleteRequest = new orbiter.upc.RemoveRoomAttr(this.getRoomID(), attrName);
                    this.attributeManager.deleteAttribute(deleteRequest);
                };
                Room.prototype.dispose = function () {
                    this.log = null;
                    this.syncState = null;
                    this.occupantList = null;
                    this.observerList = null;
                    this.attributeManager = null;
                    this.numOccupants = 0;
                    this.defaultClientClass = null;
                    this.messageManager = null;
                    this.roomManager = null;
                    this.disposed = true;
                };
                Room.prototype.doJoin = function () {
                    this._clientIsInRoom = true;
                    this.fireJoin();
                };
                Room.prototype.doJoinResult = function (status) {
                    this.fireJoinResult(status);
                };
                Room.prototype.doLeave = function () {
                    if (!this.clientIsObservingRoom()) {
                        this.purgeRoomData();
                    }
                    this._clientIsInRoom = false;
                    this.fireLeave();
                };
                Room.prototype.doLeaveResult = function (status) {
                    this.fireLeaveResult(status);
                };
                Room.prototype.doObserve = function () {
                    this._clientIsObservingRoom = true;
                    this.fireObserve();
                };
                Room.prototype.doObserveResult = function (status) {
                    this.fireObserveResult(status);
                };
                Room.prototype.doStopObserving = function () {
                    if (!this.clientIsInRoom()) {
                        this.purgeRoomData();
                    }
                    this._clientIsObservingRoom = false;
                    this.fireStopObserving();
                };
                Room.prototype.doStopObservingResult = function (status) {
                    this.fireStopObservingResult(status);
                };
                Room.prototype.getAttribute = function (attrName) {
                    if (this.disposed)
                        return null;
                    return this.attributeManager.getAttribute(attrName);
                };
                Room.prototype.getAttributeManager = function () {
                    return this.attributeManager;
                };
                Room.prototype.getAttributes = function () {
                    if (this.disposed)
                        return null;
                    return this.attributeManager.getAttributesByScope(orbiter.Tokens.GLOBAL_ATTR);
                };
                Room.prototype.getClient = function (id) {
                    var _a, _b, _c;
                    if (this.disposed)
                        return null;
                    var client = (_a = this.occupantList.getByClientID(id)) !== null && _a !== void 0 ? _a : this.observerList.getByClientID(id);
                    return (_c = client === null || client === void 0 ? void 0 : client.getCustomClient((_b = this.getRoomID()) !== null && _b !== void 0 ? _b : undefined)) !== null && _c !== void 0 ? _c : client;
                };
                Room.prototype.getDefaultClientClass = function () {
                    return this.defaultClientClass;
                };
                Room.prototype.getNumObservers = function () {
                    var _a, _b, _c;
                    if (this.disposed)
                        return 0;
                    var levels = (_a = this.clientManager.self()) === null || _a === void 0 ? void 0 : _a.getUpdateLevels(this.getRoomID());
                    if (levels) {
                        if (levels.observerCount || levels.observerList) {
                            return this.numObservers;
                        }
                        else {
                            (_b = this.log) === null || _b === void 0 ? void 0 : _b.warn(this + " getNumObservers() called, but no observer count is available. To enable observer count, turn on observer list updates or observer count updates via the Room's setUpdateLevels() method.");
                            return 0;
                        }
                    }
                    else {
                        (_c = this.log) === null || _c === void 0 ? void 0 : _c.warn(this + " getNumObservers() called, but the current client's update  levels for the room are unknown.");
                        return 0;
                    }
                };
                Room.prototype.getNumOccupants = function () {
                    var _a, _b, _c;
                    if (this.disposed)
                        return 0;
                    var levels = (_a = this.clientManager.self()) === null || _a === void 0 ? void 0 : _a.getUpdateLevels(this.getRoomID());
                    if (levels) {
                        if (levels.occupantCount || levels.occupantList) {
                            return this.numOccupants;
                        }
                        else {
                            (_b = this.log) === null || _b === void 0 ? void 0 : _b.warn(this + " getNumOccupants() called, but no occupant count is available. To enable occupant count, turn on occupant list updates or occupant count updates via the Room's setUpdateLevels() method.");
                            return 0;
                        }
                    }
                    else {
                        (_c = this.log) === null || _c === void 0 ? void 0 : _c.debug(this + " getNumOccupants() called, but the current client's update levels for the room are unknown. To determine the room's occupant count, first join or observe the room.");
                        return 0;
                    }
                };
                Room.prototype.getObserverIDs = function () {
                    if (this.disposed)
                        return [];
                    return this.observerList.getAllIDs();
                };
                Room.prototype.getObservers = function () {
                    if (this.disposed)
                        return null;
                    var observers = this.observerList.getAll(), observersList = [];
                    for (var clientID in observers) {
                        if (!observers.hasOwnProperty(clientID))
                            continue;
                        var observer = observers[clientID], customClient = observer.getCustomClient(this.getRoomID());
                        observersList.push(customClient !== null && customClient !== void 0 ? customClient : observer);
                    }
                    return observersList;
                };
                Room.prototype.getObserversInternal = function () {
                    return this.observerList.getAll();
                };
                Room.prototype.getOccupantIDs = function () {
                    if (this.disposed)
                        return [];
                    return this.occupantList.getAllIDs();
                };
                Room.prototype.getOccupants = function () {
                    var _a;
                    if (this.disposed)
                        return null;
                    var occupants = this.occupantList.getAll(), occupantsList = [];
                    for (var clientID in occupants) {
                        if (!occupants.hasOwnProperty(clientID))
                            continue;
                        var occupant = occupants[clientID], customClient = occupant.getCustomClient((_a = this.getRoomID()) !== null && _a !== void 0 ? _a : undefined);
                        occupantsList.push(customClient !== null && customClient !== void 0 ? customClient : occupant);
                    }
                    return occupantsList;
                };
                Room.prototype.getOccupantsInternal = function () {
                    return this.occupantList.getAll();
                };
                Room.prototype.getQualifier = function () {
                    var _a;
                    return orbiter.RoomIDParser.getQualifier((_a = this.id) !== null && _a !== void 0 ? _a : '');
                };
                Room.prototype.getRoomID = function () {
                    var _a;
                    return (_a = this.id) !== null && _a !== void 0 ? _a : '';
                };
                Room.prototype.getRoomSettings = function () {
                    if (this.disposed)
                        return null;
                    var settings = new orbiter.RoomSettings(), maxClients = this.getAttribute(orbiter.Tokens.MAX_CLIENTS_ATTR), removeOnEmpty = this.getAttribute(orbiter.Tokens.REMOVE_ON_EMPTY_ATTR);
                    settings.maxClients = maxClients != null ? parseInt(maxClients) : undefined;
                    switch (removeOnEmpty) {
                        case null:
                            settings.removeOnEmpty = undefined;
                            break;
                        case 'true':
                            settings.removeOnEmpty = true;
                            break;
                        case 'false':
                            settings.removeOnEmpty = false;
                            break;
                    }
                    return settings;
                };
                Room.prototype.getSimpleRoomID = function () {
                    var _a;
                    return orbiter.RoomIDParser.getSimpleRoomID((_a = this.id) !== null && _a !== void 0 ? _a : '');
                };
                Room.prototype.getSyncState = function () {
                    var _a;
                    return (_a = this.syncState) !== null && _a !== void 0 ? _a : null;
                };
                Room.prototype.hasMessageListener = function (message, listener) {
                    var listeners = this.messageManager.getMessageListeners(message);
                    for (var i = 0; i < listeners.length; i++) {
                        var messageListener = listeners[i], listenerRoomIDs = messageListener.getForRoomIDs();
                        if (!listenerRoomIDs)
                            continue;
                        for (var j = 0; j < listenerRoomIDs.length; j++) {
                            var listenerRoomID = listenerRoomIDs[i];
                            if (listenerRoomID == this.getRoomID()) {
                                return true;
                            }
                        }
                    }
                    return false;
                };
                Room.prototype.join = function (password, updateLevels) {
                    var _a, _b;
                    if (this.disposed)
                        return;
                    if (this.clientIsInRoom()) {
                        (_a = this.log) === null || _a === void 0 ? void 0 : _a.warn(this + " Room join attempt aborted. Already in room.");
                        return;
                    }
                    if (password == null) {
                        password = '';
                    }
                    if (!orbiter.Validator.isValidPassword(password)) {
                        (_b = this.log) === null || _b === void 0 ? void 0 : _b.error(this + " Invalid room password supplied to join().  Join request not sent. See Validator.isValidPassword().");
                        return;
                    }
                    if (updateLevels != null) {
                        this.setUpdateLevels(updateLevels);
                    }
                    this.messageManager.sendUPC(orbiter.UPC.JOIN_ROOM, this.getRoomID(), password);
                };
                Room.prototype.leave = function () {
                    var _a;
                    if (this.disposed)
                        return;
                    if (this.clientIsInRoom()) {
                        this.messageManager.sendUPC(orbiter.UPC.LEAVE_ROOM, this.getRoomID());
                    }
                    else {
                        (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(this + " Leave-room request ignored. Not in room.");
                    }
                };
                Room.prototype.observe = function (password, updateLevels) {
                    if (this.disposed)
                        return;
                    this.roomManager.observeRoom(this.getRoomID(), password, updateLevels);
                };
                Room.prototype.remove = function (password) {
                    if (this.disposed)
                        return;
                    this.roomManager.removeRoom(this.getRoomID(), password);
                };
                Room.prototype.removeMessageListener = function (message, listener) {
                    var _a;
                    (_a = this.messageManager) === null || _a === void 0 ? void 0 : _a.removeMessageListener(message, listener);
                };
                Room.prototype.removeObserver = function (clientID) {
                    var _a;
                    var client = this.observerList.removeByClientID(clientID), clientFound = client != null;
                    this.setNumObservers(this.observerList.length());
                    if (!this.occupantList.contains(client)) {
                        this.removeClientAttributeListeners(client);
                    }
                    var customClient = client.getCustomClient(this.getRoomID());
                    this.fireRemoveObserver(customClient !== null && customClient !== void 0 ? customClient : client);
                    if (!clientFound) {
                        (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(this + " could not remove observer: " + clientID + ". No such client in the room's observer list.");
                    }
                };
                Room.prototype.removeOccupant = function (clientID) {
                    var _a;
                    var client = this.occupantList.removeByClientID(clientID), clientFound = client != null;
                    this.setNumOccupants(this.occupantList.length());
                    if (!this.observerList.contains(client)) {
                        this.removeClientAttributeListeners(client);
                    }
                    var customClient = client.getCustomClient(this.getRoomID());
                    this.fireRemoveOccupant(customClient !== null && customClient !== void 0 ? customClient : client);
                    if (!clientFound) {
                        (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(this + " could not remove occupant: " + clientID + ". No such client in the room's occupant list.");
                    }
                };
                Room.prototype.sendMessage = function (messageName, includeSelf, filters) {
                    var _a;
                    if (includeSelf === void 0) { includeSelf = false; }
                    var rest = [];
                    for (var _i = 3; _i < arguments.length; _i++) {
                        rest[_i - 3] = arguments[_i];
                    }
                    if (this.disposed)
                        return;
                    (_a = this.roomManager).sendMessage.apply(_a, __spreadArrays([messageName, [this.getRoomID()], includeSelf, filters], rest));
                };
                Room.prototype.sendModuleMessage = function (messageName, messageArguments) {
                    var _a;
                    var _b;
                    if (this.disposed)
                        return;
                    var sendupcArgs = [];
                    for (var arg in messageArguments) {
                        if (messageArguments.hasOwnProperty(arg))
                            sendupcArgs.push(arg + "|" + messageArguments[arg]);
                    }
                    (_a = this.messageManager).sendUPC.apply(_a, __spreadArrays([orbiter.UPC.SEND_ROOMMODULE_MESSAGE, (_b = this.getRoomID()) !== null && _b !== void 0 ? _b : undefined, messageName], sendupcArgs));
                };
                Room.prototype.setAttribute = function (attrName, attrValue, isShared, isPersistent, evaluate) {
                    if (isShared === void 0) { isShared = true; }
                    if (isPersistent === void 0) { isPersistent = false; }
                    if (evaluate === void 0) { evaluate = false; }
                    if (this.disposed)
                        return;
                    if (isShared !== false) {
                        isShared = true;
                    }
                    var attrOptions = (isShared ? orbiter.AttributeOptions.FLAG_SHARED : 0) | (isPersistent ? orbiter.AttributeOptions.FLAG_PERSISTENT : 0) | (evaluate ? orbiter.AttributeOptions.FLAG_EVALUATE : 0);
                    this.attributeManager.setAttribute(new orbiter.upc.SetRoomAttr(attrName, attrValue, attrOptions, this.getRoomID()));
                };
                Room.prototype.setDefaultClientClass = function (defaultClass) {
                    this.defaultClientClass = defaultClass;
                };
                Room.prototype.setNumObservers = function (newNumObservers) {
                    var oldNumClients = this.numObservers;
                    this.numObservers = newNumObservers;
                    if (oldNumClients != newNumObservers) {
                        this.fireObserverCount(newNumObservers);
                    }
                };
                Room.prototype.setNumOccupants = function (newNumOccupants) {
                    var oldNumClients = this.numOccupants;
                    this.numOccupants = newNumOccupants;
                    if (oldNumClients != newNumOccupants) {
                        this.fireOccupantCount(newNumOccupants);
                    }
                };
                Room.prototype.setRoomSettings = function (settings) {
                    if (this.disposed)
                        return;
                    if (settings.maxClients != null) {
                        this.setAttribute(orbiter.Tokens.MAX_CLIENTS_ATTR, settings.maxClients.toString());
                    }
                    if (settings.password != null) {
                        this.setAttribute(orbiter.Tokens.PASSWORD_ATTR, settings.password);
                    }
                    if (settings.removeOnEmpty != null) {
                        this.setAttribute(orbiter.Tokens.REMOVE_ON_EMPTY_ATTR, settings.removeOnEmpty.toString());
                    }
                };
                Room.prototype.setUpdateLevels = function (updateLevels) {
                    var _a;
                    (_a = this.messageManager) === null || _a === void 0 ? void 0 : _a.sendUPC(orbiter.UPC.SET_ROOM_UPDATE_LEVELS, this.getRoomID(), updateLevels.toInt());
                };
                Room.prototype.stopObserving = function () {
                    var _a;
                    if (this.disposed)
                        return;
                    if (this.clientIsObservingRoom()) {
                        this.messageManager.sendUPC(orbiter.UPC.STOP_OBSERVING_ROOM, this.getRoomID());
                    }
                    else {
                        (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(this + " Stop-observing-room request ignored. Not observing room.");
                    }
                };
                Room.prototype.synchronize = function (manifest) {
                    var _a, _b, _c;
                    var oldSyncState = this.getSyncState();
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(this + " Begin synchronization.");
                    this.setSyncState(orbiter.SynchronizationState.SYNCHRONIZING);
                    manifest.attributes && ((_b = this.getAttributeManager().getAttributeCollection()) === null || _b === void 0 ? void 0 : _b.synchronizeScope(orbiter.Tokens.GLOBAL_ATTR, manifest.attributes));
                    if (this.disposed)
                        return;
                    var oldOccupantList = this.getOccupantIDs(), newOccupantList = [];
                    for (var i = manifest.occupants.length; --i >= 0;) {
                        var thisOccupantClientID = manifest.occupants[i].clientID, thisOccupantUserID = manifest.occupants[i].userID, thisOccupant = thisOccupantClientID ? this.clientManager.requestClient(thisOccupantClientID) : undefined, thisOccupantAccount = thisOccupantUserID ? this.accountManager.requestAccount(thisOccupantUserID) : undefined;
                        newOccupantList.push(thisOccupantClientID);
                        if (!thisOccupant)
                            continue;
                        if (thisOccupantAccount) {
                            thisOccupant.setAccount(thisOccupantAccount);
                        }
                        if (!thisOccupant.isSelf()) {
                            thisOccupant.synchronize(manifest.occupants[i]);
                        }
                        this.addOccupant(thisOccupant);
                        if (this.disposed) {
                            return;
                        }
                    }
                    if (oldOccupantList) {
                        for (var i = oldOccupantList.length; --i >= 0;) {
                            var oldClientID = oldOccupantList[i];
                            if (newOccupantList.indexOf(oldClientID) == -1) {
                                this.removeOccupant(oldClientID);
                                if (this.disposed) {
                                    return;
                                }
                            }
                        }
                    }
                    var oldObserverList = this.getObserverIDs(), newObserverList = [];
                    for (var i = manifest.observers.length; --i >= 0;) {
                        var thisObserverClientID = manifest.observers[i].clientID, thisObserverUserID = manifest.observers[i].userID, thisObserver = thisObserverClientID ? this.clientManager.requestClient(thisObserverClientID) : undefined, thisObserverAccount = thisObserverUserID ? this.accountManager.requestAccount(thisObserverUserID) : undefined;
                        newObserverList.push(thisObserverClientID);
                        if (!thisObserver)
                            continue;
                        if (thisObserverAccount) {
                            thisObserver.setAccount(thisObserverAccount);
                        }
                        if (!thisObserver.isSelf()) {
                            thisObserver.synchronize(manifest.observers[i]);
                        }
                        this.addObserver(thisObserver);
                        if (this.disposed) {
                            return;
                        }
                    }
                    if (oldObserverList) {
                        for (var i = oldObserverList.length; --i >= 0;) {
                            var oldClientID = oldObserverList[i];
                            if (newObserverList.indexOf(oldClientID) == -1) {
                                this.removeObserver(oldClientID);
                                if (this.disposed) {
                                    return;
                                }
                            }
                        }
                    }
                    var levels = (_c = this.clientManager.self()) === null || _c === void 0 ? void 0 : _c.getUpdateLevels(this.getRoomID());
                    if (levels === null || levels === void 0 ? void 0 : levels.occupantList) {
                        this.setNumOccupants(this.occupantList.length());
                    }
                    else if (levels === null || levels === void 0 ? void 0 : levels.occupantCount) {
                        this.setNumOccupants(manifest.occupantCount);
                    }
                    if (levels === null || levels === void 0 ? void 0 : levels.observerList) {
                        this.setNumObservers(this.observerList.length());
                    }
                    else if (levels === null || levels === void 0 ? void 0 : levels.observerCount) {
                        this.setNumObservers(manifest.observerCount);
                    }
                    this.setSyncState(oldSyncState !== null && oldSyncState !== void 0 ? oldSyncState : undefined);
                    this.fireSynchronize(orbiter.Status.SUCCESS);
                };
                Room.prototype.toString = function () {
                    return "[ROOM id: " + this.getRoomID() + "]";
                };
                Room.prototype.updateSyncState = function () {
                    if (this.disposed) {
                        this.setSyncState(orbiter.SynchronizationState.NOT_SYNCHRONIZED);
                    }
                    else {
                        if (this.roomManager.hasObservedRoom(this.getRoomID()) || this.roomManager.hasOccupiedRoom(this.getRoomID()) || this.roomManager.hasWatchedRoom(this.getRoomID())) {
                            this.setSyncState(orbiter.SynchronizationState.SYNCHRONIZED);
                        }
                        else {
                            this.setSyncState(orbiter.SynchronizationState.NOT_SYNCHRONIZED);
                        }
                    }
                };
                Room.prototype.addClientAttributeListeners = function (client) {
                    client.addEventListener(orbiter.AttributeEvent.UPDATE, this.updateClientAttributeListener, this);
                    client.addEventListener(orbiter.AttributeEvent.DELETE, this.deleteClientAttributeListener, this);
                };
                Room.prototype.deleteClientAttributeListener = function (e) {
                    var _a;
                    var attr = e.getChangedAttr(), client = e.target, customClient = client.getCustomClient((_a = this.getRoomID()) !== null && _a !== void 0 ? _a : undefined);
                    this.fireDeleteClientAttribute(customClient !== null && customClient !== void 0 ? customClient : client, attr === null || attr === void 0 ? void 0 : attr.scope, attr === null || attr === void 0 ? void 0 : attr.name, attr === null || attr === void 0 ? void 0 : attr.value);
                };
                Room.prototype.fireAddObserver = function (id) {
                    var _a, _b;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " Added observer: [" + id + "].");
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.ADD_OBSERVER, (_b = this.getClient(id)) !== null && _b !== void 0 ? _b : undefined, id);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireAddOccupant = function (id) {
                    var _a, _b;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " Added occupant: [" + id + "].");
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.ADD_OCCUPANT, (_b = this.getClient(id)) !== null && _b !== void 0 ? _b : undefined, id);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireDeleteClientAttribute = function (client, scope, attrName, attrValue) {
                    var _a, _b;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " Client attribute deleted from " + client + ". Deleted attribute: [" + attrName + "].");
                    var deletedAttr = new orbiter.Attribute(attrName, attrValue, undefined, scope);
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.DELETE_CLIENT_ATTRIBUTE, client, (_b = client.getClientID()) !== null && _b !== void 0 ? _b : undefined, undefined, deletedAttr);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireJoin = function () {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " Room joined.");
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.JOIN);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireJoinResult = function (status) {
                    if (this.log)
                        this.log.info(this + " Join result: " + status);
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.JOIN_RESULT, undefined, undefined, status);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireLeave = function () {
                    if (this.log)
                        this.log.info(this + " Room left.");
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.LEAVE);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireLeaveResult = function (status) {
                    if (this.log)
                        this.log.info(this + " Leave result: " + status);
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.LEAVE_RESULT, undefined, undefined, status);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireObserve = function () {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " Room observed.");
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.OBSERVE);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireObserveResult = function (status) {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " Observe result: " + status);
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.OBSERVE_RESULT, undefined, undefined, status);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireObserverCount = function (newNumClients) {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " New observer count: " + newNumClients);
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.OBSERVER_COUNT, undefined, undefined, undefined, undefined, newNumClients);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireOccupantCount = function (newNumClients) {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " New occupant count: " + newNumClients);
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.OCCUPANT_COUNT, undefined, undefined, undefined, undefined, newNumClients);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireRemoveObserver = function (client) {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " Removed observer: " + client + ".");
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.REMOVE_OBSERVER, client, client.getClientID());
                    this.dispatchEvent(e);
                };
                Room.prototype.fireRemoveOccupant = function (client) {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " Removed occupant: " + client + ".");
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.REMOVE_OCCUPANT, client, client.getClientID());
                    this.dispatchEvent(e);
                };
                Room.prototype.fireRemoved = function () {
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.REMOVED);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireStopObserving = function () {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " Observation stopped.");
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.STOP_OBSERVING);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireStopObservingResult = function (status) {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " Stop observing result:  " + status);
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.STOP_OBSERVING_RESULT, undefined, undefined, status);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireSynchronize = function (status) {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " Synchronization complete.");
                    var e = new orbiter.RoomEvent(orbiter.RoomEvent.SYNCHRONIZE, undefined, undefined, status);
                    this.dispatchEvent(e);
                };
                Room.prototype.fireUpdateClientAttribute = function (client, scope, attrName, attrVal, oldVal) {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.info(this + " Client attribute updated on " + client + ". Attribute [" + attrName + "] is now: [" + attrVal + "]. Old value was: [" + oldVal + "].");
                    var changedAttr = new orbiter.Attribute(attrName, attrVal, oldVal, scope), e = new orbiter.RoomEvent(orbiter.RoomEvent.UPDATE_CLIENT_ATTRIBUTE, client, client.getClientID(), undefined, changedAttr);
                    this.dispatchEvent(e);
                };
                Room.prototype.purgeRoomData = function () {
                    var _a, _b, _c, _d, _e;
                    if (this.disposed)
                        return;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(this + " Clearing occupant list.");
                    for (var occupantID in this.occupantList.getAll()) {
                        this.removeClientAttributeListeners((_b = this.occupantList.getByClientID(occupantID)) !== null && _b !== void 0 ? _b : undefined);
                    }
                    this.occupantList.removeAll();
                    (_c = this.log) === null || _c === void 0 ? void 0 : _c.debug(this + " Clearing observer list.");
                    for (var observerID in this.observerList.getAll()) {
                        this.removeClientAttributeListeners((_d = this.observerList.getByClientID(observerID)) !== null && _d !== void 0 ? _d : undefined);
                    }
                    this.observerList.removeAll();
                    (_e = this.log) === null || _e === void 0 ? void 0 : _e.debug(this + " Clearing room attributes.");
                    this.attributeManager.removeAll();
                };
                Room.prototype.removeClientAttributeListeners = function (client) {
                    client === null || client === void 0 ? void 0 : client.removeEventListener(orbiter.AttributeEvent.UPDATE, this.updateClientAttributeListener, this);
                    client === null || client === void 0 ? void 0 : client.removeEventListener(orbiter.AttributeEvent.DELETE, this.deleteClientAttributeListener, this);
                };
                Room.prototype.setRoomID = function (roomID) {
                    var _a;
                    if (!orbiter.Validator.isValidResolvedRoomID(roomID)) {
                        var errorMsg = "Invalid room ID specified during room creation. Offending ID: " + roomID;
                        (_a = this.log) === null || _a === void 0 ? void 0 : _a.error(errorMsg);
                        throw new Error(errorMsg);
                    }
                    this.id = roomID;
                };
                Room.prototype.setSyncState = function (newSyncState) {
                    this.syncState = newSyncState;
                };
                Room.prototype.shutdown = function () {
                    if (this.disposed)
                        return;
                    var theLog = this.log;
                    theLog === null || theLog === void 0 ? void 0 : theLog.debug(this + " Shutdown started.");
                    if (this.clientIsInRoom()) {
                        theLog === null || theLog === void 0 ? void 0 : theLog.info(this + " Current client is in the room. Forcing the client to leave...");
                        this.doLeave();
                    }
                    if (this.clientIsObservingRoom()) {
                        theLog === null || theLog === void 0 ? void 0 : theLog.info(this + " Current client is observing the room. Forcing the client to stop observing...");
                        this.doStopObserving();
                    }
                    theLog === null || theLog === void 0 ? void 0 : theLog.info(this + " Dereferencing resources.");
                    this.purgeRoomData();
                    this.attributeManager.dispose();
                    this.fireRemoved();
                    this.dispose();
                    theLog === null || theLog === void 0 ? void 0 : theLog.info(this + ' Shutdown complete.');
                };
                Room.prototype.updateClientAttributeListener = function (e) {
                    var attr = e.getChangedAttr(), client = e.target, customClient = client.getCustomClient(this.getRoomID());
                    this.fireUpdateClientAttribute(customClient !== null && customClient !== void 0 ? customClient : client, attr.scope, attr.name, attr.value, attr.oldValue);
                };
                return Room;
            }(net.user1.events.EventDispatcher));
            orbiter.Room = Room;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var RoomClassRegistry = (function () {
                function RoomClassRegistry() {
                    this.registry = {};
                }
                RoomClassRegistry.prototype.setRoomClass = function (roomID, roomClass) {
                    this.registry[roomID] = roomClass;
                };
                RoomClassRegistry.prototype.clearRoomClass = function (roomID) {
                    delete this.registry[roomID];
                };
                RoomClassRegistry.prototype.getRoomClass = function (roomID) {
                    return this.registry[roomID] ? this.registry[roomID] : orbiter.Room;
                };
                return RoomClassRegistry;
            }());
            orbiter.RoomClassRegistry = RoomClassRegistry;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var RoomEvent = (function (_super) {
                __extends(RoomEvent, _super);
                function RoomEvent(type, client, clientID, status, changedAttr, numClients, roomID) {
                    if (numClients === void 0) { numClients = 0; }
                    var _this = _super.call(this, type) || this;
                    _this.client = client;
                    _this.clientID = clientID;
                    _this.status = status;
                    _this.changedAttr = changedAttr;
                    _this.numClients = numClients;
                    _this.roomID = roomID;
                    _this.clientID = clientID == '' ? undefined : clientID;
                    return _this;
                }
                RoomEvent.prototype.getChangedAttr = function () {
                    var _a;
                    return (_a = this.changedAttr) !== null && _a !== void 0 ? _a : null;
                };
                RoomEvent.prototype.getClient = function () {
                    var _a;
                    return (_a = this.client) !== null && _a !== void 0 ? _a : null;
                };
                RoomEvent.prototype.getClientID = function () {
                    var _a;
                    return (_a = this.clientID) !== null && _a !== void 0 ? _a : null;
                };
                RoomEvent.prototype.getNumClients = function () {
                    return this.numClients;
                };
                RoomEvent.prototype.getRoomID = function () {
                    var _a;
                    return (_a = this.roomID) !== null && _a !== void 0 ? _a : null;
                };
                RoomEvent.prototype.getStatus = function () {
                    var _a;
                    return (_a = this.status) !== null && _a !== void 0 ? _a : null;
                };
                RoomEvent.prototype.toString = function () {
                    return '[object RoomEvent]';
                };
                RoomEvent.ADD_OBSERVER = 'ADD_OBSERVER';
                RoomEvent.ADD_OCCUPANT = 'ADD_OCCUPANT';
                RoomEvent.DELETE_CLIENT_ATTRIBUTE = 'DELETE_CLIENT_ATTRIBUTE';
                RoomEvent.JOIN = 'JOIN';
                RoomEvent.JOIN_RESULT = 'JOIN_RESULT';
                RoomEvent.LEAVE = 'LEAVE';
                RoomEvent.LEAVE_RESULT = 'LEAVE_RESULT';
                RoomEvent.OBSERVE = 'OBSERVE';
                RoomEvent.OBSERVER_COUNT = 'OBSERVER_COUNT';
                RoomEvent.OBSERVE_RESULT = 'OBSERVE_RESULT';
                RoomEvent.OCCUPANT_COUNT = 'OCCUPANT_COUNT';
                RoomEvent.REMOVED = 'REMOVED';
                RoomEvent.REMOVE_OBSERVER = 'REMOVE_OBSERVER';
                RoomEvent.REMOVE_OCCUPANT = 'REMOVE_OCCUPANT';
                RoomEvent.STOP_OBSERVING = 'STOP_OBSERVING';
                RoomEvent.STOP_OBSERVING_RESULT = 'STOP_OBSERVING_RESULT';
                RoomEvent.SYNCHRONIZE = 'SYNCHRONIZE';
                RoomEvent.UPDATE_CLIENT_ATTRIBUTE = 'UPDATE_CLIENT_ATTRIBUTE';
                return RoomEvent;
            }(net.user1.events.Event));
            orbiter.RoomEvent = RoomEvent;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var RoomIDParser = (function () {
                function RoomIDParser() {
                }
                RoomIDParser.getQualifier = function (fullRoomID) {
                    if (fullRoomID.indexOf('.') == -1) {
                        return '';
                    }
                    else {
                        return fullRoomID.slice(0, fullRoomID.lastIndexOf('.'));
                    }
                };
                RoomIDParser.getSimpleRoomID = function (fullRoomID) {
                    if (fullRoomID.indexOf('.') == -1) {
                        return fullRoomID;
                    }
                    else {
                        return fullRoomID.slice(fullRoomID.lastIndexOf('.') + 1);
                    }
                };
                RoomIDParser.splitID = function (fullRoomID) {
                    return [this.getQualifier(fullRoomID), this.getSimpleRoomID(fullRoomID)];
                };
                return RoomIDParser;
            }());
            orbiter.RoomIDParser = RoomIDParser;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var RoomList = (function (_super) {
                __extends(RoomList, _super);
                function RoomList() {
                    var _this = _super.call(this) || this;
                    _this.rooms = [];
                    return _this;
                }
                RoomList.prototype.add = function (room) {
                    if (!this.contains(room)) {
                        this.rooms.push(room);
                        this.dispatchAddItem(room);
                        return room;
                    }
                    else {
                        return null;
                    }
                };
                ;
                RoomList.prototype.contains = function (room) {
                    return this.rooms.indexOf(room) != -1;
                };
                RoomList.prototype.containsRoomID = function (roomID) {
                    if (!roomID) {
                        return false;
                    }
                    return !!this.getByRoomID(roomID);
                };
                RoomList.prototype.dispatchAddItem = function (item) {
                    this.dispatchEvent(new orbiter.CollectionEvent(orbiter.CollectionEvent.ADD_ITEM, item));
                };
                RoomList.prototype.dispatchRemoveItem = function (item) {
                    this.dispatchEvent(new orbiter.CollectionEvent(orbiter.CollectionEvent.REMOVE_ITEM, item));
                };
                RoomList.prototype.getAll = function () {
                    return this.rooms.slice(0);
                };
                RoomList.prototype.getByRoomID = function (roomID) {
                    for (var i = this.rooms.length; --i >= 0;) {
                        var room = this.rooms[i];
                        if (room.getRoomID() == roomID) {
                            return room;
                        }
                    }
                    return null;
                };
                RoomList.prototype.length = function () {
                    return this.rooms.length;
                };
                RoomList.prototype.remove = function (room) {
                    var index = this.rooms.indexOf(room);
                    if (index != -1) {
                        room = this.rooms.splice(index, 1)[0];
                        this.dispatchRemoveItem(room);
                        return room;
                    }
                    else {
                        return null;
                    }
                };
                RoomList.prototype.removeAll = function () {
                    for (var i = this.rooms.length; --i >= 0;) {
                        var room = this.rooms.splice(i, 1)[0];
                        this.dispatchRemoveItem(room);
                    }
                };
                RoomList.prototype.removeByRoomID = function (roomID) {
                    for (var i = this.rooms.length; --i >= 0;) {
                        if (this.rooms[i].getRoomID() == roomID) {
                            var room = this.rooms.splice(i, 1)[0];
                            this.dispatchRemoveItem(room);
                            return room;
                        }
                    }
                    return null;
                };
                return RoomList;
            }(net.user1.events.EventDispatcher));
            orbiter.RoomList = RoomList;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var RoomListSnapshot = (function (_super) {
                    __extends(RoomListSnapshot, _super);
                    function RoomListSnapshot(qualifier, recursive) {
                        if (recursive === void 0) { recursive = false; }
                        var _this = _super.call(this) || this;
                        _this.qualifier = qualifier;
                        _this.recursive = recursive;
                        _this.method = orbiter.UPC.GET_ROOMLIST_SNAPSHOT;
                        _this.args = [qualifier, recursive ? 'true' : 'false'];
                        return _this;
                    }
                    RoomListSnapshot.prototype.getQualifier = function () {
                        var _a;
                        return (_a = this.qualifier) !== null && _a !== void 0 ? _a : null;
                    };
                    RoomListSnapshot.prototype.getRecursive = function () {
                        return this.recursive;
                    };
                    RoomListSnapshot.prototype.getRoomList = function () {
                        var _a, _b;
                        return (_b = (_a = this.roomList) === null || _a === void 0 ? void 0 : _a.slice()) !== null && _b !== void 0 ? _b : null;
                    };
                    RoomListSnapshot.prototype.setQualifier = function (value) {
                        this.qualifier = value;
                    };
                    RoomListSnapshot.prototype.setRecursive = function (value) {
                        this.recursive = value;
                    };
                    RoomListSnapshot.prototype.setRoomList = function (value) {
                        this.roomList = value;
                    };
                    return RoomListSnapshot;
                }(snapshot.Snapshot));
                snapshot.RoomListSnapshot = RoomListSnapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter_6) {
            var RoomManager = (function (_super) {
                __extends(RoomManager, _super);
                function RoomManager(orbiter) {
                    var _this = _super.call(this) || this;
                    _this.orbiter = orbiter;
                    _this.watchedQualifiers = [];
                    _this.cachedRooms = new orbiter_6.RoomList();
                    _this.occupiedRooms = new orbiter_6.RoomList();
                    _this.observedRooms = new orbiter_6.RoomList();
                    _this.watchedRooms = new orbiter_6.RoomList();
                    _this.cachedRooms.addEventListener(orbiter_6.CollectionEvent.REMOVE_ITEM, _this.removeRoomListener, _this);
                    _this.occupiedRooms.addEventListener(orbiter_6.CollectionEvent.ADD_ITEM, _this.addRoomListener, _this);
                    _this.occupiedRooms.addEventListener(orbiter_6.CollectionEvent.REMOVE_ITEM, _this.removeRoomListener, _this);
                    _this.observedRooms.addEventListener(orbiter_6.CollectionEvent.ADD_ITEM, _this.addRoomListener, _this);
                    _this.observedRooms.addEventListener(orbiter_6.CollectionEvent.REMOVE_ITEM, _this.removeRoomListener, _this);
                    _this.watchedRooms.addEventListener(orbiter_6.CollectionEvent.ADD_ITEM, _this.addRoomListener, _this);
                    _this.watchedRooms.addEventListener(orbiter_6.CollectionEvent.REMOVE_ITEM, _this.removeRoomListener, _this);
                    _this.orbiter = orbiter;
                    _this.addEventListener(orbiter_6.RoomManagerEvent.WATCH_FOR_ROOMS_RESULT, _this.watchForRoomsResultListener, _this);
                    _this.addEventListener(orbiter_6.RoomManagerEvent.STOP_WATCHING_FOR_ROOMS_RESULT, _this.stopWatchingForRoomsResultListener, _this);
                    _this.roomClassRegistry = new orbiter_6.RoomClassRegistry();
                    _this.log = _this.orbiter.getLog();
                    return _this;
                }
                RoomManager.prototype.addCachedRoom = function (roomID) {
                    var cachedRoom = this.cachedRooms.getByRoomID(roomID);
                    if (!cachedRoom) {
                        this.log.debug("[ROOM_MANAGER] Adding cached room: [" + roomID + "]");
                        var room = this.requestRoom(roomID);
                        if (room)
                            return this.cachedRooms.add(room);
                        else
                            return null;
                    }
                    else {
                        return cachedRoom;
                    }
                };
                RoomManager.prototype.addObservedRoom = function (roomID) {
                    this.log.debug("[ROOM_MANAGER] Adding observed room: [" + roomID + "]");
                    var requestedRoom = this.requestRoom(roomID);
                    if (requestedRoom) {
                        var room = this.observedRooms.add(requestedRoom);
                        room === null || room === void 0 ? void 0 : room.updateSyncState();
                        return room;
                    }
                    else
                        return null;
                };
                RoomManager.prototype.addOccupiedRoom = function (roomID) {
                    this.log.debug("[ROOM_MANAGER] Adding occupied room: [" + roomID + "]");
                    var requestedRoom = this.requestRoom(roomID);
                    if (requestedRoom) {
                        var room = this.occupiedRooms.add(requestedRoom);
                        room === null || room === void 0 ? void 0 : room.updateSyncState();
                        return room;
                    }
                    else
                        return null;
                };
                RoomManager.prototype.addRoomListener = function (e) {
                    var room = e.getItem();
                    if (this.getKnownReferenceCount(room.getRoomID()) == 1) {
                        this.fireRoomAdded(room.getQualifier(), room.getRoomID(), room);
                        this.fireRoomCount(this.getNumRooms());
                    }
                };
                RoomManager.prototype.addWatchedRoom = function (roomID) {
                    this.log.debug("[ROOM_MANAGER] Adding watched room: [" + roomID + "]");
                    var requestedRoom = this.requestRoom(roomID);
                    if (requestedRoom) {
                        var room = this.watchedRooms.add(requestedRoom);
                        room === null || room === void 0 ? void 0 : room.updateSyncState();
                    }
                };
                RoomManager.prototype.cleanup = function () {
                    this.log.info('[ROOM_MANAGER] Cleaning resources.');
                    this.removeAllRooms();
                    this.watchedQualifiers = [];
                };
                RoomManager.prototype.clientIsKnown = function (clientID) {
                    var clientSets = [], rooms = this.getRooms();
                    for (var i = rooms.length; --i >= 0;) {
                        var room = rooms[i];
                        clientSets.push(room.getOccupantsInternal());
                        clientSets.push(room.getObserversInternal());
                    }
                    for (var i = clientSets.length; --i >= 0;) {
                        if (clientSets[i][clientID] != null) {
                            return true;
                        }
                    }
                    return false;
                };
                RoomManager.prototype.createRoom = function (roomID, roomSettings, attributes, modules) {
                    if (roomSettings === void 0) { roomSettings = new orbiter_6.RoomModules(); }
                    if (modules === void 0) { modules = new orbiter_6.RoomModules(); }
                    var moduleIDs = modules.getIdentifiers();
                    for (var i = moduleIDs.length; --i >= 0;) {
                        var moduleID = moduleIDs[i];
                        if (!orbiter_6.Validator.isValidModuleName(moduleID)) {
                            throw new Error("[ROOM_MANAGER] createRoom() failed. Illegal room module name: [" + moduleID + "]. See Validator.isValidModuleName().");
                        }
                    }
                    if (roomID != null) {
                        if (!orbiter_6.Validator.isValidResolvedRoomID(roomID)) {
                            throw new Error("[ROOM_MANAGER] createRoom() failed. Illegal room id: [" + roomID + "]. See Validator.isValidResolvedRoomID().");
                        }
                    }
                    if (roomID == null) {
                        roomID = '';
                    }
                    else {
                        this.addCachedRoom(roomID);
                    }
                    var attrArg = '';
                    if (attributes) {
                        var attrSettings = 0;
                        for (var i = 0; i < attributes.length; i++) {
                            var attr = attributes[i];
                            attrSettings = 0;
                            attrSettings |= attr.shared ? orbiter_6.AttributeOptions.FLAG_SHARED : 0;
                            attrSettings |= attr.persistent ? orbiter_6.AttributeOptions.FLAG_PERSISTENT : 0;
                            attrSettings |= attr.immutable ? orbiter_6.AttributeOptions.FLAG_IMMUTABLE : 0;
                            attrArg += attr.NAME + orbiter_6.Tokens.RS + attr.VALUE + orbiter_6.Tokens.RS + attrSettings.toString();
                            if (i < attributes.length - 1) {
                                attrArg += orbiter_6.Tokens.RS;
                            }
                        }
                    }
                    var msgMan = this.orbiter.getMessageManager();
                    msgMan.sendUPC(orbiter_6.UPC.CREATE_ROOM, roomID, roomSettings.serialize(), attrArg, modules.serialize());
                    if (roomID == '') {
                        return null;
                    }
                    else {
                        return this.getRoom(roomID);
                    }
                };
                RoomManager.prototype.dispose = function () {
                    this.log.info('[ROOM_MANAGER] Disposing resources.');
                    this.watchedQualifiers = null;
                    var rooms = this.getAllRooms();
                    for (var i = this.getAllRooms().length; --i >= 0;) {
                        var room = rooms[i];
                        room.dispose();
                    }
                    this.cachedRooms.removeEventListener(orbiter_6.CollectionEvent.REMOVE_ITEM, this.removeRoomListener, this);
                    this.occupiedRooms.removeEventListener(orbiter_6.CollectionEvent.ADD_ITEM, this.addRoomListener, this);
                    this.occupiedRooms.removeEventListener(orbiter_6.CollectionEvent.REMOVE_ITEM, this.removeRoomListener, this);
                    this.observedRooms.removeEventListener(orbiter_6.CollectionEvent.ADD_ITEM, this.addRoomListener, this);
                    this.observedRooms.removeEventListener(orbiter_6.CollectionEvent.REMOVE_ITEM, this.removeRoomListener, this);
                    this.watchedRooms.removeEventListener(orbiter_6.CollectionEvent.ADD_ITEM, this.addRoomListener, this);
                    this.watchedRooms.removeEventListener(orbiter_6.CollectionEvent.REMOVE_ITEM, this.removeRoomListener, this);
                    this.occupiedRooms = null;
                    this.observedRooms = null;
                    this.watchedRooms = null;
                    this.cachedRooms = null;
                    this.log = null;
                    this.orbiter = null;
                    this.roomClassRegistry = null;
                };
                RoomManager.prototype.disposeCachedRooms = function () {
                    var rooms = this.cachedRooms.getAll();
                    for (var i = 0; i <= rooms.length; i++) {
                        var room = rooms[i];
                        this.removeCachedRoom(room.getRoomID());
                    }
                };
                RoomManager.prototype.disposeRoom = function (roomID) {
                    var room = this.getRoom(roomID);
                    if (room) {
                        this.log.debug("[ROOM_MANAGER] Disposing room: " + room);
                        this.removeCachedRoom(roomID);
                        this.removeWatchedRoom(roomID);
                        this.removeOccupiedRoom(roomID);
                        this.removeObservedRoom(roomID);
                    }
                    else {
                        this.log.debug("[ROOM_MANAGER] disposeRoom() called for unknown room: [" + roomID + "]");
                    }
                };
                RoomManager.prototype.fireCreateRoomResult = function (roomIDQualifier, roomID, status) {
                    var e = new orbiter_6.RoomManagerEvent(orbiter_6.RoomManagerEvent.CREATE_ROOM_RESULT, roomID, status, roomIDQualifier);
                    this.dispatchEvent(e);
                };
                RoomManager.prototype.fireJoinRoomResult = function (roomID, status) {
                    this.dispatchEvent(new orbiter_6.RoomEvent(orbiter_6.RoomEvent.JOIN_RESULT, undefined, undefined, status, undefined, 0, roomID));
                };
                RoomManager.prototype.fireLeaveRoomResult = function (roomID, status) {
                    this.dispatchEvent(new orbiter_6.RoomEvent(orbiter_6.RoomEvent.LEAVE_RESULT, undefined, undefined, status, undefined, 0, roomID));
                };
                RoomManager.prototype.fireObserveRoomResult = function (roomID, status) {
                    this.dispatchEvent(new orbiter_6.RoomEvent(orbiter_6.RoomEvent.OBSERVE_RESULT, undefined, undefined, status, undefined, 0, roomID));
                };
                RoomManager.prototype.fireRemoveRoomResult = function (roomIDQualifier, roomID, status) {
                    var e = new orbiter_6.RoomManagerEvent(orbiter_6.RoomManagerEvent.REMOVE_ROOM_RESULT, roomID, status, roomIDQualifier);
                    this.dispatchEvent(e);
                };
                RoomManager.prototype.fireRoomAdded = function (roomIDQualifier, roomID, theRoom) {
                    var e = new orbiter_6.RoomManagerEvent(orbiter_6.RoomManagerEvent.ROOM_ADDED, roomID, undefined, roomIDQualifier, theRoom);
                    this.dispatchEvent(e);
                };
                RoomManager.prototype.fireRoomCount = function (numRooms) {
                    this.dispatchEvent(new orbiter_6.RoomManagerEvent(orbiter_6.RoomManagerEvent.ROOM_COUNT, undefined, undefined, undefined, undefined, numRooms));
                };
                RoomManager.prototype.fireRoomRemoved = function (roomIDQualifier, roomID, theRoom) {
                    var e = new orbiter_6.RoomManagerEvent(orbiter_6.RoomManagerEvent.ROOM_REMOVED, roomID, undefined, roomIDQualifier, theRoom);
                    this.dispatchEvent(e);
                };
                RoomManager.prototype.fireStopObservingRoomResult = function (roomID, status) {
                    this.dispatchEvent(new orbiter_6.RoomEvent(orbiter_6.RoomEvent.STOP_OBSERVING_RESULT, undefined, undefined, status, undefined, 0, roomID));
                };
                RoomManager.prototype.fireStopWatchingForRoomsResult = function (roomIDQualifier, status) {
                    var e = new orbiter_6.RoomManagerEvent(orbiter_6.RoomManagerEvent.STOP_WATCHING_FOR_ROOMS_RESULT, undefined, status, roomIDQualifier);
                    this.dispatchEvent(e);
                };
                RoomManager.prototype.fireWatchForRoomsResult = function (roomIDQualifier, status) {
                    var e = new orbiter_6.RoomManagerEvent(orbiter_6.RoomManagerEvent.WATCH_FOR_ROOMS_RESULT, undefined, status, roomIDQualifier);
                    this.dispatchEvent(e);
                };
                RoomManager.prototype.getAllClients = function () {
                    var clientSets = [], rooms = this.getRooms();
                    var obj = {};
                    for (var i = rooms.length; --i >= 0;) {
                        var room = rooms[i];
                        obj = __assign(__assign(__assign({}, obj), room.getOccupantsInternal()), room.getObserversInternal());
                    }
                    return obj;
                };
                RoomManager.prototype.getAllRooms = function () {
                    return __spreadArrays(this.occupiedRooms.getAll(), this.observedRooms.getAll(), this.watchedRooms.getAll(), this.cachedRooms.getAll());
                };
                RoomManager.prototype.getKnownReferenceCount = function (roomID) {
                    var count = 0;
                    count += this.hasObservedRoom(roomID) ? 1 : 0;
                    count += this.hasOccupiedRoom(roomID) ? 1 : 0;
                    count += this.hasWatchedRoom(roomID) ? 1 : 0;
                    return count;
                };
                RoomManager.prototype.getNumRooms = function (qualifier) {
                    return this.getRoomsWithQualifier(qualifier).length;
                };
                RoomManager.prototype.getRoom = function (roomID) {
                    var rooms = this.getAllRooms();
                    for (var i = rooms.length; --i >= 0;) {
                        var room = rooms[i];
                        if (room.getRoomID() == roomID) {
                            return room;
                        }
                    }
                    return null;
                };
                RoomManager.prototype.getRoomClassRegistry = function () {
                    return this.roomClassRegistry;
                };
                RoomManager.prototype.getRoomIDs = function () {
                    return this.getRooms().map(function (r) { return r.getRoomID(); });
                };
                RoomManager.prototype.getRooms = function () {
                    return __spreadArrays(this.occupiedRooms.getAll(), this.observedRooms.getAll(), this.watchedRooms.getAll());
                };
                RoomManager.prototype.getRoomsWithQualifier = function (qualifier) {
                    if (qualifier == undefined)
                        return this.getRooms();
                    var roomlist = [];
                    for (var _i = 0, _a = this.getRooms(); _i < _a.length; _i++) {
                        var room = _a[_i];
                        if (orbiter_6.RoomIDParser.getQualifier(room.getRoomID()) == qualifier) {
                            roomlist.push(room);
                        }
                    }
                    return roomlist;
                };
                RoomManager.prototype.hasCachedRoom = function (roomID) {
                    return this.cachedRooms.containsRoomID(roomID);
                };
                RoomManager.prototype.hasObservedRoom = function (roomID) {
                    return this.observedRooms.containsRoomID(roomID);
                };
                RoomManager.prototype.hasOccupiedRoom = function (roomID) {
                    return this.occupiedRooms.containsRoomID(roomID);
                };
                RoomManager.prototype.hasWatchedRoom = function (roomID) {
                    return this.watchedRooms.containsRoomID(roomID);
                };
                RoomManager.prototype.isWatchingQualifier = function (qualifier) {
                    return this.watchedQualifiers.indexOf(qualifier) != -1;
                };
                RoomManager.prototype.joinRoom = function (roomID, password, updateLevels) {
                    if (!this.orbiter.isReady()) {
                        this.log.warn("[ROOM_MANAGER] Connection not open. Request to join room [" + roomID + "] could not be sent.");
                        return null;
                    }
                    if (!orbiter_6.Validator.isValidResolvedRoomID(roomID)) {
                        this.log.error("[ROOM_MANAGER] Invalid room id supplied to joinRoom(): [" + roomID + "]. Join request not sent. See Validator.isValidResolvedRoomID().");
                        return null;
                    }
                    var theRoom = this.getRoom(roomID);
                    if (theRoom) {
                        if (theRoom.clientIsInRoom()) {
                            this.log.warn('[ROOM_MANAGER] Room join attempt aborted. Already in room: [' +
                                theRoom.getRoomID() + '].');
                            return theRoom;
                        }
                    }
                    else {
                        theRoom = this.addCachedRoom(roomID);
                    }
                    if (password == null) {
                        password = '';
                    }
                    if (!orbiter_6.Validator.isValidPassword(password)) {
                        this.log.error("[ROOM_MANAGER] Invalid room password supplied to joinRoom(): [" + roomID + "]. Join request not sent. See Validator.isValidPassword().");
                        return theRoom;
                    }
                    if (updateLevels != null) {
                        theRoom === null || theRoom === void 0 ? void 0 : theRoom.setUpdateLevels(updateLevels);
                    }
                    var msgMan = this.orbiter.getMessageManager();
                    msgMan.sendUPC(orbiter_6.UPC.JOIN_ROOM, roomID, password);
                    return theRoom;
                };
                RoomManager.prototype.observeRoom = function (roomID, password, updateLevels) {
                    var theRoom;
                    if (!orbiter_6.Validator.isValidResolvedRoomID(roomID)) {
                        throw new Error("Invalid room id supplied to observeRoom(): [" + roomID + "]. Request not sent. See Validator.isValidResolvedRoomID().");
                    }
                    theRoom = this.getRoom(roomID);
                    if (theRoom) {
                        if (theRoom.clientIsObservingRoom()) {
                            this.log.warn("[ROOM_MANAGER] Room observe attempt ignored. Already observing room: '" + roomID + "'.");
                            return null;
                        }
                    }
                    else {
                        theRoom = this.addCachedRoom(roomID);
                    }
                    if (password == null) {
                        password = '';
                    }
                    if (!orbiter_6.Validator.isValidPassword(password)) {
                        throw new Error("Invalid room password supplied to observeRoom().  Room ID: [" + roomID + "], password: [" + password + "]. See Validator.isValidPassword().");
                    }
                    if (updateLevels != null) {
                        theRoom === null || theRoom === void 0 ? void 0 : theRoom.setUpdateLevels(updateLevels);
                    }
                    var msgMan = this.orbiter.getMessageManager();
                    msgMan.sendUPC(orbiter_6.UPC.OBSERVE_ROOM, roomID, password);
                    return theRoom;
                };
                RoomManager.prototype.removeAllRooms = function () {
                    this.log.debug('[ROOM_MANAGER] Removing all local room object references.');
                    this.cachedRooms.removeAll();
                    this.watchedRooms.removeAll();
                    this.occupiedRooms.removeAll();
                    this.observedRooms.removeAll();
                };
                RoomManager.prototype.removeAllWatchedRooms = function () {
                    for (var _i = 0, _a = this.watchedRooms.getAll(); _i < _a.length; _i++) {
                        var room = _a[_i];
                        this.removeWatchedRoom(room.getRoomID());
                        room.updateSyncState();
                    }
                };
                RoomManager.prototype.removeCachedRoom = function (roomID) {
                    if (this.cachedRooms.containsRoomID(roomID)) {
                        this.cachedRooms.removeByRoomID(roomID);
                    }
                    else {
                        throw new Error("[ROOM_MANAGER] Could not remove cached room: [" + roomID + "]. Room not found.");
                    }
                };
                RoomManager.prototype.removeObservedRoom = function (roomID) {
                    var room = this.observedRooms.removeByRoomID(roomID);
                    if (room) {
                        room.updateSyncState();
                    }
                    else {
                        this.log.debug("[ROOM_MANAGER] Request to remove observed room [" + roomID + "] ignored; client is not observing room.");
                    }
                };
                RoomManager.prototype.removeOccupiedRoom = function (roomID) {
                    var room = this.occupiedRooms.removeByRoomID(roomID);
                    if (room) {
                        room.updateSyncState();
                    }
                    else {
                        this.log.debug("[ROOM_MANAGER] Request to remove occupied room [" + roomID + "] ignored; client is not in room.");
                    }
                };
                RoomManager.prototype.removeRoom = function (roomID, password) {
                    if (roomID == null || !orbiter_6.Validator.isValidResolvedRoomID(roomID)) {
                        throw new Error("Invalid room id supplied to removeRoom(): [" + roomID + "]. Request not sent.");
                    }
                    if (password == null) {
                        password = '';
                    }
                    var msgMan = this.orbiter.getMessageManager();
                    msgMan.sendUPC(orbiter_6.UPC.REMOVE_ROOM, roomID, password);
                };
                RoomManager.prototype.removeRoomListener = function (e) {
                    var room = e.getItem(), knownReferenceCount = this.getKnownReferenceCount(room.getRoomID());
                    switch (e.target) {
                        case this.occupiedRooms:
                            this.log.debug("[ROOM_MANAGER] Removed occupied room: " + room);
                            if (knownReferenceCount == 0) {
                                this.fireRoomRemoved(room.getQualifier(), room.getRoomID(), room);
                                this.fireRoomCount(this.getNumRooms());
                            }
                            break;
                        case this.observedRooms:
                            this.log.debug("[ROOM_MANAGER] Removed observed room: " + room);
                            if (knownReferenceCount == 0) {
                                this.fireRoomRemoved(room.getQualifier(), room.getRoomID(), room);
                                this.fireRoomCount(this.getNumRooms());
                            }
                            break;
                        case this.watchedRooms:
                            this.log.debug("[ROOM_MANAGER] Removed watched room: " + room);
                            if (knownReferenceCount == 0) {
                                this.fireRoomRemoved(room.getQualifier(), room.getRoomID(), room);
                                this.fireRoomCount(this.getNumRooms());
                            }
                            break;
                        case this.cachedRooms:
                            this.log.debug("[ROOM_MANAGER] Removed cached room: " + room);
                            break;
                    }
                    if (knownReferenceCount == 0 && !this.cachedRooms.contains(room)) {
                        room.shutdown();
                    }
                };
                RoomManager.prototype.removeWatchedRoom = function (roomID) {
                    var room = this.watchedRooms.removeByRoomID(roomID);
                    if (room) {
                        room.updateSyncState();
                    }
                    else {
                        this.log.debug("[ROOM_MANAGER] Request to remove watched room [" + roomID + "] ignored; room not in watched list.");
                    }
                };
                RoomManager.prototype.requestRoom = function (roomID) {
                    if (!roomID) {
                        this.log.warn('[ROOM_MANAGER] requestRoom() failed. Supplied room ID was empty.');
                        return null;
                    }
                    var theRoom = this.getRoom(roomID);
                    if (theRoom) {
                        return theRoom;
                    }
                    else {
                        this.log.debug("[ROOM_MANAGER] Creating new room object for id: [" + roomID + "]");
                        var RoomClass = this.roomClassRegistry.getRoomClass(roomID);
                        theRoom = new RoomClass(roomID, this, this.orbiter.getMessageManager(), this.orbiter.getClientManager(), this.orbiter.getAccountManager(), this.log);
                        return theRoom;
                    }
                };
                RoomManager.prototype.roomIsKnown = function (roomID) {
                    for (var _i = 0, _a = this.getRooms(); _i < _a.length; _i++) {
                        var room = _a[_i];
                        if (room.getRoomID() == roomID) {
                            return true;
                        }
                    }
                    return false;
                };
                RoomManager.prototype.sendMessage = function (messageName, rooms, includeSelf, filters) {
                    var _a;
                    var rest = [];
                    for (var _i = 4; _i < arguments.length; _i++) {
                        rest[_i - 4] = arguments[_i];
                    }
                    if (!messageName) {
                        this.log.warn('[ROOM_MANAGER] sendMessage() failed. No messageName supplied.');
                        return;
                    }
                    var msgMan = this.orbiter.getMessageManager();
                    msgMan.sendUPC.apply(msgMan, __spreadArrays([orbiter_6.UPC.SEND_MESSAGE_TO_ROOMS,
                        messageName,
                        rooms.join(orbiter_6.Tokens.RS),
                        String(includeSelf), (_a = filters === null || filters === void 0 ? void 0 : filters.toXMLString()) !== null && _a !== void 0 ? _a : ''], rest));
                };
                RoomManager.prototype.setWatchedRooms = function (qualifier, newRoomIDs) {
                    for (var _i = 0, _a = this.getRoomsWithQualifier(qualifier); _i < _a.length; _i++) {
                        var room = _a[_i];
                        if (newRoomIDs.indexOf(room.getSimpleRoomID()) == -1) {
                            this.removeWatchedRoom(room.getRoomID());
                        }
                    }
                    for (var _b = 0, newRoomIDs_1 = newRoomIDs; _b < newRoomIDs_1.length; _b++) {
                        var roomID = newRoomIDs_1[_b];
                        var fullRoomID = qualifier + (qualifier != '' ? '.' : '') + roomID;
                        if (!this.watchedRooms.containsRoomID(fullRoomID)) {
                            this.addWatchedRoom(fullRoomID);
                        }
                    }
                };
                RoomManager.prototype.stopWatchingForRooms = function (roomQualifier) {
                    var recursive = false;
                    if (roomQualifier == null) {
                        roomQualifier = '';
                        recursive = true;
                    }
                    var msgMan = this.orbiter.getMessageManager();
                    msgMan.sendUPC(orbiter_6.UPC.STOP_WATCHING_FOR_ROOMS, roomQualifier, recursive.toString());
                };
                RoomManager.prototype.stopWatchingForRoomsResultListener = function (e) {
                    var qualifier = e.getRoomIdQualifier();
                    if (e.getStatus() == orbiter_6.Status.SUCCESS && qualifier) {
                        var unwatchedQualifierIndex = this.watchedQualifiers.indexOf(qualifier);
                        if (unwatchedQualifierIndex != -1) {
                            this.watchedQualifiers.splice(unwatchedQualifierIndex, 1);
                        }
                    }
                };
                RoomManager.prototype.watchForRooms = function (roomQualifier) {
                    var recursive = false;
                    if (roomQualifier == null) {
                        roomQualifier = '';
                        recursive = true;
                    }
                    var msgMan = this.orbiter.getMessageManager();
                    msgMan.sendUPC(orbiter_6.UPC.WATCH_FOR_ROOMS, roomQualifier, recursive.toString());
                };
                RoomManager.prototype.watchForRoomsResultListener = function (e) {
                    var qualifier = e.getRoomIdQualifier();
                    if (e.getStatus() == orbiter_6.Status.SUCCESS && qualifier) {
                        this.watchedQualifiers.push(qualifier);
                    }
                };
                return RoomManager;
            }(net.user1.events.EventDispatcher));
            orbiter_6.RoomManager = RoomManager;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var RoomManagerEvent = (function (_super) {
                __extends(RoomManagerEvent, _super);
                function RoomManagerEvent(type, roomID, status, roomIdQualifier, room, numRooms) {
                    if (numRooms === void 0) { numRooms = -1; }
                    var _this = _super.call(this, type) || this;
                    _this.roomID = roomID;
                    _this.status = status;
                    _this.roomIdQualifier = roomIdQualifier;
                    _this.room = room;
                    _this.numRooms = numRooms;
                    return _this;
                }
                RoomManagerEvent.prototype.getNumRooms = function () {
                    return this.numRooms;
                };
                RoomManagerEvent.prototype.getRoom = function () {
                    var _a;
                    return (_a = this.room) !== null && _a !== void 0 ? _a : null;
                };
                RoomManagerEvent.prototype.getRoomID = function () {
                    if (this.room) {
                        return this.room.getRoomID();
                    }
                    else if (this.roomID == null) {
                        return null;
                    }
                    else {
                        var qualifier = this.getRoomIdQualifier();
                        return qualifier ? qualifier + "." + this.roomID : this.roomID;
                    }
                };
                RoomManagerEvent.prototype.getRoomIdQualifier = function () {
                    var _a;
                    if (this.roomIdQualifier == null && this.room != null) {
                        return this.room.getQualifier();
                    }
                    else {
                        return (_a = this.roomIdQualifier) !== null && _a !== void 0 ? _a : null;
                    }
                };
                RoomManagerEvent.prototype.getSimpleRoomID = function () {
                    var _a;
                    if (this.roomID == null && this.room != null) {
                        return this.room.getSimpleRoomID();
                    }
                    else {
                        return (_a = this.roomID) !== null && _a !== void 0 ? _a : null;
                    }
                };
                RoomManagerEvent.prototype.getStatus = function () {
                    var _a;
                    return (_a = this.status) !== null && _a !== void 0 ? _a : null;
                };
                RoomManagerEvent.prototype.toString = function () {
                    return '[object RoomManagerEvent]';
                };
                RoomManagerEvent.CREATE_ROOM_RESULT = 'CREATE_ROOM_RESULT';
                RoomManagerEvent.REMOVE_ROOM_RESULT = 'REMOVE_ROOM_RESULT';
                RoomManagerEvent.ROOM_ADDED = 'ROOM_ADDED';
                RoomManagerEvent.ROOM_COUNT = 'ROOM_COUNT';
                RoomManagerEvent.ROOM_REMOVED = 'ROOM_REMOVED';
                RoomManagerEvent.STOP_WATCHING_FOR_ROOMS_RESULT = 'STOP_WATCHING_FOR_ROOMS_RESULT';
                RoomManagerEvent.WATCH_FOR_ROOMS_RESULT = 'WATCH_FOR_ROOMS_RESULT';
                return RoomManagerEvent;
            }(net.user1.events.Event));
            orbiter.RoomManagerEvent = RoomManagerEvent;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var RoomManifest = (function () {
                function RoomManifest() {
                    this.observerCount = 0;
                    this.observers = [];
                    this.occupantCount = 0;
                    this.occupants = [];
                }
                RoomManifest.prototype.deserialize = function (roomID, serializedAttributes, clientList, occupantCount, observerCount) {
                    this.attributes = undefined;
                    this.observerCount = observerCount;
                    this.observers = [];
                    this.occupantCount = occupantCount;
                    this.occupants = [];
                    this.roomID = roomID;
                    this.deserializeAttributes(serializedAttributes);
                    this.deserializeClientList(clientList);
                };
                RoomManifest.prototype.deserializeAttributes = function (serializedAttributes) {
                    var attrList = serializedAttributes.split(orbiter.Tokens.RS);
                    this.attributes = new orbiter.AttributeCollection();
                    for (var i = attrList.length - 2; i >= 0; i -= 2) {
                        this.attributes.setAttribute(attrList[i], attrList[i + 1], orbiter.Tokens.GLOBAL_ATTR);
                    }
                };
                RoomManifest.prototype.deserializeClientList = function (clientList) {
                    for (var i = clientList.length - 5; i >= 0; i -= 5) {
                        var clientManifest = new orbiter.ClientManifest();
                        clientManifest.deserialize(clientList[i], clientList[i + 1], undefined, undefined, clientList[i + 3], [this.roomID, clientList[i + 4]]);
                        if (clientList[i + 2] == '0') {
                            this.occupants.push(clientManifest);
                        }
                        else {
                            this.observers.push(clientManifest);
                        }
                    }
                };
                return RoomManifest;
            }());
            orbiter.RoomManifest = RoomManifest;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var RoomModules = (function () {
                function RoomModules() {
                    this.modules = [];
                }
                RoomModules.prototype.addModule = function (identifier, type) {
                    this.modules.push([type, identifier]);
                };
                RoomModules.prototype.serialize = function () {
                    var modulesString = '';
                    for (var i = 0, numModules = this.modules.length; i < numModules; i++) {
                        modulesString += this.modules[i][0] + orbiter.Tokens.RS + this.modules[i][1];
                        if (i < numModules - 1) {
                            modulesString += orbiter.Tokens.RS;
                        }
                    }
                    return modulesString;
                };
                RoomModules.prototype.getIdentifiers = function () {
                    var ids = [];
                    for (var i = 0; i < this.modules.length; i++) {
                        var module = this.modules[i];
                        ids.push(module[1]);
                    }
                    return ids;
                };
                return RoomModules;
            }());
            orbiter.RoomModules = RoomModules;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var RoomSettings = (function () {
                function RoomSettings() {
                    this.maxClients = -1;
                    this.removeOnEmpty = true;
                }
                RoomSettings.prototype.serialize = function () {
                    var _a, _b, _c;
                    return [orbiter.Tokens.REMOVE_ON_EMPTY_ATTR, (_a = this.removeOnEmpty) !== null && _a !== void 0 ? _a : true, orbiter.Tokens.MAX_CLIENTS_ATTR, (_b = this.maxClients) !== null && _b !== void 0 ? _b : -1, orbiter.Tokens.PASSWORD_ATTR, (_c = this.password) !== null && _c !== void 0 ? _c : ''].join(orbiter.Tokens.RS);
                };
                return RoomSettings;
            }());
            orbiter.RoomSettings = RoomSettings;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var RoomSnapshot = (function (_super) {
                    __extends(RoomSnapshot, _super);
                    function RoomSnapshot(roomID, password, updateLevels) {
                        var _this = _super.call(this) || this;
                        _this.method = orbiter.UPC.GET_ROOM_SNAPSHOT;
                        _this.args = [roomID, password, updateLevels != null ? updateLevels.toInt() : ''];
                        _this.hasStatus = true;
                        return _this;
                    }
                    RoomSnapshot.prototype.setManifest = function (value) {
                        this.manifest = value;
                    };
                    RoomSnapshot.prototype.getAttribute = function (name) {
                        var _a, _b, _c;
                        return (_c = (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.getAttribute(name, orbiter.Tokens.GLOBAL_ATTR)) !== null && _c !== void 0 ? _c : null;
                    };
                    RoomSnapshot.prototype.getAttributes = function () {
                        var _a, _b, _c;
                        return (_c = (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.getByScope(orbiter.Tokens.GLOBAL_ATTR)) !== null && _c !== void 0 ? _c : null;
                    };
                    RoomSnapshot.prototype.getRoomID = function () {
                        var _a, _b;
                        return (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.roomID) !== null && _b !== void 0 ? _b : null;
                    };
                    RoomSnapshot.prototype.getOccupants = function () {
                        var _a, _b;
                        return (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.occupants.slice()) !== null && _b !== void 0 ? _b : [];
                    };
                    RoomSnapshot.prototype.getObservers = function () {
                        var _a, _b;
                        return (_b = (_a = this.manifest) === null || _a === void 0 ? void 0 : _a.observers.slice()) !== null && _b !== void 0 ? _b : [];
                    };
                    RoomSnapshot.prototype.getOccupant = function (clientID) {
                        if (!this.manifest)
                            return null;
                        for (var i = this.manifest.occupants.length; --i >= 0;) {
                            if (this.manifest.occupants[i].clientID == clientID) {
                                return this.manifest.occupants[i];
                            }
                        }
                        return null;
                    };
                    RoomSnapshot.prototype.getObserver = function (clientID) {
                        if (!this.manifest)
                            return null;
                        for (var i = this.manifest.observers.length; --i >= 0;) {
                            if (this.manifest.observers[i].clientID == clientID) {
                                return this.manifest.observers[i];
                            }
                        }
                        return null;
                    };
                    RoomSnapshot.prototype.getNumOccupants = function () {
                        return this.manifest ? Math.max(this.manifest.occupants.length, this.manifest.occupantCount) : 0;
                    };
                    RoomSnapshot.prototype.getNumObservers = function () {
                        return this.manifest ? Math.max(this.manifest.observers.length, this.manifest.observerCount) : 0;
                    };
                    return RoomSnapshot;
                }(snapshot.Snapshot));
                snapshot.RoomSnapshot = RoomSnapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var SecureHTTPDirectConnection = (function (_super) {
                __extends(SecureHTTPDirectConnection, _super);
                function SecureHTTPDirectConnection(host, port) {
                    return _super.call(this, host, port, net.user1.orbiter.ConnectionType.SECURE_HTTP) || this;
                }
                SecureHTTPDirectConnection.prototype.buildURL = function () {
                    this.url = "https://" + this.host + ":" + this.port;
                };
                SecureHTTPDirectConnection.prototype.toString = function () {
                    var _a;
                    return "[SecureHTTPDirectConnection, requested host: " + this.requestedHost + ", host: " + ((_a = this.host) !== null && _a !== void 0 ? _a : '') + ", port: " + this.port + ", send-delay: " + this.getSendDelay() + "]";
                };
                return SecureHTTPDirectConnection;
            }(net.user1.orbiter.HTTPDirectConnection));
            orbiter.SecureHTTPDirectConnection = SecureHTTPDirectConnection;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var SecureHTTPIFrameConnection = (function (_super) {
                __extends(SecureHTTPIFrameConnection, _super);
                function SecureHTTPIFrameConnection(host, port) {
                    return _super.call(this, host, port, net.user1.orbiter.ConnectionType.SECURE_HTTP) || this;
                }
                SecureHTTPIFrameConnection.prototype.buildURL = function () {
                    this.url = "https://" + this.host + ":" + this.port;
                };
                SecureHTTPIFrameConnection.prototype.toString = function () {
                    var _a;
                    return "[SecureHTTPIFrameConnection, requested host: " + this.requestedHost + ", host: " + ((_a = (this === null || this === void 0 ? void 0 : this.host) == null) !== null && _a !== void 0 ? _a : '') + ", port: " + this.port + ", send-delay: " + this.getSendDelay() + "]";
                };
                return SecureHTTPIFrameConnection;
            }(net.user1.orbiter.HTTPIFrameConnection));
            orbiter.SecureHTTPIFrameConnection = SecureHTTPIFrameConnection;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var WebSocketConnection = (function (_super) {
                __extends(WebSocketConnection, _super);
                function WebSocketConnection(host, port, type) {
                    if (type === void 0) { type = orbiter.ConnectionType.WEBSOCKET; }
                    return _super.call(this, host, port, type) || this;
                }
                WebSocketConnection.prototype.connect = function () {
                    _super.prototype.connect.call(this);
                    try {
                        this.getNewSocket();
                    }
                    catch (e) {
                        this.deactivateConnection();
                        this.dispatchConnectFailure(e.toString());
                    }
                };
                WebSocketConnection.prototype.deactivateConnection = function () {
                    var _a;
                    (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().debug("[CONNECTION] " + this.toString() + " Deactivating...");
                    this.connectionState = net.user1.orbiter.ConnectionState.DISCONNECTION_IN_PROGRESS;
                    this.deactivateSocket(this.socket);
                    _super.prototype.deactivateConnection.call(this);
                };
                WebSocketConnection.prototype.dispose = function () {
                    _super.prototype.dispose.call(this);
                    this.deactivateSocket(this.socket);
                };
                WebSocketConnection.prototype.send = function (data) {
                    var _a;
                    this.dispatchSendData(data);
                    (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(data);
                };
                WebSocketConnection.prototype.getNewSocket = function () {
                    var _this = this;
                    this.deactivateSocket(this.socket);
                    this.socket = new WebSocket(this.buildURL());
                    this.socket.onopen = function (e) { return _this.connectListener(e); };
                    this.socket.onmessage = function (e) { return _this.dataListener(e); };
                    this.socket.onclose = function (e) { return _this.closeListener(e); };
                    this.socket.onerror = function (e) { return _this.ioErrorListener(e); };
                };
                WebSocketConnection.prototype.buildURL = function () {
                    return "ws://" + this.host + ":" + this.port;
                };
                WebSocketConnection.prototype.closeListener = function (e) {
                    if (this.disposed)
                        return;
                    var state = this.connectionState;
                    this.deactivateConnection();
                    if (state == orbiter.ConnectionState.CONNECTION_IN_PROGRESS) {
                        this.dispatchConnectFailure('WebSocket onclose: Server closed connection before READY state was achieved.');
                    }
                    else {
                        this.dispatchServerKillConnect();
                    }
                };
                WebSocketConnection.prototype.connectListener = function (e) {
                    var _a;
                    if (this.disposed)
                        return;
                    (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().debug(this.toString() + " Socket connected.");
                    this.beginReadyHandshake();
                };
                WebSocketConnection.prototype.dataListener = function (dataEvent) {
                    var _a;
                    if (this.disposed)
                        return;
                    var data = dataEvent.data;
                    this.dispatchReceiveData(data);
                    if (data.indexOf('<U>') == 0) {
                        this.dispatchEvent(new orbiter.ConnectionEvent(orbiter.ConnectionEvent.RECEIVE_UPC, data));
                    }
                    else {
                        (_a = this.orbiter) === null || _a === void 0 ? void 0 : _a.getLog().error(this.toString() + " Received invalid message (not UPC or malformed UPC): " + data);
                    }
                };
                WebSocketConnection.prototype.deactivateSocket = function (oldSocket) {
                    if (!oldSocket)
                        return;
                    if (this.socket) {
                        this.socket.onopen = null;
                        this.socket.onmessage = null;
                        this.socket.onclose = null;
                        this.socket.onerror = null;
                    }
                    try {
                        oldSocket.close();
                    }
                    catch (e) {
                    }
                    this.socket = undefined;
                };
                WebSocketConnection.prototype.ioErrorListener = function (e) {
                    if (this.disposed)
                        return;
                    var state = this.connectionState;
                    this.deactivateConnection();
                    if (state == net.user1.orbiter.ConnectionState.CONNECTION_IN_PROGRESS) {
                        this.dispatchConnectFailure('WebSocket onerror: Server closed connection before READY state was achieved.');
                    }
                    else {
                        this.dispatchServerKillConnect();
                    }
                };
                return WebSocketConnection;
            }(orbiter.Connection));
            orbiter.WebSocketConnection = WebSocketConnection;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var SecureWebSocketConnection = (function (_super) {
                __extends(SecureWebSocketConnection, _super);
                function SecureWebSocketConnection(host, port) {
                    return _super.call(this, host, port, orbiter.ConnectionType.SECURE_WEBSOCKET) || this;
                }
                SecureWebSocketConnection.prototype.buildURL = function () {
                    return "wss://" + this.host + ":" + this.port;
                };
                return SecureWebSocketConnection;
            }(orbiter.WebSocketConnection));
            orbiter.SecureWebSocketConnection = SecureWebSocketConnection;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var SecurityRole;
            (function (SecurityRole) {
                SecurityRole["MODERATOR"] = "MODERATOR";
            })(SecurityRole = orbiter.SecurityRole || (orbiter.SecurityRole = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter_7) {
            var Server = (function (_super) {
                __extends(Server, _super);
                function Server(orbiter) {
                    var _this = _super.call(this) || this;
                    _this.orbiter = orbiter;
                    _this.version = '';
                    _this.localAgeAtLastSync = NaN;
                    _this.lastKnownServerTime = NaN;
                    _this._isWatchingForProcessedUPCs = false;
                    _this.log = _this.orbiter.getLog();
                    _this.orbiter.addEventListener(orbiter_7.OrbiterEvent.READY, _this.readyListener, _this);
                    return _this;
                }
                Server.prototype.cleanup = function () {
                    this.log.info('[SERVER] Cleaning resources.');
                    this.setIsWatchingForProcessedUPCs(false);
                };
                Server.prototype.clearModuleCache = function () {
                    this.orbiter.getMessageManager().sendUPC(orbiter_7.UPC.CLEAR_MODULE_CACHE);
                };
                Server.prototype.dispatchResetUPCStatsResult = function (status) {
                    this.dispatchEvent(new orbiter_7.ServerEvent(orbiter_7.ServerEvent.RESET_UPC_STATS_RESULT, null, status));
                };
                Server.prototype.dispatchStopWatchingForProcessedUPCsResult = function (status) {
                    this.dispatchEvent(new orbiter_7.ServerEvent(orbiter_7.ServerEvent.STOP_WATCHING_FOR_PROCESSED_UPCS_RESULT, null, status));
                };
                Server.prototype.dispatchUPCProcessed = function (record) {
                    this.dispatchEvent(new orbiter_7.ServerEvent(orbiter_7.ServerEvent.UPC_PROCESSED, record));
                };
                Server.prototype.dispatchWatchForProcessedUPCsResult = function (status) {
                    this.dispatchEvent(new orbiter_7.ServerEvent(orbiter_7.ServerEvent.WATCH_FOR_PROCESSED_UPCS_RESULT, null, status));
                };
                Server.prototype.fireTimeSync = function () {
                    this.dispatchEvent(new orbiter_7.ServerEvent(orbiter_7.ServerEvent.TIME_SYNC));
                };
                Server.prototype.getServerTime = function () {
                    var _a;
                    var self = this.orbiter.self();
                    var lastServerTime = NaN, estimatedServerTime = NaN;
                    if (self != null) {
                        lastServerTime = isNaN(this.lastKnownServerTime) ? (_a = self.getConnectTime()) !== null && _a !== void 0 ? _a : 0 : this.lastKnownServerTime;
                        estimatedServerTime = isNaN(lastServerTime) ? NaN : (lastServerTime + (new Date().getTime() - this.localAgeAtLastSync));
                    }
                    if (estimatedServerTime == 0)
                        this.log.warn('Server time requested, but is unknown.');
                    return estimatedServerTime;
                };
                Server.prototype.getUPCVersion = function () {
                    return this.upcVersion;
                };
                Server.prototype.getVersion = function () {
                    return this.version;
                };
                Server.prototype.isWatchingForProcessedUPCs = function () {
                    return this._isWatchingForProcessedUPCs;
                };
                Server.prototype.readyListener = function (e) {
                    this.orbiter.getMessageManager().addMessageListener(orbiter_7.UPC.SERVER_TIME_UPDATE, this.u50);
                    this.localAgeAtLastSync = new Date().getTime();
                };
                Server.prototype.resetUPCStats = function () {
                    this.orbiter.getMessageManager().sendUPC(orbiter_7.UPC.RESET_UPC_STATS);
                };
                Server.prototype.sendMessage = function (messageName, includeSelf, filters) {
                    var _a;
                    if (includeSelf === void 0) { includeSelf = false; }
                    var rest = [];
                    for (var _i = 3; _i < arguments.length; _i++) {
                        rest[_i - 3] = arguments[_i];
                    }
                    if (messageName == null || messageName == '') {
                        this.log.warn('Server.sendMessage() failed. No messageName supplied.');
                        return;
                    }
                    var msgMan = this.orbiter.getMessageManager(), args = [];
                    msgMan.sendUPC.apply(msgMan, __spreadArrays([orbiter_7.UPC.SEND_MESSAGE_TO_SERVER, messageName, includeSelf.toString(), (_a = filters === null || filters === void 0 ? void 0 : filters.toXMLString()) !== null && _a !== void 0 ? _a : ''], rest));
                };
                Server.prototype.sendModuleMessage = function (moduleID, messageName, messageArguments) {
                    var _a;
                    var sendupcArgs = [];
                    for (var arg in messageArguments) {
                        sendupcArgs.push(arg + orbiter_7.Tokens.RS + messageArguments[arg]);
                    }
                    (_a = this.orbiter.getMessageManager()).sendUPC.apply(_a, __spreadArrays([orbiter_7.UPC.SEND_SERVERMODULE_MESSAGE, moduleID, messageName], sendupcArgs));
                };
                Server.prototype.setIsWatchingForProcessedUPCs = function (value) {
                    this._isWatchingForProcessedUPCs = value;
                };
                Server.prototype.setUPCVersion = function (value) {
                    this.upcVersion = value;
                };
                Server.prototype.setVersion = function (value) {
                    this.version = value;
                };
                Server.prototype.stopWatchingForProcessedUPCs = function () {
                    this.orbiter.getMessageManager().sendUPC(orbiter_7.UPC.STOP_WATCHING_FOR_PROCESSED_UPCS);
                };
                Server.prototype.syncTime = function () {
                    var msgMan = this.orbiter.getMessageManager();
                    msgMan.sendUPC(net.user1.orbiter.UPC.SYNC_TIME);
                };
                Server.prototype.u50 = function (newTime) {
                    this.lastKnownServerTime = Number(newTime);
                    this.localAgeAtLastSync = new Date().getTime();
                    this.fireTimeSync();
                };
                Server.prototype.watchForProcessedUPCs = function () {
                    this.orbiter.getMessageManager()
                        .sendUPC(net.user1.orbiter.UPC.WATCH_FOR_PROCESSED_UPCS);
                };
                return Server;
            }(net.user1.events.EventDispatcher));
            orbiter_7.Server = Server;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var ServerEvent = (function (_super) {
                __extends(ServerEvent, _super);
                function ServerEvent(type, upcProcessingRecord, status) {
                    var _this = _super.call(this, type) || this;
                    _this.upcProcessingRecord = upcProcessingRecord;
                    _this.status = status;
                    return _this;
                }
                ServerEvent.prototype.getStatus = function () {
                    return this.status;
                };
                ServerEvent.prototype.getUPCProcessingRecord = function () {
                    return this.upcProcessingRecord;
                };
                ServerEvent.prototype.toString = function () {
                    return '[object ServerEvent]';
                };
                ServerEvent.RESET_UPC_STATS_RESULT = 'RESET_UPC_STATS_RESULT';
                ServerEvent.STOP_WATCHING_FOR_PROCESSED_UPCS_RESULT = 'STOP_WATCHING_FOR_PROCESSED_UPCS_RESULT';
                ServerEvent.TIME_SYNC = 'TIME_SYNC';
                ServerEvent.UPC_PROCESSED = 'UPC_PROCESSED';
                ServerEvent.WATCH_FOR_PROCESSED_UPCS_RESULT = 'WATCH_FOR_PROCESSED_UPCS_RESULT';
                return ServerEvent;
            }(net.user1.events.Event));
            orbiter.ServerEvent = ServerEvent;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var ServerModuleListSnapshot = (function (_super) {
                    __extends(ServerModuleListSnapshot, _super);
                    function ServerModuleListSnapshot() {
                        var _this = _super.call(this) || this;
                        _this.method = orbiter.UPC.GET_SERVERMODULELIST_SNAPSHOT;
                        return _this;
                    }
                    ServerModuleListSnapshot.prototype.setModuleList = function (value) {
                        this.moduleList = value;
                    };
                    ServerModuleListSnapshot.prototype.getModuleList = function () {
                        var _a, _b;
                        return (_b = (_a = this.moduleList) === null || _a === void 0 ? void 0 : _a.slice()) !== null && _b !== void 0 ? _b : null;
                    };
                    return ServerModuleListSnapshot;
                }(snapshot.Snapshot));
                snapshot.ServerModuleListSnapshot = ServerModuleListSnapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var upc;
            (function (upc) {
                var SetAttr = (function () {
                    function SetAttr(name, value, options) {
                        if (value === void 0) { value = ''; }
                        this.name = name;
                        this.value = value;
                        this.options = options;
                        if (!orbiter.Validator.isValidAttributeName(name)) {
                            throw new Error("Cannot set attribute. Illegal name (see Validator.isValidAttributeName()).  Illegal attribute is: " + name + "=" + value);
                        }
                        if (!orbiter.Validator.isValidAttributeValue(value)) {
                            throw new Error("Cannot set attribute. Illegal value (see Validator.isValidAttributeValue()).  Illegal attribute is: " + name + "=" + value);
                        }
                    }
                    return SetAttr;
                }());
                upc.SetAttr = SetAttr;
            })(upc = orbiter.upc || (orbiter.upc = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var upc;
            (function (upc) {
                var SetClientAttr = (function (_super) {
                    __extends(SetClientAttr, _super);
                    function SetClientAttr(name, value, options, scope, clientID, userID) {
                        if (scope === void 0) { scope = orbiter.Tokens.GLOBAL_ATTR; }
                        var _this = _super.call(this, name, value, options) || this;
                        if (!net.user1.orbiter.Validator.isValidAttributeScope(scope)) {
                            throw new Error("Cannot set client attribute. Illegal scope (see Validator.isValidAttributeScope()).  Illegal attribute is: " + name + "=" + value);
                        }
                        _this.method = orbiter.UPC.SET_CLIENT_ATTR;
                        _this.args = [clientID, userID, name, value, scope, options.toString()];
                        return _this;
                    }
                    return SetClientAttr;
                }(upc.SetAttr));
                upc.SetClientAttr = SetClientAttr;
            })(upc = orbiter.upc || (orbiter.upc = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var upc;
            (function (upc) {
                var SetRoomAttr = (function (_super) {
                    __extends(SetRoomAttr, _super);
                    function SetRoomAttr(name, value, options, roomID) {
                        var _this = _super.call(this, name, value, options) || this;
                        _this.method = orbiter.UPC.SET_ROOM_ATTR;
                        _this.args = [roomID, name, value, options.toString()];
                        return _this;
                    }
                    return SetRoomAttr;
                }(upc.SetAttr));
                upc.SetRoomAttr = SetRoomAttr;
            })(upc = orbiter.upc || (orbiter.upc = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot_1) {
                var SnapshotEvent = (function (_super) {
                    __extends(SnapshotEvent, _super);
                    function SnapshotEvent(type, snapshot) {
                        var _this = _super.call(this, type) || this;
                        _this.snapshot = snapshot;
                        return _this;
                    }
                    SnapshotEvent.prototype.toString = function () {
                        return "[object SnapshotEvent]";
                    };
                    SnapshotEvent.LOAD = "LOAD";
                    SnapshotEvent.STATUS = "STATUS";
                    return SnapshotEvent;
                }(net.user1.events.Event));
                snapshot_1.SnapshotEvent = SnapshotEvent;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var SnapshotManager = (function () {
                function SnapshotManager(messageManager) {
                    this.messageManager = messageManager;
                    this.messageManager = messageManager;
                    this.pendingSnapshots = {};
                    this.requestIDCounter = 0;
                }
                SnapshotManager.prototype.receiveAccountListSnapshot = function (requestID, accountList) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received accountlist snapshot for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setAccountList(accountList);
                    this.setLoaded(snapshot, requestID);
                };
                SnapshotManager.prototype.receiveAccountSnapshot = function (requestID, manifest) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received account snapshot for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setManifest(manifest);
                    this.setLoaded(snapshot, requestID);
                };
                SnapshotManager.prototype.receiveBannedListSnapshot = function (requestID, bannedList) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received bannedlist snapshot for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setBannedList(bannedList);
                    this.setLoaded(snapshot, requestID);
                };
                SnapshotManager.prototype.receiveClientCountSnapshot = function (requestID, numClients) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received client-count snapshot for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setCount(numClients);
                    this.setLoaded(snapshot, requestID);
                };
                SnapshotManager.prototype.receiveClientListSnapshot = function (requestID, clientList) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received clientlist snapshot for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setClientList(clientList);
                    this.setLoaded(snapshot, requestID);
                };
                SnapshotManager.prototype.receiveClientSnapshot = function (requestID, manifest) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received client snapshot for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setManifest(manifest);
                    this.setLoaded(snapshot, requestID);
                };
                SnapshotManager.prototype.receiveGatewaysSnapshot = function (requestID, gateways) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received gateways snapshot for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setGateways(gateways);
                    this.setLoaded(snapshot, requestID);
                };
                SnapshotManager.prototype.receiveNodeListSnapshot = function (requestID, nodeList) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received server node list snapshot for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setNodeList(nodeList);
                    this.setLoaded(snapshot, requestID);
                };
                SnapshotManager.prototype.receiveRoomListSnapshot = function (requestID, roomList, qualifier, recursive) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received roomlist snapshot for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setRoomList(roomList);
                    snapshot.setQualifier(qualifier == '' ? undefined : qualifier);
                    snapshot.setRecursive(recursive);
                    this.setLoaded(snapshot, requestID);
                };
                SnapshotManager.prototype.receiveRoomSnapshot = function (requestID, manifest) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received room snapshot for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setManifest(manifest);
                    this.setLoaded(snapshot, requestID);
                };
                SnapshotManager.prototype.receiveServerModuleListSnapshot = function (requestID, moduleList) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received server module list snapshot for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setModuleList(moduleList);
                    this.setLoaded(snapshot, requestID);
                };
                SnapshotManager.prototype.receiveSnapshotResult = function (requestID, status) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received snapshot result for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setStatus(status);
                    this.setStatusReceived(snapshot, requestID);
                };
                SnapshotManager.prototype.receiveUPCStatsSnapshot = function (requestID, totalUPCsProcessed, numUPCsInQueue, lastQueueWaitTime, longestUPCProcesses) {
                    var snapshot = this.pendingSnapshots[requestID];
                    if (!snapshot) {
                        throw new Error("[SNAPSHOT_MANAGER] Received UPC stats snapshot for unknown request ID: [" + requestID + "]");
                    }
                    snapshot.setTotalUPCsProcessed(totalUPCsProcessed);
                    snapshot.setNumUPCsInQueue(numUPCsInQueue);
                    snapshot.setLastQueueWaitTime(lastQueueWaitTime);
                    snapshot.setLongestUPCProcesses(longestUPCProcesses);
                    this.setLoaded(snapshot, requestID);
                };
                SnapshotManager.prototype.setLoaded = function (snapshot, requestID) {
                    snapshot.loaded = true;
                    if (snapshot.hasStatus == false || (snapshot.hasStatus == true && snapshot.statusReceived)) {
                        snapshot.setUpdateInProgress(false);
                        delete this.pendingSnapshots[requestID];
                    }
                    snapshot === null || snapshot === void 0 ? void 0 : snapshot.onLoad();
                    snapshot.dispatchLoaded();
                };
                SnapshotManager.prototype.setStatusReceived = function (snapshot, requestID) {
                    if (snapshot.loaded) {
                        snapshot.setUpdateInProgress(false);
                        delete this.pendingSnapshots[requestID];
                    }
                    snapshot.dispatchStatus();
                };
                SnapshotManager.prototype.updateSnapshot = function (snapshot) {
                    var _a;
                    var _b;
                    if (!snapshot || snapshot.updateInProgress())
                        return;
                    this.requestIDCounter++;
                    snapshot.setUpdateInProgress(true);
                    snapshot.loaded = false;
                    snapshot.statusReceived = false;
                    snapshot.setStatus();
                    this.pendingSnapshots[this.requestIDCounter.toString()] = snapshot;
                    (_a = this.messageManager).sendUPC.apply(_a, __spreadArrays([(_b = snapshot.method) !== null && _b !== void 0 ? _b : '', this.requestIDCounter], snapshot.args.slice(0)));
                };
                return SnapshotManager;
            }());
            orbiter.SnapshotManager = SnapshotManager;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter_8) {
            var Statistics = (function () {
                function Statistics(orbiter) {
                    this.lastTick = NaN;
                    this.lastTotalMessages = 0;
                    this.messagesPerSecond = 0;
                    this.peakMessagesPerSecond = 0;
                    this.statsIntervalID = -1;
                    this.init(orbiter);
                }
                Statistics.prototype.clearStats = function () {
                    this.lastTick = 0;
                    this.lastTotalMessages = 0;
                    this.messagesPerSecond = 0;
                    this.peakMessagesPerSecond = 0;
                };
                Statistics.prototype.getCurrentNumClientsConnected = function () {
                    return this.orbiter.getClientManager().getNumClients();
                };
                Statistics.prototype.getLifetimeNumClientsConnected = function () {
                    return this.orbiter.getClientManager().getLifetimeNumClientsKnown();
                };
                Statistics.prototype.getMessagesPerSecond = function () {
                    return this.messagesPerSecond;
                };
                Statistics.prototype.getPeakMessagesPerSecond = function () {
                    return this.peakMessagesPerSecond;
                };
                Statistics.prototype.getTotalMessages = function () {
                    return this.getTotalMessagesReceived() + this.getTotalMessagesSent();
                };
                Statistics.prototype.getTotalMessagesReceived = function () {
                    return this.orbiter.getMessageManager().getNumMessagesReceived();
                };
                Statistics.prototype.getTotalMessagesSent = function () {
                    return this.orbiter.getMessageManager().getNumMessagesSent();
                };
                Statistics.prototype.init = function (orbiter) {
                    this.setOrbiter(orbiter);
                    this.start();
                };
                Statistics.prototype.setOrbiter = function (orbiter) {
                    this.orbiter = orbiter;
                };
                Statistics.prototype.start = function () {
                    this.stop();
                    this.statsIntervalID = setInterval(this.statsTimerListener, 1000);
                    this.lastTick = new Date().getTime();
                    this.lastTotalMessages = this.getTotalMessages();
                };
                Statistics.prototype.statsTimerListener = function (e) {
                    var now = new Date().getTime(), elapsed = now - this.lastTick;
                    this.lastTick = now;
                    var totalMessages = this.getTotalMessages(), tickNumMsgs = totalMessages - this.lastTotalMessages;
                    this.lastTotalMessages = totalMessages;
                    this.messagesPerSecond = Math.round((1000 / elapsed) * tickNumMsgs);
                    if (this.messagesPerSecond > this.peakMessagesPerSecond) {
                        this.peakMessagesPerSecond = this.messagesPerSecond;
                    }
                };
                Statistics.prototype.stop = function () {
                    clearInterval(this.statsIntervalID);
                    this.clearStats();
                };
                return Statistics;
            }());
            orbiter_8.Statistics = Statistics;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var Status;
            (function (Status) {
                Status["ACCOUNT_EXISTS"] = "ACCOUNT_EXISTS";
                Status["ACCOUNT_NOT_FOUND"] = "ACCOUNT_NOT_FOUND";
                Status["AUTHORIZATION_REQUIRED"] = "AUTHORIZATION_REQUIRED";
                Status["AUTHORIZATION_FAILED"] = "AUTHORIZATION_FAILED";
                Status["ALREADY_ASSIGNED"] = "ALREADY_ASSIGNED";
                Status["ALREADY_BANNED"] = "ALREADY_BANNED";
                Status["ALREADY_IN_ROOM"] = "ALREADY_IN_ROOM";
                Status["ALREADY_LOGGED_IN"] = "ALREADY_LOGGED_IN";
                Status["ALREADY_OBSERVING"] = "ALREADY_OBSERVING";
                Status["ALREADY_SYNCHRONIZED"] = "ALREADY_SYNCHRONIZED";
                Status["ALREADY_WATCHING"] = "ALREADY_WATCHING";
                Status["ATTR_NOT_FOUND"] = "ATTR_NOT_FOUND";
                Status["CLIENT_NOT_FOUND"] = "CLIENT_NOT_FOUND";
                Status["ERROR"] = "ERROR";
                Status["EVALUATION_FAILED"] = "EVALUATION_FAILED";
                Status["DUPLICATE_VALUE"] = "DUPLICATE_VALUE";
                Status["IMMUTABLE"] = "IMMUTABLE";
                Status["INVALID_QUALIFIER"] = "INVALID_QUALIFIER";
                Status["NAME_NOT_FOUND"] = "NAME_NOT_FOUND";
                Status["NAME_EXISTS"] = "NAME_EXISTS";
                Status["NOT_ASSIGNED"] = "NOT_ASSIGNED";
                Status["NOT_BANNED"] = "NOT_BANNED";
                Status["NOT_IN_ROOM"] = "NOT_IN_ROOM";
                Status["NOT_LOGGED_IN"] = "NOT_LOGGED_IN";
                Status["NOT_OBSERVING"] = "NOT_OBSERVING";
                Status["NOT_WATCHING"] = "NOT_WATCHING";
                Status["PERMISSION_DENIED"] = "PERMISSION_DENIED";
                Status["REMOVED"] = "REMOVED";
                Status["ROLE_NOT_FOUND"] = "ROLE_NOT_FOUND";
                Status["ROOM_EXISTS"] = "ROOM_EXISTS";
                Status["ROOM_FULL"] = "ROOM_FULL";
                Status["ROOM_NOT_FOUND"] = "ROOM_NOT_FOUND";
                Status["SERVER_ONLY"] = "SERVER_ONLY";
                Status["SUCCESS"] = "SUCCESS";
            })(Status = orbiter.Status || (orbiter.Status = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var SynchronizationState;
            (function (SynchronizationState) {
                SynchronizationState["NOT_SYNCHRONIZED"] = "NOT_SYNCHRONIZED";
                SynchronizationState["SYNCHRONIZED"] = "SYNCHRONIZED";
                SynchronizationState["SYNCHRONIZING"] = "SYNCHRONIZING";
            })(SynchronizationState = orbiter.SynchronizationState || (orbiter.SynchronizationState = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var System = (function () {
                function System(window) {
                    this.window = window;
                    this.clientType = orbiter.Product.clientType;
                    this.clientVersion = orbiter.Product.clientVersion;
                    this.upcVersion = orbiter.Product.upcVersion;
                }
                System.prototype.getClientType = function () {
                    return this.clientType;
                };
                System.prototype.getClientVersion = function () {
                    return this.clientVersion;
                };
                System.prototype.getUPCVersion = function () {
                    return this.upcVersion;
                };
                System.prototype.hasHTTPDirectConnection = function () {
                    return (typeof XMLHttpRequest != 'undefined' && typeof new XMLHttpRequest().withCredentials != 'undefined') || (typeof XDomainRequest != 'undefined' && this.window != null && this.window.location.protocol != 'file:') || (this.window == null && typeof XMLHttpRequest != 'undefined');
                };
                System.prototype.hasWebSocket = function () {
                    return (typeof WebSocket !== 'undefined' || typeof MozWebSocket !== 'undefined');
                };
                System.prototype.isJavaScriptCompatible = function () {
                    if (!this.window && typeof XMLHttpRequest != 'undefined') {
                        return true;
                    }
                    if (this.window) {
                        if (typeof XMLHttpRequest != 'undefined' &&
                            typeof new XMLHttpRequest().withCredentials != 'undefined') {
                            return true;
                        }
                        if (typeof XDomainRequest != 'undefined' && this.window.location.protocol != 'file:') {
                            return true;
                        }
                        if (this.window.postMessage != null) {
                            return true;
                        }
                    }
                    return false;
                };
                System.prototype.toString = function () {
                    return '[object System]';
                };
                return System;
            }());
            orbiter.System = System;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var Tokens;
            (function (Tokens) {
                Tokens["CUSTOM_CLASS_ATTR"] = "_CLASS";
                Tokens["GLOBAL_ATTR"] = "";
                Tokens["MAX_CLIENTS_ATTR"] = "_MAX_CLIENTS";
                Tokens["PASSWORD_ATTR"] = "_PASSWORD";
                Tokens["REMOVE_ON_EMPTY_ATTR"] = "_DIE_ON_EMPTY";
                Tokens["ROLES_ATTR"] = "_ROLES";
                Tokens["RS"] = "|";
                Tokens["WILDCARD"] = "*";
            })(Tokens = orbiter.Tokens || (orbiter.Tokens = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var UPCProcessingRecord = (function () {
                function UPCProcessingRecord() {
                    this.UPCSource = null;
                    this.fromClientAddress = null;
                    this.fromClientID = null;
                    this.fromUserID = null;
                    this.processingDuration = NaN;
                    this.processingFinishedAt = NaN;
                    this.processingStartedAt = NaN;
                    this.queueDuration = NaN;
                    this.queuedAt = NaN;
                }
                UPCProcessingRecord.prototype.deserialize = function (serializedRecord) {
                    var recordParts = [], numSignificantSeparators = 6;
                    var thisSeparatorIndex = 0, previousSeparatorIndex = -1;
                    for (var i = 0; i < numSignificantSeparators; i++) {
                        thisSeparatorIndex =
                            serializedRecord.indexOf(orbiter.Tokens.RS, previousSeparatorIndex + 1);
                        recordParts.push(serializedRecord.substring(previousSeparatorIndex + 1, thisSeparatorIndex));
                        previousSeparatorIndex = thisSeparatorIndex;
                    }
                    recordParts.push(serializedRecord.substring(thisSeparatorIndex + 1));
                    this.deserializeParts(recordParts[0], recordParts[1], recordParts[2], recordParts[3], recordParts[4], recordParts[5], recordParts[6]);
                };
                UPCProcessingRecord.prototype.deserializeParts = function (fromClientID, fromUserID, fromClientAddress, queuedAt, processingStartedAt, processingFinishedAt, source) {
                    var escapedCDStart = /<!\(\[CDATA\[/gi, escapedCDEnd = /\]\]\)>/gi;
                    this.fromClientID = fromClientID;
                    this.fromUserID = fromUserID;
                    this.fromClientAddress = fromClientAddress;
                    this.processingStartedAt = parseFloat(processingStartedAt);
                    this.processingFinishedAt = parseFloat(processingFinishedAt);
                    this.processingDuration = this.processingFinishedAt - this.processingStartedAt;
                    this.queuedAt = parseFloat(queuedAt);
                    this.queueDuration = this.processingStartedAt - this.queuedAt;
                    this.UPCSource = source.replace(escapedCDStart, '<![CDATA[').replace(escapedCDEnd, ']]>');
                };
                return UPCProcessingRecord;
            }());
            orbiter.UPCProcessingRecord = UPCProcessingRecord;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var snapshot;
            (function (snapshot) {
                var UPCStatsSnapshot = (function (_super) {
                    __extends(UPCStatsSnapshot, _super);
                    function UPCStatsSnapshot() {
                        var _this = _super.call(this) || this;
                        _this.totalUPCsProcessed = 0;
                        _this.numUPCsInQueue = 0;
                        _this.lastQueueWaitTime = 0;
                        _this.method = orbiter.UPC.GET_UPC_STATS_SNAPSHOT;
                        _this.hasStatus = true;
                        return _this;
                    }
                    UPCStatsSnapshot.prototype.getLastQueueWaitTime = function () {
                        return this.lastQueueWaitTime;
                    };
                    UPCStatsSnapshot.prototype.getLongestUPCProcesses = function () {
                        var _a, _b;
                        return (_b = (_a = this.longestUPCProcesses) === null || _a === void 0 ? void 0 : _a.slice()) !== null && _b !== void 0 ? _b : null;
                    };
                    UPCStatsSnapshot.prototype.getNumUPCsInQueue = function () {
                        return this.numUPCsInQueue;
                    };
                    UPCStatsSnapshot.prototype.getTotalUPCsProcessed = function () {
                        return this.totalUPCsProcessed;
                    };
                    UPCStatsSnapshot.prototype.setLastQueueWaitTime = function (value) {
                        this.lastQueueWaitTime = value;
                    };
                    UPCStatsSnapshot.prototype.setLongestUPCProcesses = function (value) {
                        this.longestUPCProcesses = value;
                    };
                    UPCStatsSnapshot.prototype.setNumUPCsInQueue = function (value) {
                        this.numUPCsInQueue = value;
                    };
                    UPCStatsSnapshot.prototype.setTotalUPCsProcessed = function (value) {
                        this.totalUPCsProcessed = value;
                    };
                    return UPCStatsSnapshot;
                }(snapshot.Snapshot));
                snapshot.UPCStatsSnapshot = UPCStatsSnapshot;
            })(snapshot = orbiter.snapshot || (orbiter.snapshot = {}));
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var UpdateLevels = (function () {
                function UpdateLevels() {
                    this.roomMessages = false;
                    this.sharedRoomAttributes = false;
                    this.occupantCount = false;
                    this.observerCount = false;
                    this.occupantList = false;
                    this.observerList = false;
                    this.sharedOccupantAttributesRoom = false;
                    this.sharedOccupantAttributesGlobal = false;
                    this.sharedObserverAttributesRoom = false;
                    this.sharedObserverAttributesGlobal = false;
                    this.occupantLoginLogoff = false;
                    this.observerLoginLogoff = false;
                    this.allRoomAttributes = false;
                    this.restoreDefaults();
                }
                UpdateLevels.prototype.clearAll = function () {
                    this.roomMessages = false;
                    this.sharedRoomAttributes = false;
                    this.occupantCount = false;
                    this.observerCount = false;
                    this.occupantList = false;
                    this.observerList = false;
                    this.sharedOccupantAttributesRoom = false;
                    this.sharedOccupantAttributesGlobal = false;
                    this.sharedObserverAttributesRoom = false;
                    this.sharedObserverAttributesGlobal = false;
                    this.occupantLoginLogoff = false;
                    this.observerLoginLogoff = false;
                    this.allRoomAttributes = false;
                };
                UpdateLevels.prototype.fromInt = function (levels) {
                    this.roomMessages = (levels & UpdateLevels.FLAG_ROOM_MESSAGES) != 0;
                    this.sharedRoomAttributes = (levels & UpdateLevels.FLAG_SHARED_ROOM_ATTRIBUTES) != 0;
                    this.occupantCount = (levels & UpdateLevels.FLAG_OCCUPANT_COUNT) != 0;
                    this.observerCount = (levels & UpdateLevels.FLAG_OBSERVER_COUNT) != 0;
                    this.occupantList = (levels & UpdateLevels.FLAG_OCCUPANT_LIST) != 0;
                    this.observerList = (levels & UpdateLevels.FLAG_OBSERVER_LIST) != 0;
                    this.sharedOccupantAttributesRoom = (levels & UpdateLevels.FLAG_SHARED_OCCUPANT_ATTRIBUTES_ROOM) != 0;
                    this.sharedOccupantAttributesGlobal = (levels & UpdateLevels.FLAG_SHARED_OCCUPANT_ATTRIBUTES_GLOBAL) != 0;
                    this.sharedObserverAttributesRoom = (levels & UpdateLevels.FLAG_SHARED_OBSERVER_ATTRIBUTES_ROOM) != 0;
                    this.sharedObserverAttributesGlobal = (levels & UpdateLevels.FLAG_SHARED_OBSERVER_ATTRIBUTES_GLOBAL) != 0;
                    this.occupantLoginLogoff = (levels & UpdateLevels.FLAG_OCCUPANT_LOGIN_LOGOFF) != 0;
                    this.observerLoginLogoff = (levels & UpdateLevels.FLAG_OBSERVER_LOGIN_LOGOFF) != 0;
                    this.allRoomAttributes = (levels & UpdateLevels.FLAG_ALL_ROOM_ATTRIBUTES) != 0;
                };
                UpdateLevels.prototype.restoreDefaults = function () {
                    this.roomMessages = true;
                    this.sharedRoomAttributes = true;
                    this.occupantCount = false;
                    this.observerCount = false;
                    this.occupantList = true;
                    this.observerList = false;
                    this.sharedOccupantAttributesRoom = true;
                    this.sharedOccupantAttributesGlobal = true;
                    this.sharedObserverAttributesRoom = false;
                    this.sharedObserverAttributesGlobal = false;
                    this.occupantLoginLogoff = true;
                    this.observerLoginLogoff = false;
                    this.allRoomAttributes = false;
                };
                UpdateLevels.prototype.toInt = function () {
                    return (this.roomMessages ? UpdateLevels.FLAG_ROOM_MESSAGES : 0) |
                        (this.sharedRoomAttributes ? UpdateLevels.FLAG_SHARED_ROOM_ATTRIBUTES : 0) |
                        (this.occupantCount ? UpdateLevels.FLAG_OCCUPANT_COUNT : 0) |
                        (this.observerCount ? UpdateLevels.FLAG_OBSERVER_COUNT : 0) |
                        (this.occupantList ? UpdateLevels.FLAG_OCCUPANT_LIST : 0) |
                        (this.observerList ? UpdateLevels.FLAG_OBSERVER_LIST : 0) |
                        (this.sharedOccupantAttributesRoom ? UpdateLevels.FLAG_SHARED_OCCUPANT_ATTRIBUTES_ROOM : 0) |
                        (this.sharedOccupantAttributesGlobal ? UpdateLevels.FLAG_SHARED_OCCUPANT_ATTRIBUTES_GLOBAL : 0) |
                        (this.sharedObserverAttributesRoom ? UpdateLevels.FLAG_SHARED_OBSERVER_ATTRIBUTES_ROOM : 0) |
                        (this.sharedObserverAttributesGlobal ? UpdateLevels.FLAG_SHARED_OBSERVER_ATTRIBUTES_GLOBAL : 0) |
                        (this.occupantLoginLogoff ? UpdateLevels.FLAG_OCCUPANT_LOGIN_LOGOFF : 0) |
                        (this.observerLoginLogoff ? UpdateLevels.FLAG_OBSERVER_LOGIN_LOGOFF : 0) |
                        (this.allRoomAttributes ? UpdateLevels.FLAG_ALL_ROOM_ATTRIBUTES : 0);
                };
                UpdateLevels.FLAG_ALL_ROOM_ATTRIBUTES = 1 << 12;
                UpdateLevels.FLAG_OBSERVER_COUNT = 1 << 3;
                UpdateLevels.FLAG_OBSERVER_LIST = 1 << 5;
                UpdateLevels.FLAG_OBSERVER_LOGIN_LOGOFF = 1 << 11;
                UpdateLevels.FLAG_OCCUPANT_COUNT = 1 << 2;
                UpdateLevels.FLAG_OCCUPANT_LIST = 1 << 4;
                UpdateLevels.FLAG_OCCUPANT_LOGIN_LOGOFF = 1 << 10;
                UpdateLevels.FLAG_ROOM_MESSAGES = 1;
                UpdateLevels.FLAG_SHARED_OBSERVER_ATTRIBUTES_GLOBAL = 1 << 9;
                UpdateLevels.FLAG_SHARED_OBSERVER_ATTRIBUTES_ROOM = 1 << 7;
                UpdateLevels.FLAG_SHARED_OCCUPANT_ATTRIBUTES_GLOBAL = 1 << 8;
                UpdateLevels.FLAG_SHARED_OCCUPANT_ATTRIBUTES_ROOM = 1 << 6;
                UpdateLevels.FLAG_SHARED_ROOM_ATTRIBUTES = 1 << 1;
                return UpdateLevels;
            }());
            orbiter.UpdateLevels = UpdateLevels;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var UserAccount = (function (_super) {
                __extends(UserAccount, _super);
                function UserAccount(userID, log, accountManager, clientManager, roomManager) {
                    if (clientManager === void 0) { clientManager = null; }
                    if (roomManager === void 0) { roomManager = null; }
                    var _this = _super.call(this) || this;
                    _this.userID = userID;
                    _this.log = log;
                    _this.accountManager = accountManager;
                    _this.clientManager = clientManager;
                    _this.roomManager = roomManager;
                    _this.connectionState = 0;
                    return _this;
                }
                UserAccount.prototype.addRole = function (role) {
                    this.accountManager.addRole(this.getUserID(), role);
                };
                UserAccount.prototype.changePassword = function (newPassword, oldPassword) {
                    this.accountManager.changePassword(this.getUserID(), newPassword, oldPassword);
                };
                UserAccount.prototype.deleteAttribute = function (attrName, attrScope) {
                    var _a;
                    var deleteRequest = new orbiter.upc.RemoveClientAttr(undefined, this.getUserID(), attrName, attrScope);
                    (_a = this.attributeManager) === null || _a === void 0 ? void 0 : _a.deleteAttribute(deleteRequest);
                };
                UserAccount.prototype.doLoginTasks = function () {
                    this.fireLogin();
                };
                UserAccount.prototype.doLogoffTasks = function () {
                    this.setClient(undefined);
                    this.fireLogoff();
                };
                UserAccount.prototype.fireAddRoleResult = function (role, status) {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.ADD_ROLE_RESULT, status, this.getUserID(), (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID(), role);
                    this.dispatchEvent(e);
                };
                UserAccount.prototype.fireChangePassword = function () {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.CHANGE_PASSWORD, orbiter.Status.SUCCESS, this.getUserID(), (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID());
                    this.dispatchEvent(e);
                };
                UserAccount.prototype.fireChangePasswordResult = function (status) {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.CHANGE_PASSWORD_RESULT, status, this.getUserID(), (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID());
                    this.dispatchEvent(e);
                };
                UserAccount.prototype.fireLogin = function () {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.LOGIN, orbiter.Status.SUCCESS, this.getUserID(), (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID());
                    this.dispatchEvent(e);
                };
                UserAccount.prototype.fireLogoff = function () {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.LOGOFF, orbiter.Status.SUCCESS, this.getUserID(), (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID());
                    this.dispatchEvent(e);
                };
                UserAccount.prototype.fireLogoffResult = function (status) {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.LOGOFF_RESULT, status, this.getUserID(), (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID());
                    this.dispatchEvent(e);
                };
                UserAccount.prototype.fireObserve = function () {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.OBSERVE, orbiter.Status.SUCCESS, this.getUserID(), (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID());
                    this.dispatchEvent(e);
                };
                UserAccount.prototype.fireObserveResult = function (status) {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.OBSERVE_RESULT, status, this.getUserID(), (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID());
                    this.dispatchEvent(e);
                };
                UserAccount.prototype.fireRemoveRoleResult = function (role, status) {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.REMOVE_ROLE_RESULT, status, this.getUserID(), (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID(), role);
                    this.dispatchEvent(e);
                };
                UserAccount.prototype.fireStopObserving = function () {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.STOP_OBSERVING, orbiter.Status.SUCCESS, this.getUserID(), (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID());
                    this.dispatchEvent(e);
                };
                UserAccount.prototype.fireStopObservingResult = function (status) {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.STOP_OBSERVING_RESULT, status, this.getUserID(), (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID());
                    this.dispatchEvent(e);
                };
                UserAccount.prototype.fireSynchronize = function () {
                    var _a;
                    var e = new orbiter.AccountEvent(orbiter.AccountEvent.SYNCHRONIZE, orbiter.Status.SUCCESS, this.getUserID(), (_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID());
                    this.dispatchEvent(e);
                };
                UserAccount.prototype.getAccountManager = function () {
                    return this.accountManager;
                };
                UserAccount.prototype.getAttribute = function (attrName, attrScope) {
                    var _a, _b;
                    return (_b = (_a = this.attributeManager) === null || _a === void 0 ? void 0 : _a.getAttribute(attrName, attrScope)) !== null && _b !== void 0 ? _b : null;
                };
                UserAccount.prototype.getAttributeCollection = function () {
                    var _a, _b;
                    return (_b = (_a = this.attributeManager) === null || _a === void 0 ? void 0 : _a.getAttributeCollection()) !== null && _b !== void 0 ? _b : null;
                };
                UserAccount.prototype.getAttributeManager = function () {
                    var _a;
                    return (_a = this.attributeManager) !== null && _a !== void 0 ? _a : null;
                };
                UserAccount.prototype.getAttributes = function () {
                    var _a, _b;
                    return (_b = (_a = this.attributeManager) === null || _a === void 0 ? void 0 : _a.getAttributes()) !== null && _b !== void 0 ? _b : null;
                };
                UserAccount.prototype.getAttributesByScope = function (scope) {
                    var _a, _b;
                    return (_b = (_a = this.attributeManager) === null || _a === void 0 ? void 0 : _a.getAttributesByScope(scope)) !== null && _b !== void 0 ? _b : null;
                };
                UserAccount.prototype.getClient = function () {
                    var _a;
                    this.validateClientReference();
                    if (!this.client)
                        return null;
                    return (_a = this.client.getCustomClient()) !== null && _a !== void 0 ? _a : this.client;
                };
                UserAccount.prototype.getClientManager = function () {
                    return this.clientManager;
                };
                UserAccount.prototype.getConnectionState = function () {
                    var _a;
                    if (this.getInternalClient() != null) {
                        return orbiter.ConnectionState.LOGGED_IN;
                    }
                    else if (!this.accountManager.isObservingAccount(this.getUserID())) {
                        return orbiter.ConnectionState.NOT_CONNECTED;
                    }
                    else if ((_a = this.clientManager) === null || _a === void 0 ? void 0 : _a.isWatchingForClients()) {
                        return orbiter.ConnectionState.NOT_CONNECTED;
                    }
                    else {
                        return orbiter.ConnectionState.UNKNOWN;
                    }
                };
                UserAccount.prototype.getInternalClient = function () {
                    var _a;
                    this.validateClientReference();
                    return (_a = this.client) !== null && _a !== void 0 ? _a : null;
                };
                UserAccount.prototype.getLog = function () {
                    return this.log;
                };
                UserAccount.prototype.getRoomManager = function () {
                    return this.roomManager;
                };
                UserAccount.prototype.getUserID = function () {
                    return this.userID;
                };
                UserAccount.prototype.isLoggedIn = function () {
                    return this.getConnectionState() == orbiter.ConnectionState.LOGGED_IN;
                };
                UserAccount.prototype.isModerator = function () {
                    var rolesAttr = this.getAttribute(orbiter.Tokens.ROLES_ATTR);
                    if (rolesAttr != null) {
                        return (parseInt(rolesAttr) & UserAccount.FLAG_MODERATOR) > 0;
                    }
                    else {
                        this.getLog().warn(this.toString() + " Could not determine moderator status because the account is not synchronized.");
                        return false;
                    }
                };
                UserAccount.prototype.isSelf = function () {
                    var _a, _b;
                    return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.isSelf()) !== null && _b !== void 0 ? _b : false;
                };
                UserAccount.prototype.logoff = function (password) {
                    this.accountManager.logoff(this.getUserID(), password);
                };
                UserAccount.prototype.observe = function () {
                    this.accountManager.observeAccount(this.getUserID());
                };
                UserAccount.prototype.removeRole = function (userID, role) {
                    this.accountManager.removeRole(this.getUserID(), role);
                };
                UserAccount.prototype.setAttribute = function (attrName, attrValue, attrScope, isShared, evaluate) {
                    var _a;
                    var attrOptions = orbiter.AttributeOptions.FLAG_PERSISTENT |
                        (isShared ? orbiter.AttributeOptions.FLAG_SHARED : 0) |
                        (evaluate ? orbiter.AttributeOptions.FLAG_EVALUATE : 0);
                    (_a = this.attributeManager) === null || _a === void 0 ? void 0 : _a.setAttribute(new orbiter.upc.SetClientAttr(attrName, attrValue, attrOptions, attrScope, undefined, this.getUserID()));
                };
                ;
                UserAccount.prototype.setAttributeManager = function (value) {
                    this.attributeManager = value;
                };
                UserAccount.prototype.setClient = function (value) {
                    if (!value) {
                        this.client = undefined;
                    }
                    else {
                        if (this.client != value) {
                            this.client = value;
                            this.client.setAccount(this);
                        }
                    }
                };
                UserAccount.prototype.setUserID = function (userID) {
                    if (this.userID != userID) {
                        this.userID = userID;
                    }
                };
                UserAccount.prototype.stopObserving = function () {
                    this.accountManager.stopObservingAccount(this.getUserID());
                };
                UserAccount.prototype.toString = function () {
                    var _a;
                    return "[USER_ACCOUNT userid: " + this.getUserID() + ", clientid: " + ((_a = this.client) === null || _a === void 0 ? void 0 : _a.getClientID()) + "]";
                };
                UserAccount.prototype.validateClientReference = function () {
                    if (this.client && this.roomManager && this.clientManager) {
                        if (!this.client.isSelf() && !this.clientManager.isWatchingForClients() &&
                            !this.accountManager.isObservingAccount(this.getUserID()) &&
                            !this.clientManager.isObservingClient(this.client.getClientID()) &&
                            !this.roomManager.clientIsKnown(this.client.getClientID())) {
                            this.setClient();
                        }
                    }
                };
                UserAccount.FLAG_MODERATOR = 1 << 1;
                return UserAccount;
            }(net.user1.events.EventDispatcher));
            orbiter.UserAccount = UserAccount;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var net;
(function (net) {
    var user1;
    (function (user1) {
        var orbiter;
        (function (orbiter) {
            var Validator = (function () {
                function Validator() {
                }
                Validator.isValidAttributeName = function (value) {
                    if (!value) {
                        return false;
                    }
                    return value.indexOf(net.user1.orbiter.Tokens.RS) == -1;
                };
                Validator.isValidAttributeScope = function (value) {
                    if (value) {
                        return this.isValidResolvedRoomID(value);
                    }
                    else {
                        return true;
                    }
                };
                Validator.isValidAttributeValue = function (value) {
                    if (typeof value != 'string') {
                        value = value.toString();
                    }
                    return value.indexOf(net.user1.orbiter.Tokens.RS) == -1;
                };
                Validator.isValidModuleName = function (value) {
                    if (value == '') {
                        return false;
                    }
                    return value.indexOf(net.user1.orbiter.Tokens.RS) == -1;
                };
                Validator.isValidPassword = function (value) {
                    return !(value != null && value.indexOf(net.user1.orbiter.Tokens.RS) != -1);
                };
                Validator.isValidResolvedRoomID = function (value) {
                    if (!value) {
                        return false;
                    }
                    if (value.indexOf(net.user1.orbiter.Tokens.RS) != -1) {
                        return false;
                    }
                    return value.indexOf(net.user1.orbiter.Tokens.WILDCARD) == -1;
                };
                Validator.isValidRoomID = function (value) {
                    if (!value) {
                        return false;
                    }
                    if (value.indexOf('.') != -1) {
                        return false;
                    }
                    if (value.indexOf(net.user1.orbiter.Tokens.RS) != -1) {
                        return false;
                    }
                    return value.indexOf(net.user1.orbiter.Tokens.WILDCARD) == -1;
                };
                Validator.isValidRoomQualifier = function (value) {
                    if (!value) {
                        return false;
                    }
                    if (value == '*') {
                        return true;
                    }
                    if (value.indexOf(net.user1.orbiter.Tokens.RS) != -1) {
                        return false;
                    }
                    return value.indexOf(net.user1.orbiter.Tokens.WILDCARD) == -1;
                };
                return Validator;
            }());
            orbiter.Validator = Validator;
        })(orbiter = user1.orbiter || (user1.orbiter = {}));
    })(user1 = net.user1 || (net.user1 = {}));
})(net || (net = {}));
var integer;
(function (integer) {
    integer[integer["MAX_VALUE"] = Math.pow(2, 32) - 1] = "MAX_VALUE";
})(integer || (integer = {}));
