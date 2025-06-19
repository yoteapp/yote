[Docs](./) / Tutorial

Tutorial
========

Every data object in Yote is treated as a resource module &mdash; meaning a bundle of relatively self-contained services that exist on the front-end (modules) or backend (resources). Yote comes with two on init: `Users` and `Products`.

Almost every data-driven app we build relies on a user object with login authentication, varying roles and permissions, etc.  The `User` resource module should be useful for every project.

The `Product` resource module is a general purpose example. In this tutorial, we'll add blog posts to go along with `Products`.


## Add a new resource module called 'post'
****

From the root directory of `MyApp` run the following:

```
$ yote add post
```

This will add Posts as a resource for the server, and a module for the client and mobile, each with verbosely named CRUD files.  

```
MyApp/
  --- server/           
    ...
    |_ resources/
      |_ posts/          # data model, api and controllers
        |_ PostModal.js
        |_ postsApi.js
        |_ postsController.js
    ...
  --- client/           
    ...
    |_ modules/
      |_ posts/          # actions, reducers, routes, styles and components
        |_ components/
          |_ CreatePost.js.jsx
          |_ PostForm.js.jsx
          |_ PostLayout.js.jsx
          |_ PostList.js.jsx
          |_ PostListItem.js.jsx
          |_ SinglePost.js.jsx
          |_ UpdatePost.js.jsx
        |_ postActions.js
        |_ postReducer.js
        |_ postRoutes.js.jsx
        |_ postStyles.scss
    ...            
  --- mobile/          
    |_ MyApp/      
      ...
      |_ js/                
        |_ modules/
          |_ posts/      # actions, reducers, styles and components  
            |_ components/
              |_ CreatePost.js
              |_ PostList.js
              |_ PostListItem.js
              |_ SinglePost.js
              |_ UpdatePost.js
            |_ postActions.js
            |_ postReducer.js
            |_ postStyles.js
      ...                
```



## Define the Post data model
****

All Yote resource modules come defined with `name`, `created`, and `updated` by default.

```js
// define post schema
var postSchema = mongoose.Schema({
  created:                { type: Date, default: Date.now }
  , updated:              { type: Date, default: Date.now }
  , name:                 { type: String }
});
```

Let's add some `content`, give them an `author` and give it a status.

In `MyApp/server/resources/posts/PostModel.js` add new fields to the schema.

```js
// define post schema
var postSchema = mongoose.Schema({
  created:                { type: Date, default: Date.now }
  , updated:              { type: Date, default: Date.now }
  , name:                 { type: String }
  , content:              { type: String }
  , _author:              { type: ObjectId, ref: 'User' } // points to 'User' object
  , status:               { type: String, enum: ['draft', 'published', 'deleted'], default: 'draft' }
});
```

> **Note** Yote uses Mongoose.js as an ORM for MongoDB.  For more on defining schemas with Mongoose, refer to their [documentation](http://mongoosejs.com/docs/guide.html)

Let's limit `Post` creation only to logged in users.  In `/posts/postsApi.js`:

```js
  // change
  router.post('/api/posts'              , posts.create);

  // to
  router.post('/api/posts'              , requireLogin(), posts.create);
```

> **NOTE:** the logic for `requireLogin()` and `requireRole()` lives in `/server/router/api-router.js`

Now let's associate any new `Post` with this logged in user. In `/posts/postsController.js`:

```js
  // ...
  exports.create = function(req, res) {
    var post = new Post({});
    for(var k in req.body) {
      if(req.body.hasOwnProperty(k)) {
        post[k] = req.body[k];
      }
    }

    // make _author tied to the logged in user
    post._author = req.user._id;

    post.save(function(err, post) {
      if(err) {
        res.send({ success: false, message: err });
      } else if(!post) {
        res.send({ success: false, message: "Could not create post :(" });
      } else {
        console.log("created new post");
        res.send({ success: true, post: post });
      }
    });
  }

  // ...

```



## Navigate to the post list in the web
****

Yote builds the route file in the web client for you in `MyApp/client/modules/post/postRoutes.js.jsx`.  Let's checkout the list view on `localhost:3233/posts`

_**NOTE** add screenshot here_

Nothing there! Let's make a new post.  




## Edit the PostForm
****

We'll need to edit `postReducer.js` and `PostForm.js.jsx` to accommodate the schema additions.  

First in `postReducer.js`, add new schema items to the defaultItem:

```js
    // ...
    function post(state = {
      // define fields for a "new" post
      // a component that creates a new object should store a copy of this in it's state
      defaultItem: {
        name: ""
        , content: ""
        , _author: ""
        , status: "draft"
      }
      , byId: {} // map of all items
      , selected: { // single selected entity
        id: null
        , isFetching: false
        , error: null
        , didInvalidate: false
        , lastUpdated: null
      }
      , lists: {} //individual instances of the postList reducer above
    }, action)
    // ...
```

Next, in `PostForm.js.jsx`, add input fields for `content` and `status`

```jsx
  // ...

  // import form components
  import {
    TextInput,
    TextAreaInput,
    SelectFromArray,
  } from '../../../global/components/forms';

  // ...

  <TextAreaInput
    name="content"
    label="Content"
    value={post.content}
    change={handleFormChange}
    required={true}
    placeholder="This is where the content goes..."
  />
  <SelectFromArray
    name="status"
    label="Status:"
    items={["draft","published","featured"]}
    value={post.status}
    change={handleFormChange}
  />

  // ...
```


## Create a new post in the web client
****

Now we can navigate to `localhost:3233/posts/new` to create a new `post`.  

Once that's done, we can navigate back to the `/posts` list to see the final creation.  

> **NOTE:** this list page is just fetching everything by default, regardless of `status`.  Refer to the [Yote Mobile docs](./mobile/) for more on lists and filters.  


## Show the post
****

In the post show page, notice that you only see the `name` field of the post. We need to modify `PostListItem.js.jsx` and `SinglePost.js.jsx` to see `_author` and `content`.

In `PostListItem.js.jsx`, let's show the Author's first and last name and the date it was created.  

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import Base from "../../../global/components/BaseComponent.js.jsx";
import { connect } from 'react-redux';
import { Link } from 'react-router';

// import libraries
import moment from 'moment';  // add in moment.js for date formatting

// import actions
import * as postActions from '../postActions';
import * as userActions from '../../user/userActions'; // NOTE: pull in the user actions to fetch the post._author info

class SinglePost extends Base {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const { dispatch, params } = this.props;
    dispatch(postActions.fetchSingleIfNeeded(params.postId));
    dispatch(userActions.fetchListIfNeeded()); // let's just get all users for now
  }

  render() {
    const { selectedPost, postMap, userMap } = this.props;
    const isEmpty = (!selectedPost.id || !postMap[selectedPost.id] || postMap[selectedPost.id].title === undefined || selectedPost.didInvalidate);

    return  (
      <div className="flex">
        <section className="section">
          <div className="yt-container">
            <h3>Single Post Item</h3>
            <p>By: {userMap[postMap[selectedPost.id]._author].firstName} {userMap[postMap[selectedPost.id]._author].lastName} on {moment(postMap[selectedPost.id].created).calendar()}</p>
            {isEmpty ?
                (selectedPost.isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
              :
                <div style={{ opacity: selectedPost.isFetching ? 0.5 : 1 }}>
                  <h1> {postMap[selectedPost.id].title}</h1>
                  <hr/>
                  <p>{postMap[selectedPost.id].content}</p>
                </div>
            }
          </div>
        </section>
      </div>
    )
  }
}

SinglePost.propTypes = {
  dispatch: PropTypes.func.isRequired
}

const mapStoreToProps = (store) => {
  return {
    selectedPost: store.post.selected
    , postMap: store.post.byId
    , userMap: store.user.byId // add userMap to props
  }
}

export default connect(
  mapStoreToProps
)(SinglePost);


```

Voila! We have a post!


## View posts on mobile
****

Let's see if we can view this new post on mobile. Open the iOS simulator and login.

> Remember, the login credentials are `admin@admin.com` &mdash; pswd: `admin`


****

<div><a style="float: left;" href="./getting-started">&larr; Previous</a>  <a style="float: right;" href="./server/">Next &rarr;</a> </div>
