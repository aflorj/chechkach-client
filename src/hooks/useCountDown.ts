import { useEffect, useState } from 'react';

const useCountdown = (targetDate: number) => {
  const [countDown, setCountDown] = useState(
    targetDate - Math.floor(new Date().getTime() / 1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown((prevState) => {
        if (prevState > 0) {
          return prevState - 1;
        }
        clearInterval(interval);
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return countDown;
};

export { useCountdown };
