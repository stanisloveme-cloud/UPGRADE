import Axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = Axios.create({
  withCredentials: true,
  baseURL: '', // Vite proxy handles the /api prefix or relative paths
});

export const customInstance = <T>(
  urlOrConfig: string | AxiosRequestConfig,
  options?: AxiosRequestConfig | any,
): Promise<T> => {
  const source = Axios.CancelToken.source();

  let finalConfig: any = {};
  if (typeof urlOrConfig === 'string') {
    finalConfig = { url: urlOrConfig, ...options };
    if (finalConfig.body) {
      finalConfig.data = finalConfig.body;
      delete finalConfig.body;
    }
  } else {
    finalConfig = { ...urlOrConfig, ...options };
  }

  const promise = AXIOS_INSTANCE({
    ...finalConfig,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise as Promise<T>;
};

export type ErrorType<Error> = AxiosError<Error>;
