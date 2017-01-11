Posts = new Mongo.Collection('posts');

Posts.allow({
    update: function (userId, doc, fields, modifier) {
        if (userId && doc.userId === userId) {
            return true;
        }
    },
    remove: function(userId, post) { return ownsDocument(userId, post); }
});

Posts.deny({
    update: function(){ return true; },
    insert: function(){ return true; },
    remove: function(){ return true; }
})

Meteor.methods({
    postEdit: function(postAttrs) {
        var user = Meteor.user(),
            postId = postAttrs._id,
            post = Posts.findOne(postId),
            postWithSameLink;

        check(postAttrs, {
            title: String,
            url: String,
            _id: String
        });


        if (!user)
          throwError('user-not-logged-in', "You need to login to edit posts");

        if (!ownsDocument(user._id, post) || user.admin)
          throwError("does-not-own-post", "Um...you don't seem to own this post");

        postWithSameLink = Posts.findOne({ url: postAttrs.url });

        if (postWithSameLink)
            throwError("duplicate-post-entry", "There seems to be another post with the same url.")

        var result = Posts.update(postAttrs._id, {$set: postAttrs});

        return {
            _id: postAttrs._id
        }
    },

    postInsert: function(postAttrs) {
        check(Meteor.userId(), String);
        check(postAttrs, {
            title: String,
            url: String
        });

        var postWithSameLink = Posts.findOne({ url: postAttrs.url });
        if (postWithSameLink) {
            return {
                postExists: true,
                _id: postWithSameLink._id
            }
        }

        var user = Meteor.user();
        var post = _.extend(postAttrs, {
            userId: user._id,
            author: user.username,
            submitted: new Date()
        });

        var postId = Posts.insert(post)

        return {
            _id: postId
        };
    }
});
