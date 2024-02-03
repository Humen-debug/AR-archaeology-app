export abstract class PersistentState<T> {
  abstract localSave(): Promise<boolean>;
  abstract localDelete(): Promise<boolean>;
  abstract fromStorage(): Promise<T | undefined>;

  abstract toJson(): any;
  abstract fromJson(json: any): T;
}
