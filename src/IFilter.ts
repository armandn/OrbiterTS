namespace net.user1.orbiter.filters 
{
	/**
	 * The IFilter interface defines the methods that must be implemented by Orbiter's filter 
	 * classes; filter classes are used to specify a logical group of clients, typically for the 
	 * sake of targeted messaging. For example, a filter class could be used to specify "all 
	 * moderators in a meeting room," or "all spectators of a celebrity chat," or "all players
	 * with a certain minimum score in a game." Orbiter filter classes can be used with any 
	 * client-to-server command that supports filtering -- primarily the "send message to clients" 
	 * commands, such as the [[Room.sendMessage]] method.
	 *
	 * The built-in Filter, [[AttritbuteFilter]], and [[FilterSet]] classes all implement IFilter, 
	 * and are used to create messaging filters. Let's consider a filtering example demonstrating 
	 * the usage of the AttributeFilter class. Imagine a trivia game with two teams of clients in 
	 * the same room: a "red team" and a "blue team". When a client on the red team wants to send a 
	 * chat message to teammates only, it uses a Room's sendMessage() method with a filter limiting 
	 * recipients to the red team. The filter relies on an attribute named "team" that is set 
	 * whenever a player joins a team. The attribute indicates the client's team, and is scoped to 
	 * the trivia game room.
	 * 
	 * To send a message to the red team, the sending client first creates an
	 * AttributeFilter (the most common type of filter):
	 * ```
	 *     const filter = new AttributeFilter();
	 * ```
	 * 
	 * Next, the client creates an [[AttributeComparison]] object, which specifies the attribute 
	 * name and value that clients must have in order to receive the team-chat message:
	 * 
	 * ```
	 *     const comparison = new AttributeComparison("triviaroom.team", "red", CompareType.EQUAL);
	 * ```
	 *
	 * The preceding code stipulates that a client's "triviaroom.team" attribute must have the value 
	 * "red" in order for that client to receive the message. CompareType.EQUAL indicates the type 
	 * of comparison made on the attribute value. Other compare types are "not equal," "less than," 
	 * "less than or equal," "greater than," and "greater than or equal."
	 *
	 * To add the preceding AttributeComparison to the filter, the sending client uses the filter's 
	 * addComparison() method.
	 * 
	 * And finally, the client sends the chat message to the trivia room, with the filter included 
	 * in the sendMessage() call:
	 *
	 * ```
	 *     room.sendMessage("TEAMCHAT", true, filter, "Anyone know the answer?");
	 * ```
	 * Now suppose the sending client wants to send another team message, but this time only to the 
	 * experts on the team, with ranking 10 or above. The client simply adds the additional 
	 * "ranking" comparison to the filter, and sends the message. For brevity, this time the client 
	 * creates the AttributeComparison inline.
	 *
	 * ```
	 *     filter.addComparison(new AttributeComparison("triviaroom", 10,
	 *     CompareType.GREATER_THAN_OR_EQUAL));
	 *     room.sendMessage("TEAMCHAT", true, filter, "Anyone know the answer?");
	 * ```
	 * 
	 * Notice that the two comparisons in Example 1 have a Boolean "AND" relationship in the filter. 
	 * That is, the message is sent to any client whose team is "red" AND whose ranking is 10 or 
	 * greater. All attribute filter comparisons use AND comparisons, but nested OR and AND
	 * comparisons can be created with the [[AndGroup]] and [[OrGroup]] classes. For example, the 
	 * following uses an OrGroup instance to send a help message to all clients in the room 
	 * "presentation" that have the attribute "role" set to either "moderator" OR "admin". This
	 * time, the attribute is scoped to the room "presentation". Once again, we start by creating 
	 * the attribute filter.
	 *
	 * ```
	 *     var filter:AttributeFilter = new AttributeFilter();
	 * ```
	 *
	 * Next, we create an OrGroup instance to contain the two attribute comparisons:
	 *
	 * ```
	 *     var orGroup:OrGroup = new OrGroup();
	 * ```
	 *
	 * Then we add the attribute comparisons to the OrGroup:
	 *
	 * ```
	 *     orGroup.addComparison(new AttributeComparison("presentation.role", "admin",
	 *     CompareType.EQUAL));
	 *     orGroup.addComparison(new AttributeComparison("presentation.role", "moderator",
	 *     CompareType.EQUAL));
	 * ```
	 *
	 * Finally, we add the OrGroup to the filter and send the message:
	 *
	 * ```
	 *     filter.addComparison(orGroup);
	 *     room.sendMessage("HELP", false, filter, "How do I change my password?");
	 * ```
	 *
	 * OrGroup objects can be mixed with AndGroup objects to create complex Boolean relationships.
	 */
	export interface IFilter
	{
		/**
		 * Returns a string containing the XML representation of this filter, suitable for
		 * transmission to Union Server.
		 */
		toXMLString ():String
	}
}
