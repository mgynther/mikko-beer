import { useLoginMutation } from '../store/login/api'

function Login() {
  const [login, { isLoading }] = useLoginMutation();

  function doLogin(event: any) {
    event.preventDefault();
    login({
      username: event.target['username'].value,
      password: event.target['password'].value
    });
    event.target.reset();
  }

  return (
    <div>
      <form onSubmit={(e) => doLogin(e)}>
        <h3>Login</h3>
        <div>
          <label htmlFor='username'>Username:</label>{' '}
          <input type='text' id='username' />
        </div>
        <div>
          <label htmlFor='password'>Password:</label>{' '}
          <input type='password' id='password' />
        </div>

        <br />

        <div>
          <input type='submit'
            value='Login'
            disabled={isLoading}
          />
          {isLoading && ' Loading...'}
        </div>
      </form>
    </div>
  )
}

export default Login;
