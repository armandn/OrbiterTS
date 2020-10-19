namespace net.user1.orbiter
{
	import Logger = net.user1.logger.Logger;

	/**
	 * The MessageManager class provides a set of services related to sending and receiving messages
	 * between the client and server. Each connection has only one MessageManager, which is created
	 * automatically, and can be accessed via getMessageManager() method.
	 */
	export class MessageManager
	{
		removeListenersOnDisconnect:boolean = true;
		private connectionManager?:ConnectionManager;
		private currentConnection?:Connection;
		private messageListeners:{[key:string]:MessageListener[]} = {};
		private numMessagesReceived:number = 0;
		private numMessagesSent:number = 0;

		constructor(private log?:Logger, connectionManager?:ConnectionManager)
		{
			this.connectionManager = connectionManager;
			this.connectionManager?.addEventListener(ConnectionManagerEvent.SELECT_CONNECTION, this.selectConnectionListener, this);
		}

		/**
		 * Registers a method or function (hereafter, the "message listener") to be executed when
		 * the specified type of message is received from the server. The message can be a built-in
		 * UPC message, or a custom message sent to the client by a server-side module or by another
		 * client via the sendMessage() method of the Room, RoomManager, Client, ClientManager, or
		 * Server classes. Messages listeners are executed in the order they were added.
		 *
		 * Typically, [[MessageManager.addMessageListener]] method is not used to register listeners
		 * for messages sent via [[Room.sendMessage]] method. Messages sent to a single room via
		 * Room's sendMessage() method are normally handled by listeners registered using the Room
		 * class's addMessageListener() method instead of MessageManager's addMessageListener(). The
		 * Room class's version of addMessageListener() provides a convenient wrapper for the
		 * functionality provided by MessageManager's addMessageListener().
		 *
		 * MessageManager's addMessageListener() method can be used to register listeners that
		 * handle messages centrally for a group of rooms. For example, suppose a multi-room chat
		 * application displays a notification icon when a new message is received in any room. To
		 * catch all incoming messages for all rooms, the application registers a single,
		 * centralized method for all "CHAT" messages.
		 * @param message    The name of the message the listener is registering to receive.
		 * @param listener   The function or method that will be invoked when the specified message
		 *                   is received. The rules describing the required datatypes of the
		 *                   listener's parameters are listed under the addMessageListener() method
		 *                   documentation.
		 * @param thisArg
		 * @param forRoomIDs A list of room IDs. If the message was sent to any of the rooms in
		 *                   the list, the listener is executed. Otherwise, the listener is not
		 *                   executed. Applies to messages sent to rooms only, not to messages sent
		 *                   to specific individual clients or the entire server.
		 */
		addMessageListener(message:string, listener:Function, thisArg?:any, forRoomIDs?:string[]):boolean
		{
			if (forRoomIDs && !Array.isArray(forRoomIDs)) throw new Error(`[MESSAGE_MANAGER] Illegal argument type  supplied for addMessageListener()'s forRoomIDs parameter. Value must be an array.`);

			// Each message gets a list of MessageListener objects.
			// If this message has no such list, make one.
			this.messageListeners[message] = this.messageListeners[message] ?? [];

			const listenerArray = this.messageListeners[message];

			// Quit if the listener is already registered
			if (this.hasMessageListener(message, listener)) return false;

			// Add the listener
			const newListener = new MessageListener(listener, forRoomIDs, thisArg);
			listenerArray.push(newListener);
			return true;
		}

		dispose():void
		{
			this.log?.info('[MESSAGE_MANAGER] Disposing resources.');

			this.log = undefined;

			//@ts-ignore;
			this.messageListeners = undefined;

			this.numMessagesSent = 0;
			this.numMessagesReceived = 0;
			this.currentConnection = undefined;
		}

		/**
		 * @internal
		 * @param {string} message
		 * @return {net.user1.orbiter.MessageListener[]}
		 */
		getMessageListeners(message:string):MessageListener[]
		{
			return this.messageListeners[message] ?? [];
		}

		/**
		 * Returns the number of messages that have been received by the
		 * MessageManager. Used for statistics tracking and load testing.
		 */
		getNumMessagesReceived():number
		{
			return this.numMessagesReceived;
		}

		/**
		 * Returns the number of messages that have been sent by the
		 * MessageManager. Used for statistics tracking and load testing.
		 */
		getNumMessagesSent():number
		{
			return this.numMessagesSent;
		}

		/**
		 * Returns the number of messages that have been sent and received by the
		 * MessageManager. Used for statistics tracking and load testing.
		 */
		getTotalMessages():number
		{
			return this.numMessagesSent + this.numMessagesReceived;
		}

		/**
		 * Returns a Boolean indicating whether the specified listener function is currently
		 * registered to receive message notifications for the specified message.
		 */
		hasMessageListener(message:string, listener:Function):boolean
		{
			// Quit if the message has no listeners
			const listenerArray = this.messageListeners[message];
			if (!listenerArray) return false;

			// Check for the listener
			for (let i = 0; i < listenerArray.length; i++)
			{
				if (listenerArray[i].getListenerFunction() == listener) return true;
			}
			return false;
		}

		/**
		 * @internal
		 */
		notifyMessageListeners(message:string, args:any[]):void
		{
			// Retrieve the list of listeners for this message.
			let listeners = this.messageListeners[message];
			// If there are no listeners registered, then quit
			if (listeners === undefined)
			{
				// Log a warning if it's not a UPC
				if (!(message.charAt(0) == 'u' && parseInt(message.substring(1)) > 1))
				{
					this.log?.warn(`Message delivery failed. No listeners found. Message: ${message}. Arguments: ${args.join()}`);
				}
				return;
			}
			else
			{
				listeners = listeners.slice(0);
			}

			for (const listener of listeners)
			{
				listener.getListenerFunction().apply(listener.getThisArg(), args);
			}
		}

		/**
		 * Unregisters a message listener method that was earlier registered for message
		 * notifications via addMessageListener().
		 *
		 * Note that by default, all message listeners are automatically removed when the connection
		 * to the server is closed.
		 */
		removeMessageListener(message:string, listener:Function):boolean
		{
			// Quit if the message has no listeners
			const listenerArray = this.messageListeners[message];
			if (!listenerArray) return false;

			// Remove the listener
			let foundListener = false;
			for (let i = 0; i < listenerArray.length; i++)
			{
				if (listenerArray[i].getListenerFunction() == listener)
				{
					foundListener = true;
					listenerArray.splice(i, 1);
					break;
				}
			}

			// Delete the listeners array if it's now empty
			if (listenerArray.length == 0) delete this.messageListeners[message];

			return foundListener;
		}

		/**
		 * Creates and sends a UPC-formatted message to the server. This method is used internally
		 * to send UPC-formatted messages to the server. Any UPC-formatted response from the server
		 * will trigger a ConnectionEvent.RECEIVED_UPC event.
		 */
		sendUPC(message:string, ...args:(string|number|undefined)[]):void
		{
			// Quit if the connection isn't ready...
			if (!this.connectionManager?.isReady())
			{
				this.log?.warn(`[MESSAGE_MANAGER] Connection not ready. UPC not sent. Message: ${message}`);
				return;
			}

			// Build the UPC to send.
			let theUPC = `<U><M>${message}</M>`;

			if (args.length > 0)
			{
				theUPC += '<L>';
				for (let arg of args)
				{
					arg = arg?.toString() ?? '';

					// Wrap any non-filter argument that contains a start tag ("<") in CDATA
					if (arg.indexOf('<') != -1)
					{
						if (arg.indexOf('<f t=') != 0)
						{
							arg = `<![CDATA[${arg}]]>`;
						}
					}
					theUPC += `<A>${arg}</A>`;
				}
				theUPC += '</L>';
			}
			theUPC += '</U>';

			// Count the message
			this.numMessagesSent++;

			// Send the UPC to the server
			this.log?.debug(`[MESSAGE_MANAGER] UPC sent: ${theUPC}`);
			this.connectionManager.getActiveConnection()?.send(theUPC);
		}

		sendUPCObject(upc:UPC):void
		{
			//TODO this should work...
			this.sendUPC(upc.method, ...upc.args.slice());
			//this.sendUPC.apply(this, upc.args.slice().unshift(upc.method));
		}

		toString():string
		{
			return '[object MessageManager]';
		}

		private cleanupAfterClosedConnection(connection?:Connection):void
		{
			// TODO: this line is in Reactor but not in Orbiter...
			connection?.removeEventListener(ConnectionEvent.RECEIVE_UPC, this.upcReceivedListener, this);

			if (this.removeListenersOnDisconnect)
			{
				this.log?.info('[MESSAGE_MANAGER] Removing registered message listeners.');
				for (const message in this.messageListeners)
				{
					const listenerList = this.messageListeners[message];
					for (const p in listenerList)
					{
						if (listenerList.hasOwnProperty(p)) this.removeMessageListener(message, listenerList[p].getListenerFunction());
					}
				}
			}
			else
			{
				this.log?.warn(`[MESSAGE_MANAGER] Leaving message listeners registered. Be sure to remove any unwanted message listeners manually.`);
			}

			this.numMessagesReceived = 0;
			this.numMessagesSent = 0;
		}

		private connectFailureListener(e:ConnectionEvent):void
		{
			this.cleanupAfterClosedConnection(e.target as unknown as Connection);
		}

		private disconnectListener(e:ConnectionEvent):void
		{
			this.cleanupAfterClosedConnection(e.target as unknown as Connection);
		}

		private selectConnectionListener(e:ConnectionManagerEvent):void
		{
			if (this.currentConnection)
			{
				this.currentConnection.removeEventListener(ConnectionEvent.RECEIVE_UPC, this.upcReceivedListener, this);
				this.currentConnection.removeEventListener(ConnectionEvent.DISCONNECT, this.disconnectListener, this);
				this.currentConnection.removeEventListener(ConnectionEvent.CONNECT_FAILURE, this.connectFailureListener, this);
			}

			this.currentConnection = e.getConnection() ?? undefined;

			this.currentConnection?.addEventListener(ConnectionEvent.RECEIVE_UPC, this.upcReceivedListener, this);
			this.currentConnection?.addEventListener(ConnectionEvent.DISCONNECT, this.disconnectListener, this);
			this.currentConnection?.addEventListener(ConnectionEvent.CONNECT_FAILURE, this.connectFailureListener, this);
		}

		private upcReceivedListener(e:ConnectionEvent):void
		{
			this.numMessagesReceived++;

			const upc              = e.getUPC(),
			      upcArgs:string[] = [];

			this.log?.debug(`[MESSAGE_MANAGER] UPC received: ${upc}`);

			if (!upc) return;

			const closeMTagIndex = upc.indexOf('</M>'),
			      method         = upc.substring(6, closeMTagIndex);

			let searchBeginIndex = upc.indexOf('<A>', closeMTagIndex);

			while (searchBeginIndex != -1)
			{
				const closeATagIndex = upc.indexOf('</A>', searchBeginIndex);
				let arg = upc.substring(searchBeginIndex + 3, closeATagIndex);

				if (arg.indexOf('<![CDATA[') == 0)
				{
					arg = arg.substr(9, arg.length - 12);
				}
				upcArgs.push(arg);
				searchBeginIndex = upc.indexOf('<A>', closeATagIndex);
			}

			this.notifyMessageListeners(method, upcArgs);
		}
	}
}
