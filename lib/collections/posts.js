Posts = new Mongo.Collection('posts');

Posts.allow({
    remove: function(userId, doc) {
      return ownsDocument(userId, doc) || (!!Meteor.user().admin && Meteor.user().admin);
    }
})

validatePost = function (post){
    var errors = {};

    if (!post.title)
        errors.title = "Please fill in a headline";

    if (!post.url)
        errors.url = "Please fill in a URL";

    return errors;
}

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
        var user = Meteor.user();

        check(Meteor.userId(), String);
        check(postAttrs, {
            title: String,
            url: String
        });

        var errors = validatePost(postAttrs);
        if (errors.title || errors.url)
            throwError('invalid-post', 'You must set a title and URL for your post')

        if (!user)
            throwError('user-not-logged-in', "You need to login to edit posts");


        var postWithSameLink = Posts.findOne({ url: postAttrs.url });

        if (postWithSameLink) {
            throwError("duplicate-post-entry", "There seems to be another post with the same url.")
        }

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
