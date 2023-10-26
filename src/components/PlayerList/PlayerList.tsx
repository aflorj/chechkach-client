import { useContext } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';

export default function PlayerList() {
  const context = useContext(LobbyContext);

  return (
    <div>
      {context?.users?.map((user: any) => (
        <div>
          <div>
            <span
              className={`${
                context?.roundWinners?.includes(user?.playerId)
                  ? 'text-green-600'
                  : ''
              }`}
            >
              {user?.playerId}
            </span>
            {user?.playerId === context?.drawingUser && <>✎</>}
          </div>
          <div>{user?.score}</div>
        </div>
      ))}
    </div>
  );
}
