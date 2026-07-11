document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
  }

  // Booking form: load available slots when a date is picked
  var dateInput = document.getElementById('booking-date');
  var slotSelect = document.getElementById('booking-slot');
  if (dateInput && slotSelect) {
    dateInput.addEventListener('change', function () {
      slotSelect.innerHTML = '<option value="">Loading...</option>';
      fetch('/booking/slots?date=' + encodeURIComponent(dateInput.value))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.slots || !data.slots.length) {
            slotSelect.innerHTML = '<option value="">No slots available this day</option>';
            return;
          }
          slotSelect.innerHTML = '<option value="">Select a slot</option>' +
            data.slots.map(function (s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
        })
        .catch(function () {
          slotSelect.innerHTML = '<option value="">Could not load slots</option>';
        });
    });
  }
});
