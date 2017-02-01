# When React state management is like:

![Zaphod Beeblebrox](http://33.media.tumblr.com/807d1e3e5556a9d1fea55faa54e8dbfd/tumblr_msoqb5qUmg1st3jexo8_500.gif)

# What is it?

Redux allows you to manage a state of an application using nested tree structure and an action-reducers mechanism to change the state.

Beeblebrox is inspired by the simplicity of Redis. It uses flat Key-Value state and a simple API similar to Redis to change values. 

String Keys are much easier to generate and work with than any other structures like nested tree. For example, we're free to generate any kind of keys for any purpose:

`state['user:loading']` - an indicator that something is currently loading, let's play a little bit conventions:
`state['user#loading']` - Rails style, `state['user-loading']`.

We can generate complex keys with ease for keeping, for example, article information and article body separately and use string interpolation to access them:
`state[`article#${article.id}`]` for information and `state['article#`article#${article.id}`#body']` for body.

# Connect

Connect is essential. It binds beeblebrox context with the component:

```
import { connect } from 'beeblebrox';

class Home extends Component {
  ...
}

export default connect(Home)
```

Unlike Redux, `connect` in Beeblebrox doesn't require any functions like mapStateToProps.

# Actions

The state cannot be changed directly in order to prevent unexpected side effects.

The `Store` class receives a list of `actions` on instantiating. `actions` is a plain object and could be nested:

```
const actions = {
  messages: {
    send() { ... }
  },
  users: {
    load() { ... }
    logout() { ... },
    payment: {
      check() { ... }
    }
  }
}
const store = new Store({
  actions
})
```

When a component is connected by a `connect` function, a list of actions is passed as a prop in `actions` namespace. Using the example list of actions above, we could call them this way: 

```
class Home extends Component {
  componentWillMount() {
    this.props.actions.messages.send()
    this.props.actions.users.logout()
    this.props.actions.users.payment.check()
  }
  render() { ... }
}

export default connect(Home)
```

The magic is in the context of each action. Beeblebrox binds StateContext which contains all API to work with the state to function's context `this`:

```
// In `users` namespace so it could be called in a component like this.props.actions.users.load()
export async function load() {
  this.del('user:error') // remove error first
  this.set('user:loading', true)

  const { response, error } = await fetchAPI('users.load')

  if (error) {
    this.set('user:error', error)
    return
  }

  this.set('user:loading', false)

  this.set('user', response)
}
```

# Accessing state and lazy binding

`connect` function passes a special function `store` to props which does two things:
- Act as a value getter from the state
- Subscribe a component to update chain using the key passed to `store` function

For example,

```
class Sidebar extends Component {
  render() {
    const user = this.props.store('user')

    const notifications = this.props.store(`notifications#${user.id}`)

    ...
  }
}

export default connect(Sidebar)
```

`Sidebar` component will rerender if either `user` or `notifications#${user.id}` are changed.

# Example

[Example project](https://github.com/antonsekatski/chat)