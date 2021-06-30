// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from '../../../global/utils/customHooks';

// import form components
// import { EmailInput, PasswordInput } from '../../../global/components/forms';
import { TextInput } from '../../../global/components/forms'

const UserLoginForm = ({
  handleFormSubmit
  , user
}) => {
  const location = useLocation();

  const [updatedUser, handleChange] = useForm(user); // pass user as initialState
  
  const handleSubmit = (e) => {
    e.preventDefault();
    handleFormSubmit(updatedUser)
  }

  return (
    <div className="form-container -skinny">
      <form name="userForm" className="user-form" onSubmit={handleSubmit}>
        <h2> Sign In </h2>
        <hr/>
        <TextInput
          name="username"
          label="Email Address"
          value={updatedUser.username}
          change={handleChange}
          required={true}
        />
        <TextInput
          name="password"
          label="Password"
          value={updatedUser.password}
          change={handleChange}
          required={true}
          // password={true}
        />
        <Link to="/user/forgot-password">
          <em>
            Forgot Password?
          </em>
        </Link>
        <div className="input-group">
          <div className="yt-row right">
            <Link
              className="yt-btn link"
              to={{
                pathname: "/user/register"
                , state: location.state
              }}
            >
              Register
            </Link>
            <button className="yt-btn " type="submit" > Sign in </button>
          </div>
        </div>
      </form>
    </div>
  )
}

UserLoginForm.propTypes = {
  handleFormChange: PropTypes.func.isRequired
  , handleFormSubmit: PropTypes.func.isRequired
  , user: PropTypes.object.isRequired
  , location: PropTypes.object
}

export default UserLoginForm;
