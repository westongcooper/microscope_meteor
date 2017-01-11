Template.postEdit.onCreated(function(){
    Session.set('postEditErrors', {});
});

Template.postEdit.helpers({
    errorMessage: function(field){
        return Session.get('postEditErrors')[field];
    },
    errorClass: function (field) {
        return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
    }
});

Template.postEdit.events({
    'submit form': function(e, t) {
        e.preventDefault();

        var currentPostId = this._id;

        var post = {
            _id: currentPostId,
            url: $(e.target).find('[name=url]').val(),
            title: $(e.target).find('[name=title]').val()
        }

        var errors = validatePost(post);
        if (errors.title || errors.url)
            return Session.set('postEditErrors', errors);

        Meteor.call('postEdit', post, function(error, result) {
            if (isKnownError(error)) {
                return sAlert.error(error.reason);
            } else if (error) {
                return sAlert.error("An unknown error occurred while saving the post");
            } 

            Router.go('postPage', {_id: result._id});
        })
    },

    'click .delete': function(e) {
        e.preventDefault();

        if (confirm("Delete this post?")) {
            var currentPostId = this._id;
            Posts.remove(currentPostId);
            Router.go('postsList');
        }
    }
})
