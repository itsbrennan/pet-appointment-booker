let DB;

const form = document.querySelector('form'),
      petName = document.querySelector('#pet-name'),
      ownerName = document.querySelector('#owner-name'),
      phone = document.querySelector('#phone'),
      date = document.querySelector('#date'),
      hour = document.querySelector('#hour'),
      symptoms = document.querySelector('#symptoms'),
      appointments = document.querySelector('#appointments'),
      appointmentTitle = document.querySelector('#appointment-title');


document.addEventListener('DOMContentLoaded', () => {

  let AppointmentDB = window.indexedDB.open('appointments', 1);

  // if there is a n erro
  AppointmentDB.onerror = function(){
    console.log('There was an error');
  }

  // if everything is fine, assign the result to instance
  AppointmentDB.onsuccess = function(){
    



    // save the result
    DB = AppointmentDB.result;

    // display the appointments
    displayAppointments();
  }

  // This method runs once (great for creating the schema)
  AppointmentDB.onupgradeneeded = function(e){
    // the event will be the database
    let db = e.target.result;
    
    // create an object store
    // keypath is going to be the indexes
    let objectStore = db.createObjectStore('appointments', { keyPath: 'key', autoIncrement: true });
    
    // create index 1. field name 2. keypath 3. options
    objectStore.createIndex('petname', 'petname', {unique: false});
    objectStore.createIndex('ownername', 'ownername', {unique: false});
    objectStore.createIndex('phone', 'phone', {unique: false});
    objectStore.createIndex('date', 'date', {unique: false});
    objectStore.createIndex('hour', 'hour', {unique: false});
    objectStore.createIndex('symptoms', 'symptoms', {unique: false});
  }

  form.addEventListener('submit', addAppointment);

  function addAppointment(e){
    e.preventDefault();

    // create a new object with the form info
    let newAppointment = {
        petname: petName.value,
        ownername: ownerName.value,
        phone: phone.value,
        date: date.value,
        hour: hour.value,
        symptoms: symptoms.value,
    }
    console.log(newAppointment);

    // insert object into DB
    let transaction = DB.transaction(['appointments'], 'readwrite');
    let objectStore = transaction.objectStore('appointments');
    let request = objectStore.add(newAppointment);
    
    // on success
    request.onsuccess = () => {
      form.reset();
    }
    transaction.oncomplete = () => {
      console.log('New appointment added');
      displayAppointments();
    }
    transaction.onerror = () => {
      console.log('Error');
    }
  }

  function displayAppointments(){
    // clear the previous appointments
    while(appointments.firstChild){
      appointments.removeChild(appointments.firstChild);
    }
    // create teh object store
    let objectStore = DB.transaction('appointments').objectStore('appointments');
    objectStore.openCursor().onsuccess = function(e){
      let cursor = e.target.result;
      if(cursor){
        let appointmentHTML = document.createElement('li');
        appointmentHTML.setAttribute('data-appointment-id', cursor.value.key);
        appointmentHTML.classList.add('list-group-item');
        appointmentHTML.innerHTML = `
          <p class = "font-weight-bold">Pet Name: <span class = "font-weight-normal">${cursor.value.petname}</span></p>
          <p class = "font-weight-bold">Owner Name: <span class = "font-weight-normal">${cursor.value.ownername}</span></p>
          <p class = "font-weight-bold">Phone: <span class = "font-weight-normal">${cursor.value.phone}</span></p>
          <p class = "font-weight-bold">Date: <span class = "font-weight-normal">${cursor.value.date}</span></p>
          <p class = "font-weight-bold">Time: <span class = "font-weight-normal">${cursor.value.hour}</span></p>
          <p class = "font-weight-bold">Symptoms: <span class = "font-weight-normal">${cursor.value.symptoms}</span></p>
        `;

        // remove button
        const removeBTN = document.createElement('button');
        removeBTN.classList.add('btn','btn-danger');
        removeBTN.innerHTML = '<span aria-hidden = "true">x</span> Remove'
        removeBTN.onclick = removeAppointment;
        
        // add this into html
        appointmentHTML.appendChild(removeBTN);
        appointments.appendChild(appointmentHTML);
      
        cursor.continue();
      } else {
        if(!appointments.firstChild){
          appointmentTitle.textContent = 'Add a new appointment';
          let noAppointment = document.createElement('p');
          noAppointment.classList.add('text-center');
          noAppointment.textContent = 'No results found';
          appointments.appendChild(noAppointment);
        } else {
          appointmentTitle.textContent = 'Manage your appointments'
        }
      }
    }
  }

  function removeAppointment(e) {

    // get appointment ID
    let appointmentID = Number (e.target.parentElement.getAttribute('data-appointment-id'));

    //use a transaction
    let transaction = DB.transaction(['appointments'], 'readwrite');
    let objectStore = transaction.objectStore('appointments');

    objectStore.delete(appointmentID);
    transaction.oncomplete = () => {
      e.target.parentElement.parentElement.removeChild(e.target.parentElement);
      if(!appointments.firstChild){
        appointmentTitle.textContent = 'Add a new appointment';
        let noAppointment = document.createElement('p');
        noAppointment.classList.add('text-center');
        noAppointment.textContent = 'No results found';
        appointments.appendChild(noAppointment);
      } else {
        appointmentTitle.textContent = 'Manage your appointments'
      }
    }

  }
})