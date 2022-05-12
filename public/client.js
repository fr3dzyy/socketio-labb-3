const socket = io()

const formUser = document.querySelector('#formUser')
const inputUser = document.querySelector('#inputUser')
const messages = document.querySelector('#messages')
const formMessage = document.querySelector('#formMessage')
const inputMessage = document.querySelector('#inputMessage')
const userContainer = document.querySelector('#userContainer')

const diceButton = document.querySelector('#diceButton')
const userData = document.querySelector('#userData')
const playerData = document.querySelector('#playerData')

let myUser

formUser.addEventListener('submit', function (e) {
  e.preventDefault()
  myUser = inputUser.value
  userContainer.innerHTML = '<h2>Welcome ' + myUser + '!' + '</h2>'
  document.getElementById('user').style.display = 'none'
  document.getElementById('message').style.display = 'block'

  showButton()
})

formMessage.addEventListener('submit', function (e) {
  e.preventDefault()
  if (inputMessage.value) {
    socket.emit('chatMessage', { user: myUser, message: inputMessage.value })
    inputMessage.value = ''
  }
})

let totalAmount = 0
let count = 0

diceButton.addEventListener('click', function (e) {
  e.preventDefault()

  let randomNumber = Math.floor(Math.random() * 6 + 1)
  totalAmount = totalAmount + randomNumber
  count++

  socket.emit('newRoll', {
    user: myUser,
    count: count,
    value: randomNumber,
    totalAmount: totalAmount,
  })
})

socket.on('newChatMessage', function (data) {
  let item = document.createElement('li')
  item.textContent = data
  messages.appendChild(item)
})

socket.on('newUserData', function (data) {
  let item = document.createElement('li')
  item.textContent = data
  userData.prepend(item)

  playerData.textContent = data
})

function showButton() {
  if (inputUser.value) {
    diceButton.disabled = false
  }
}
