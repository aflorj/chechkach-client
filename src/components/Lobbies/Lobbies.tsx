import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import LobbyCard from '../LobbyCard/LobbyCard';
import Button from '../Button/Button';
import { motion } from 'framer-motion';

export default function Lobbies() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [lobbies, setLobbies] = useState<any>();

  const [lobbyName, setLobbyName] = useState('');

  const [isFocused, setIsFocused] = useState(false);

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
    <div
      id="lobbies-container"
      className="bg-transparent mx-auto rounded px-4 lg:px-0"
    >
      <div
        id="title-zone"
        className="flex justify-between bg-white rounded p-2 border border-black"
      >
        <div>Pridruži se igri</div>
        <Button
          variant="primary"
          isDisabled={isLoading}
          onClick={() => fetchLobbies()}
        >
          Osveži
        </Button>
      </div>

      <div
        id="lobbies-and-create-lobby-wrapper"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
      >
        <div id="lobbies-wrapper" className="bg-transparent">
          {isLoading ? (
            <></>
          ) : lobbies?.length > 0 ? (
            lobbies.map((lobby: any) => <LobbyCard lobby={lobby} />)
          ) : (
            <div className="bg-white w-100 h-12 border border-black rounded flex">
              <div className="m-auto">Na voljo ni nobene igre. :(</div>
            </div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          id="create-lobby-form"
          className="bg-white p-4 border border-black"
        >
          <div className="relative mt-2">
            <input
              value={lobbyName}
              onChange={(e) => setLobbyName(e?.target?.value)}
              type="text"
              id="room_name"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="room_name"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-gray-500 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              Ime sobe
            </label>
          </div>
          <Button
            variant="primary"
            onClick={() => createLobby()}
            className="mt-2"
          >
            Ustvari igro
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
