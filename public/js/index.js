const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
const showAlert = (type, msg, time = 2) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, time * 1000);
};

const loginBtn = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');


if (loginBtn)
  loginBtn.addEventListener('submit', e => {
    e.preventDefault();
    document.querySelector('.btn--green').textContent = 'Login...';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
    document.getElementById('email').value = "";
    document.getElementById('password').value = "";
  });


if (logOutBtn)
  logOutBtn.addEventListener('click', e => {
    e.preventDefault();
    logout();
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    if (password !== passwordConfirm) {
      showAlert('error', `Confirm password are not same`);
      return;
    }
    passwordUpdate(passwordCurrent, password, passwordConfirm);
  });


if(userDataForm){
  userDataForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--green').textContent = 'Updating...';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    updateUserData(name, email);
  })
}


// Api calling
const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/logIn',
      data: {
        email,
        password
      },
    });

    if (res.data.status === 'Success') {
      showAlert('success', `Hey, ${res.data.data.name}😊, Welecome to ToursApp!🥳`);
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (error) {
    showAlert('error', `ohh! ${error.response.data.message}🥲`);
  }
  document.querySelector('.btn--green').textContent = 'Login';
};

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    console.log(res);
    if (res.data.status === 'Success') {
      showAlert('success', `${res.data.message}..`);
      window.setTimeout(() => {
        location.assign('/login');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};

const updateUserData = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'api/v1/users/updateMe',
      data: {
        name, email
      },
    });

    if (res.data.status === 'Success') {
      showAlert('success', `${res.data.message}`);
      window.setTimeout(() => {
        location.assign('/login');
      }, 1000);
    } else if (res.data.status === 'Fail') {
      showAlert('error', `${res.data.message}.`);
    }
  } catch (error) {
    showAlert('error', `${error.response.data.message}🥲`);
  }
  document.querySelector('.btn--green').textContent = 'Save Settings';
};



const passwordUpdate = async (password, newPassword, newPasswordConfirm) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'api/v1/users/update.password',
      data: {
        password,
        newPassword,
        newPasswordConfirm
      },
    });

    if (res.data.status === 'Success') {
      showAlert('success', `${res.data.message}`);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else if (res.data.status === 'Fail') {
      showAlert('error', `${res.data.message}.`);
    }
  } catch (error) {
    showAlert('error', `${error.response.data.message}🥲`);
  }
  document.querySelector('.btn--save-password').textContent = 'Save password';
};