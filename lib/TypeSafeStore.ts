import { ZodSchema } from 'zod';
import * as SecureStore from 'expo-secure-store';

export class TypeSafeStore {
  /** A string that determines the namespace used for every key within the object. */
  private namespace?: string;

  /**
   * @param namespace - Optional namespace for keys
   */
  constructor(namespace?: string) {
    if (namespace) this.namespace = namespace;
  }

  private isValidJson(value: any): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Returns a namespaced key.
   * @param key - The key to namespace.
   * @returns The namespaced key.
   */
  private getNamespacedKey(key: string): string {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }

  /**
   * Gets the current namespace.
   * @returns Can be undefined.
   */
  public getNamespace(): string | undefined {
    return this.namespace;
  }

  /**
   * Sets a new namespace
   * @param namespace - The namespace.
   * @returns True if success, false if not.
   */
  public setNamespace(namespace: string): boolean {
    if (typeof namespace === 'string') {
      this.namespace = namespace;
      return true;
    }
    return false;
  }

  /**
   * Returns whether the SecureStore API is enabled on the current device.
   * This does not check the app permissions.
   * @returns - True if available, false otherwise.
   */
  static async isAvailableAsync() {
    return await SecureStore.isAvailableAsync();
  }

  /**
   * Helper function to set store values.
   */
  private setFn<T>(key: string, value: T) {
    const namespacedKey = this.getNamespacedKey(key);
    const isPrimitive = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    return {
      key: namespacedKey,
      value: isPrimitive ? String(value) : JSON.stringify(value),
    };
  }

  /**
   * Stores a value in the store.
   * @param key - The key to store the value under.
   * @param value - The value to store. Can be anything.
   */
  set<T>(key: string, value: T) {
    const toStore = this.setFn(key, value);
    SecureStore.setItem(toStore.key, toStore.value);
    return true;
  }

  /**
   * Stores a value in the store asynchronously.
   * @param key - The key to store the value under.
   * @param value - The value to store. Can be anything.
   */
  async setAsync<T>(key: string, value: T) {
    const toStore = this.setFn(key, value);
    await SecureStore.setItemAsync(toStore.key, toStore.value);
    return true;
  }

  /**
   * Stores a value in the store with an expiration time. Always run as async due to expo-secure-store API limitations
   * @param key - The key to store the value under.
   * @param value - The value to store. Can be anything.
   * @param ttl - Time to live in milliseconds.
   */
  async setWithExpiration<T>(key: string, value: T, ttl: number) {
    const toStore = this.setFn(key, value);
    await SecureStore.setItemAsync(toStore.key, toStore.value);
    setTimeout(async () => await SecureStore.deleteItemAsync(toStore.key), ttl);
  }

  /**
   * Retrieves a value from the store.
   * @param key - The key to retrieve the value from.
   * @param fallback - The fallback value if key is not found or does not match the specified T.
   * @param schema - Zod schema to validate the parsed value.
   * @returns - The retrieved value or fallback.
   */
  get<T>(key: string, fallback: T, schema: ZodSchema<T>) {
    const namespacedKey = this.getNamespacedKey(key);
    const item = SecureStore.getItem(namespacedKey);

    if (item === null) return fallback;

    const parsed = this.isValidJson(item) ? JSON.parse(item) : item;

    const result = schema.safeParse(parsed);
    return result.success ? result.data : fallback;
  }

  /**
   * Retrieves a value from the store. Runs asynchronously.
   * @param key - The key to retrieve the value from.
   * @param fallback - The fallback value if key is not found or does not match the specified T.
   * @param schema - Zod schema to validate the parsed value.
   * @returns - The retrieved value or fallback.
   */
  async getAsync<T>(key: string, fallback: T, schema: ZodSchema<T>) {
    const namespacedKey = this.getNamespacedKey(key);
    const item = await SecureStore.getItemAsync(namespacedKey);

    if (item === null) return fallback;

    const parsed = this.isValidJson(item) ? JSON.parse(item) : item;

    const result = schema.safeParse(parsed);
    return result.success ? result.data : fallback;
  }

  /**
   * Removes a key from the store. Always run as async due to expo-secure-store API limitations.
   * @param key - The key to remove.
   */
  async removeAsync(key: string, options?: SecureStore.SecureStoreOptions) {
    try {
      const namespacedKey = this.getNamespacedKey(key);
      await SecureStore.deleteItemAsync(namespacedKey, options);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if the value can be saved with requireAuthentication option enabled.
   *
   * @return `true` if the device supports biometric authentication and the enrolled method is
   * sufficiently secure. Otherwise, returns false. Always returns false on tvOS.
   *
   * @platform android
   * @platform ios
   */
  canUseBiometricAuthentication() {
    return SecureStore.canUseBiometricAuthentication;
  }

  /**
   * Checks if a key exists in storage.
   * @param key - The key to check.
   * @returns - True if exists, false otherwise.
   */
  exists(key: string) {
    const namespacedKey = this.getNamespacedKey(key);
    return SecureStore.getItem(namespacedKey) !== null;
  }

  /**
   * Checks if a key exists in storage. Works asynchronously.
   * @param key - The key to check.
   * @returns - True if exists, false otherwise.
   */
  async existsAsync(key: string) {
    const namespacedKey = this.getNamespacedKey(key);
    const result = await SecureStore.getItemAsync(namespacedKey);
    return result !== null;
  }
}
