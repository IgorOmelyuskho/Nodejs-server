
$("#investor-register").click(function () {
  var name = $('.auth .name').val();
  var email = $('.auth .email').val();
  var password = $('.auth .password').val();
  axios.post('auth/Investor', { name, email, password })
    .then(response => {
      console.log(response);
    })
});

$("#investor-get").click(function () {
  var email = $('.auth .email').val();
  const params = { email };
  axios.get('auth/Investor', { params })
    .then(response => {
      console.log(response);
    })
});

$("#vendor-register").click(function () {
  var name = $('.auth .name').val();
  var email = $('.auth .email').val();
  var password = $('.auth .password').val();
  axios.post('auth/Vendor', { name, email, password })
    .then(response => {
      console.log(response);
    })
});

$("#vendor-get").click(function () {
  var email = $('.auth .email').val();
  const params = { email };
  axios.get('auth/Vendor', { params })
    .then(response => {
      console.log(response);
    })
});