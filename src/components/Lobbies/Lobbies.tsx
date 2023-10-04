import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import LobbyCard from '../LobbyCard/LobbyCard';

export default function Lobbies() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [lobbies, setLobbies] = useState<any>();

  const [lobbyName, setLobbyName] = useState('');

  const fetchLobbies = () => {
    axios
      .get('http://localhost:9030/api/getAllLobbies')
      .then((res) => {
        setIsLoading(false);
        console.log('lobbies:', res?.data?.lobbies);
        setLobbies(res?.data?.lobbies);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        setLobbies([]);
      });
  };

  const createLobby = () => {
    axios({
      method: 'post',
      url: 'http://localhost:9030/api/createLobby',
      // headers: {},
      data: {
        lobbyName: lobbyName,
        // posljemo tud svoje ime?
      },
    })
      .then((res) => {
        console.log('createLobby response: ', res);
        // ze tu ujamemo ce ni kul ?
        navigate(`/lobby/${res?.data?.lobbyName}`);
      })
      .catch((err) => {
        console.error('ta error pri kreaciji: ', err);
      });
  };

  useEffect(() => {
    fetchLobbies();
  }, []);

  useEffect(() => {
    console.log('lobbies:  ', lobbies);
  }, [lobbies]);

  return (
    <div>
      <div>
        <button onClick={() => fetchLobbies()} disabled={isLoading}>
          refresh
        </button>
        <span>Lobbies:</span>
        <div id="lobbies-wrapper">
          {lobbies?.length! > 0 ? (
            lobbies?.map((lobby: any) => <LobbyCard lobby={lobby} />)
          ) : (
            <span>No lobbies...</span>
          )}
        </div>
      </div>
      <div>
        <input
          value={lobbyName}
          onChange={(e) => setLobbyName(e?.target?.value)}
        />
        <button onClick={() => createLobby()}>Create lobby</button>
      </div>
    </div>
  );
}
