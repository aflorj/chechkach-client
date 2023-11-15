import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

interface ILobbyCardProps {
  lobby: any;
}

export default function LobbyCard({ lobby }: ILobbyCardProps) {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const attemptToJoinJobby = () => {
    setIsJoining(true);

    axios({
      method: 'post',
      url: 'http://localhost:9030/api/joinLobby/',
      // headers: {},
      data: {
        lobbyName: lobby?.name,
        // send socketId to check if we are already in this (or any other?) lobby
        lastKnownSocketId: localStorage?.getItem('localSocketId'),
      },
    })
      .then((res) => {
        if (res?.data?.full) {
          // display full lobbby message
        } else {
          setIsJoining(false);
          console.log('join res: ', res);
          navigate(`/lobby/${lobby?.name}`, {
            state: res?.data?.lobbyInfo,
          });
        }
      })
      .catch((err) => {
        console.error('ta error pri joinu: ', err);
        setIsJoining(false);
      });
  };

  return (
    <div className="lobby-card-wrapper" onClick={() => attemptToJoinJobby()}>
      {lobby?.name}({lobby?.status})({lobby?.players?.length}/2)
    </div>
  );
}
