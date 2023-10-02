import { Link } from 'react-router-dom';

interface ILandingProps {
  stateUsername: string | undefined;
  setStateUsername: (username: string) => void;
}
export default function Landing({
  stateUsername,
  setStateUsername,
}: ILandingProps) {
  return (
    <div className="h-screen">
      <div className="p-4 mt-8 md:w-1/2 bg-gray-300 mx-auto">
        <div className="flex mb-2">
          <div>Username:</div>
          <input
            className="shadow appearance-none border rounded ms-2"
            value={stateUsername}
            onChange={(e) => setStateUsername(e?.target?.value)}
          />
        </div>
        <Link to="/lobbies">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Check lobbies
          </button>
        </Link>
      </div>
    </div>
  );
}
