const findFriendsOfFriends = (user) => {
  let recs = user.friends
    .map((friend) =>
      friend.friends.map((friendeFriend) =>
        friendeFriend.id == friend.id || friendeFriend.id == user.id
          ? 0
          : friendeFriend
      )
    )
    .flat();

  for (let i = 0; i < recs.length; i++) {
    for (let j = 0; j < user.friends.length; j++) {
      if (recs[i].id == user.friends[j].id) {
        recs[i] = 0;
      }
    }
  }

  let filtered = recs.filter((rec) => rec !== 0);

  let addMutual = filtered.map((rec) => {
    return {
      id: rec.id,
      username: rec.username,
      mutuals: mutualFriends(user, rec),
    };
  });

  let final = addMutual.filter(
    (obj, index, self) => index === self.findIndex((t) => t.id == obj.id)
  );

  return final;
};

const mutualFriends = (user, comparee) => {
  let userFriendsIds = user.friends.map((friend) => friend.id);

  let all = userFriendsIds.concat(comparee.friends);

  let mutuals = [];

  for (let i = 0; i < all.length - 1; i++) {
    for (let j = i + 1; j < all.length; j++) {
      if (all[i].toString() == all[j].toString()) {
        mutuals.push(all[i]);
      }
    }
  }

  return { count: mutuals.length, mutuals };
};

module.exports = { findFriendsOfFriends, mutualFriends };
