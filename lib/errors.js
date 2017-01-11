throwError = function(error, reason, details) {
  var meteorError = new Meteor.Error(error, reason, details);

  if (Meteor.isClient) {
    return meteorError;
  } else if (Meteor.isServer) {
    throw meteorError;
  }
};

isKnownError = function (error) { 
  var errorName = error && error.error;
  var listOfKnownErrors = [
    'user-not-logged-in', 
    'does-not-own-post', 
    'duplicate-post-entry',
    'invalid-post'
  ];

  return _.contains(listOfKnownErrors, errorName);
};