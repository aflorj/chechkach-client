import { useContext, useEffect } from 'react';
import { useCountdown } from '../../hooks/useCountDown';
import { LobbyContext } from '../../providers/LobbyProvider';
import { socket } from '../../socket';

export default function CountDown({
  lobbyName,
}: {
  lobbyName: string | undefined;
}) {
  const { allowedToDraw, roundEndTimeStamp, stateUsername } =
    useContext(LobbyContext);

  const countDown = useCountdown(roundEndTimeStamp!);

  const triggerRoundEndByTimer = () => {
    socket.emit('triggerRoundEndByTimer', {
      userName: stateUsername,
      lobbyName: lobbyName,
    });
  };

  useEffect(() => {
    countDown === 0 && allowedToDraw && triggerRoundEndByTimer();
  }, [countDown]);

  return <div>{countDown}</div>;
}
