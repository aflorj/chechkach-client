import { useContext, useEffect } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import clsx from 'clsx';

export default function PlayerList() {
  const { users, drawingUser, roundWinners } = useContext(LobbyContext);

  useEffect(() => {
    console.log('users ', users);
  }, [users]);

  return (
    <div
      id="players-container"
      className="w-1/2 md:w-5/12 lg:w-48 flex flex-col gap-1 order-2 lg:order-1 ms-auto lg:ms-0 me-0 md:me-2 lg:me-0 pe-2 md:pe-0"
    >
      {users?.map((user: any) => (
        <div className="px-2 py-1 border border-black bg-white">
          <div className="flex justify-between align-middle">
            <div className="self-center">#1</div>
            <div className="flex flex-col ps-2">
              <div
                className={clsx(
                  roundWinners?.includes(user?.playerId) && 'text-green-600',
                  !user.connected && 'line-through',
                  'font-bold text-center'
                )}
              >
                {user?.playerId}
              </div>
              <div className="text-center">{user?.score} točk</div>
            </div>
            <div>{user?.playerId === drawingUser && <>✎</>}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
