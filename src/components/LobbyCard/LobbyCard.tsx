import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { LobbiesApi } from '@aflorj/chechkach-openapi-ts-client';
import { configuration } from '../../apiConfiguration';

interface ILobbyCardProps {
  lobby: any;
}

export default function LobbyCard({ lobby }: ILobbyCardProps) {
  const lobbiesApi = new LobbiesApi(configuration);

  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const attemptToJoinJobby = () => {
    setIsJoining(true);

    lobbiesApi
      .join({
        lobbyName: lobby?.name,
        lastKnownSocketId: localStorage?.getItem('localSocketId')!,
      })
      .then((res) => {
        setIsJoining(false);
        console.log('join res: ', res);
        navigate(`/lobby/${lobby?.name}`, {
          state: res?.data?.gameState,
        });
      })
      .catch((err) => {
        console.error(err?.response?.data?.message);
        setIsJoining(false);
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="lobby-card-wrapper bg-linear-to-r from-white to-green-400 p-2 border border-black rounded-sm mb-2 "
      onClick={() => attemptToJoinJobby()}
    >
      <div className="flex justify-between">
        <div className="font-bold">{lobby?.name}</div>
        <div>({lobby?.players?.length}/10)</div>
      </div>
    </motion.div>
  );
}
