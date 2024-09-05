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
  document.getElementById('email').value = "";
  document.getElementById('password').value = "";
};

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'post',
      url: 'http://127.0.0.1:3000/api/v1/users/logIn',
      data: {
        email,
        password
      },
    });

    if (res.data.status === 'Success') {
      showAlert('success', `Hey, ${res.data.data.name}😊, Welecome to ToursApp!🥳`);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  }catch (error) {
    showAlert('error', `ohh! ${error.response.data.message}🥲`);
  }
};

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});