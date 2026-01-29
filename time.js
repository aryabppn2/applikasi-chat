


const  TIME=new Date()

const time={
   h:TIME.getHours(),
   m:TIME.getMinutes()
}
const day={
  d:TIME.getDate(),
  m: TIME.toLocaleString('en-US', { month: 'long' }),
  y:TIME.getFullYear()
}




module.exports={time,day}