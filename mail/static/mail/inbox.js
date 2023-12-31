document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', sendMail);
  document.querySelector('.card-body').addEventListener('click', getOneMail);
  document.querySelector('#archive').addEventListener('click', updateArchiveToArchived);
  document.querySelector('#unarchive').addEventListener('click', updateArchiveToUnarchived);
  document.querySelector('#reply').addEventListener('click', replyMail);
  // By default, load the inbox
  load_mailbox('inbox');


});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  getMails(mailbox);
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';
  // Show the mailbox name
  const emails_view = document.querySelector('#emails-view');
  emails_view.addEventListener('click', ()=>console.log("sda"));
  if(emails_view.hasChildNodes()){
    emails_view.removeChild(emails_view.firstChild)
  }
  const h3 = document.createElement('h3');
  h3.className = 'h3-title'
  h3.innerText = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
  emails_view.prepend(h3)
 
}
//Display mails
function displayMails(emails,type){
    const cardBody = document.querySelector('.card-body');
    cardBody.innerHTML = '';
    emails.forEach( email => {
      let isRead = email.read === true ? 'card-general-inner-2':'card-general-inner';
      console.log(isRead)
      const newEmail= document.createElement('div');
      newEmail.innerHTML = `
              <div class="card m-1 border border-dark card-general ${isRead} " style="width: 99.4%; height: 5rem;"id="${email.id}">
                <div class="card-body d-flex justify-content-between">
                    <div class="d-flex d-flex justify-content-between font-weight-bold" style="width:70%;" >
                            <p class="h3">${type === 'sent' ? email.recipients : email.sender}</p>
                        <div style="width:50% ">
                            <p class="fs-4 font-weight-light ">${email.subject}...</p>
                        </div>
                     </div>
                        <p class="h3" style="font-weight: lighter;">${email.timestamp}</p>
                 </div>
              </div>
            `
      cardBody.appendChild(newEmail);
  });
}

//Display Mail Detail
function displayMailDetails(email){
  if(email.sender === document.querySelector('.h2-title').innerText){
      document.querySelector('#unarchive').style.display = 'none' 
      document.querySelector('#archive').style.display = 'none' 
  }else{
    if(email.archived === true){
      document.querySelector('#archive').style.display = 'none' 
      document.querySelector('#unarchive').style.display = 'block' 
    }else{
      document.querySelector('#unarchive').style.display = 'none' 
      document.querySelector('#archive').style.display = 'block' 
    }
  }


  document.querySelector('.displayed').setAttribute('id',`${email.id}`);
  const sender = document.querySelector('#sender')
  sender.innerHTML = ` <div> <span class="fw-bolder"> From: </span> ${email.sender}</div>`
  const recipients = document.querySelector('#recipients')
  recipients.innerHTML = ` <div> <span class="fw-bolder"> To: </span> ${email.recipients}</div>`
  const subject = document.querySelector('#subject')
  subject.innerHTML= ` <div> <span class="fw-bolder"> Subject: </span> ${email.subject}</div>`
  const timestamp = document.querySelector('#timestamp')
  timestamp.innerHTML= ` <div> <span class="fw-bolder"> Timestamp: </span> ${email.timestamp}</div>`
  const body = document.querySelector('#full-mail');
  body.innerText = `${email.body}`;
}
//Display Mail Details
async function getOneMail(e){
  e.preventDefault();
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-detail').style.display = 'block';
    const emailID = e.target.closest('.card-general').getAttribute('id');
    if(emailID === "not-email"){
      load_mailbox('inbox')
      return
    }
     console.log(emailID);
    const email = await fetch(`/emails/${emailID}`)
      .then(response => response.json())
    
    //mark it as read
    console.log(email);
    updateRead(emailID);
    displayMailDetails(email);
}

//Update read status
function updateRead(emailID){
  fetch(`/emails/${emailID}`, {
  method: 'PUT',
  body: JSON.stringify({
      read: true
  })
})
}

//update archive status
function updateArchiveToArchived(e){
  e.preventDefault();
  const emailID = e.target.closest('.displayed').getAttribute('id');
  document.querySelector('#archive').style.display = 'none';
  document.querySelector('#unarchive').style.display = 'block';
  fetch(`/emails/${emailID}`, {
   method: 'PUT',
   body: JSON.stringify({
      archived: true
    })
  })
setTimeout(() => {
  load_mailbox('inbox');
  },10);
}
function updateArchiveToUnarchived(e){
  e.preventDefault();
  const emailID = e.target.closest('.displayed').getAttribute('id');
  document.querySelector('#archive').style.display = 'block';
  document.querySelector('#unarchive').style.display = 'none';
  fetch(`/emails/${emailID}`, {
   method: 'PUT',
   body: JSON.stringify({
      archived:false 
    })
  })
  setTimeout(() => {
  load_mailbox('inbox');
  }, 10);
}
//get all the mails
async function getMails(mailbox){
  //fetch the inbox, sent or archived
  const allEmails = await fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  displayMails(allEmails,mailbox)
}
async function replyMail(e){
  e.preventDefault();

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail').style.display = 'none';


  const emailID = e.target.closest('.displayed').getAttribute('id');
  const email = await fetch(`/emails/${emailID}`)
                .then(response => response.json())
  console.log(email);
  const subject = email.subject;
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = `${email.sender}`;
  document.querySelector('#compose-subject').value = `${ subject.charAt(0)+subject.charAt(1)+subject.charAt(2)+' ' === 'Re: ' ? email.subject : 'Re: ' +email.subject } `;
  document.querySelector('#compose-body').value = `
  -----------------------------------------------------------
  On ${email.timestamp}  ${email.sender} wrote: ${email.body}`;
  
}


//Send Mails
function sendMail(e){
  e.preventDefault();
  try{
  fetch('/emails',{
    method:'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value,
    })
  })
  .then((response) => response.json())
  .then( result => {
    console.log(result)
    if(Object.keys(result)[0] === 'error'){
      displayError(result);
    }
    else{
      displaySuccess(result)
      load_mailbox('sent');
    }
  })
  }catch(error){
    console.log(error);
    displayError(error)
  };

}

//Display errors
function displayError(error){
    const error1 = document.querySelector('#error-1');
    error1.style.display = 'block';
    error1.innerHTML=
        `<div  class="alert alert-danger" role="alert">${error.error}</div>`;
    setTimeout(() => {
      error1.style.display = 'none';
    }, 3000);
}

//Display success
function displaySuccess(success){
    const success1= document.querySelector('#success-1');
    success1.style.display = 'block';
    success1.innerHTML=
        `<div  class="alert alert-success" role="alert">${success.message}</div>`;
    setTimeout(() => {
      success1.style.display = 'none';
    }, 3000);
}