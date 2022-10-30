const API_KEY = process.env.MAIL_API_KEY;
const DOMAIN = process.env.MAIL_DOMAIN;
const BIRTH_DATE = process.env.BIRTH_DATE;

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const birth = JSON.parse(process.env.BIRTH_DATE);
const { add, intervalToDuration, parse } = require("date-fns")

const today = add(new Date(), { days: 1});
function calculateFullAge(dob) {
  const birthDate = parse(dob, "yyyy-MM-dd", new Date());
  const { years, months, days } = intervalToDuration({ start: birthDate, end: today});
  return { years, months, days };
}

const messages = [];
const emails = Object.keys(birth).reduce((rs, key) => {
  const {years, months, days} = calculateFullAge(birth[key])
  if(months === 0 && days <= 1) {
    rs.push(key);
    messages.push(`${days === 0 ? 'Tomorrow' : 'Today'} is birthday of ${key} ${years} ages`);
  }
  return rs;
}, []);
if (emails.length) {
  const mailgun = new Mailgun(formData);
  const client = mailgun.client({username: 'api', key: API_KEY});
  
  const messageData = {
    from: `${process.env.MAIL_SENDER} <${process.env.SENDER_EMAIL}>`,
    to: 'khac.tam.94@gmail.com',
    subject: 'Birthday Notification',
    text: `${messages.join(',\n')}`
  };
  
  client.messages.create(DOMAIN, messageData)
   .then((res) => {
     console.log(res);
   })
   .catch((err) => {
     console.error(err);
   });
  
}
