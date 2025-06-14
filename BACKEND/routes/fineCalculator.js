export const calculateFine = (dueDate) => {
  const finePerHour = 0.1 // ten cents

  const today = new Date();
  if(today > dueDate){
    const timeDifference = today - dueDate; // in milliseconds
    const hoursOverdue = Math.ceil(timeDifference / (1000 * 60 * 60)); // convert to hours
    return hoursOverdue * finePerHour; // calculate fine  
  }
  return 0; // no fine if not overdue
}