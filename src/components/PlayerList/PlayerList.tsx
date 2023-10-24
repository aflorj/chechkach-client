import { useContext } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';

export default function PlayerList() {
  const context = useContext(LobbyContext);

  return (
    <div>
      {context?.users?.map((user: any) => (
        <div>
          <div>
            {user?.playerId}
            {user?.playerId === context?.drawingUser && <>✎</>}
          </div>
          <div>{user?.score}</div>
        </div>
      ))}
    </div>
  );
}
