const message = process.env.MESSAGE

if (!message) {
  console.log("No MESSAGE provided. App started successfully.")
  
  setInterval(() => {}, 1 << 30) 
}

console.log("Message:", message)
