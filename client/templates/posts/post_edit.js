Template.postEdit.events({
    'submit form': function(e) {
        e.preventDefault();

        var currentPostId = this._id;

        var post = {
            url: $(e.target).find('[name=url]').val(),
            title: $(e.target).find('[name=title]').val()
        }

        Meteor.call('postEdit', post, function(error, result) {
            if (error) 
                return alert(error.reason);

            if(result.postExists)
                console.log('This link has already been posted')

            Router.go('postPage', {_id: currentPostId});
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
