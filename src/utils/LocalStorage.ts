const getData = (key: string): unknown | undefined => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return undefined;
  }

  try {
    const data = window.localStorage.getItem(key);

    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Read from local storage', error);
  }
};

const setData = (key: string, value: unknown): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Save in local storage', error);
  }
};

export { getData, setData };
