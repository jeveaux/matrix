$(() => {
  const enterRoom = $('[enter-room]');

  const matrixProfile = new MatrixProfile();

  if (matrixProfile.isProfileStored()) {
    enterInOffice(matrixProfile);
  } else {
    redirectToHome();
  }

  function removeUser(userId) {
    $(`#${userId}`).remove();
  }

  function showUserInRoom(user, room) {
    let userView = $(`#${user.id}`).length;
    if (userView == 0) {
      userView = $(`<img width="50px" id="${user.id}"src="${user.imageUrl}">`);
    } else {
      userView = $(`#${user.id}`).detach();
    }

    $(`#${room}`).append(userView);
  }

  function redirectToHome() {
    window.location.href = './';
  }

  function goToMeet(externalMeetUrl) {
    const r = confirm('Deseja entrar na call?');
    if (r == true) {
		  window.open(externalMeetUrl, '_blank');
    } else {
		  txt = 'You pressed Cancel!';
    }
  }

  function saveLastRoom(data) {
    localStorage.setItem(`last_room${data.user.id}`, data.room);
  }

  function enterInOffice(matrixProfile) {
    const lastRoom = localStorage.getItem(`last_room${matrixProfile.loadStoredProfile().id}`);
    console.log(window.location);
	   	// make connection
    const socket = io.connect(`${window.location.protocol}//${window.location.host}`, {
      query: `user=${matrixProfile.loadStoredProfileAsString()}${lastRoom ? `&room=${lastRoom}` : ''}`,
    });

    enterRoom.on('click', (e) => {
      const room = $(e.target).parent().attr('id');
      socket.emit('enter-room', { room, user: matrixProfile.loadStoredProfile() });
      setTimeout(() => {
        goToMeet($(e.target).attr('external-meet-url'));
      }, 300);
    });

    socket.on('enter-room', (data) => {
      saveLastRoom(data);
      showUserInRoom(data.user, data.room);
    });

    socket.on('disconnect', (userId) => {
      removeUser(userId);
    });
  }
});
