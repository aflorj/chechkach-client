import { useContext } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';

export default function PlayerList() {
  const { users, drawingUser, roundWinners } = useContext(LobbyContext);

  return (
    <div>
      {users?.map((user: any) => (
        <div>
          <div>
            <span
              className={`${
                roundWinners?.includes(user?.playerId) ? 'text-green-600' : ''
              }`}
            >
              {user?.playerId}
            </span>
            {user?.playerId === drawingUser && <>✎</>}
          </div>
          <div>{user?.score}</div>
        </div>
      ))}
    </div>
  );
}
