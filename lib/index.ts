import { ZodSchema } from 'zod';
import { TypeSafeStore } from './TypeSafeStore';
import { SecureStoreOptions } from 'expo-secure-store';

const defaultStore = new TypeSafeStore();

const get = <T>(key: string, fallback: T, schema: ZodSchema<T>) => defaultStore.get(key, fallback, schema);

const getAsync = async <T>(key: string, fallback: T, schema: ZodSchema<T>) =>
  await defaultStore.getAsync(key, fallback, schema);

const set = <T>(key: string, value: T) => defaultStore.set(key, value);

const setAsync = async <T>(key: string, value: T) => await defaultStore.setAsync(key, value);

const setWithExpiration = async <T>(key: string, value: T, ttl: number) =>
  await defaultStore.setWithExpiration(key, value, ttl);

const exists = (key: string): boolean => defaultStore.exists(key);

const existsAsync = async (key: string) => await defaultStore.existsAsync(key);

const remove = async (key: string, options?: SecureStoreOptions) => await defaultStore.removeAsync(key, options);

const clear = async () => {
  // Note: SecureStore doesn't have a clear method, so we can't implement this directly
  console.warn('Clear method is not supported by expo-secure-store');
};

const length = async () => {
  // Note: SecureStore doesn't provide a way to get the number of stored items
  console.warn('Length method is not supported by expo-secure-store');
  return 0;
};

export { TypeSafeStore, get, getAsync, set, setAsync, setWithExpiration, exists, existsAsync, remove, clear, length };
