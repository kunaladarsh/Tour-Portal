
const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'post',
      url: 'http://127.0.0.1:7000/api/v1/users/logIn',
      data: {
        email,
        password
      }
    });
    alert(`Hey, ${res.data.data.name}😊, Welecome to ToursApp!🥳`);

  } catch (error) {
    console.log(error)
    alert(`ohh! ${error.response.data.message}❌🥲`);
    // document.getElementById('email').value = "";
    // document.getElementById('password').value = "";
  }
};

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});