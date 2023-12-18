import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="lobby-card-wrapper bg-gradient-to-r from-white to-green-400 p-2 border border-black rounded mb-2 "
      onClick={() => attemptToJoinJobby()}
    >
      <div className="flex justify-between">
        <div className="font-bold">{lobby?.name}</div>
        <div>({lobby?.players?.length}/10)</div>
      </div>
    </motion.div>
  );
}
